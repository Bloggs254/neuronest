import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './dom-fixture.mjs';

// Controllable timing adapter, not a GSAP implementation. These cases exercise
// the site's response to asynchronous completion/reversal and preferences;
// they do not claim to verify GSAP rendering, easing, paint or browser layout.
function controlledGsap({ reduce = false, failSetup = false } = {}) {
  const timelines = [];
  return {
    timelines,
    matchMedia: () => ({
      add(queries, callback) { return callback({ conditions: { reduce, compact: true, desktop: false }, add: callback => callback() }); },
      revert() {}
    }),
    timeline(options = {}) {
      if (failSetup) throw new Error('Animation engine unavailable');
      const timeline = {
        position: 0, killed: false, direction: null,
        fromTo() { return this; }, addLabel() { return this; },
        play() { this.direction = 'forward'; return this; },
        reverse() { this.direction = 'reverse'; return this; },
        time() { return this.position; },
        advance(value) { this.position = value; return this; },
        kill() { this.killed = true; },
        revert() { this.killed = true; },
        progress(value) { this.position = value; if (value === 1) options.onComplete?.(); return this; },
        completeReverse() { options.onReverseComplete?.(); }
      };
      timelines.push(timeline);
      return timeline;
    }
  };
}

test('missing GSAP leaves guide and inquiry actions fully functional', async () => {
  const app = createApp({ loadMotion: true });
  await app.click('#assistant-launch');
  assert.equal(app.get('#assistant').hidden, false);
  await app.click('#assistant-close');
  assert.equal(app.get('#assistant').hidden, true);
  app.form.elements.name.value = 'Amina';
  app.form.elements.email.value = 'amina@example.com';
  app.form.elements.service.value = 'AI assistants';
  app.form.elements.message.value = 'Help answer customer questions.';
  await app.submit();
  assert.equal(app.get('#inquiry-result').hidden, false);
  assert.match(app.get('#send-whatsapp').href, /^https:\/\/wa\.me\//);
});

test('reduced motion uses stable panel states and creates no animation', async () => {
  const gsap = controlledGsap({ reduce: true });
  const app = createApp({ loadMotion: true, reducedMotion: true, gsap });
  await app.click('#assistant-launch');
  assert.equal(app.get('#assistant').hidden, false);
  assert.equal(app.get('#assistant').inert, false);
  await app.click('#assistant-close');
  assert.equal(app.get('#assistant').hidden, true);
  assert.equal(app.get('#assistant').inert, true);
  assert.equal(gsap.timelines.length, 0);
});

test('a late reverse callback cannot hide a guide reopened by the visitor', async () => {
  const gsap = controlledGsap();
  const app = createApp({ loadMotion: true, gsap });
  await app.click('#assistant-launch');
  const timeline = gsap.timelines[0];
  timeline.advance(0.1);
  await app.click('#assistant-close');
  assert.equal(app.get('#assistant').inert, true);
  await app.click('#assistant-launch');
  timeline.completeReverse();
  assert.equal(app.get('#assistant').hidden, false);
  assert.equal(app.get('#assistant').inert, false);
  assert.equal(app.get('#assistant-launch').getAttribute('aria-expanded'), 'true');
});

test('switching to reduced motion settles a closing panel and removes animation styles', async () => {
  const gsap = controlledGsap();
  const app = createApp({ loadMotion: true, gsap });
  await app.click('#assistant-launch');
  const timeline = gsap.timelines[0];
  timeline.advance(0.1);
  app.get('#assistant').style.opacity = '.8';
  app.get('#assistant').style.transform = 'translateY(3px)';
  await app.click('#assistant-close');
  await app.media.change(true);
  assert.equal(timeline.killed, true);
  assert.equal(app.get('#assistant').hidden, true);
  assert.equal(app.get('#assistant').style.opacity, undefined);
  assert.equal(app.get('#assistant').style.transform, undefined);
  await app.click('#assistant-launch');
  assert.equal(app.get('#assistant').hidden, false);
  assert.equal(gsap.timelines.length, 1);
});

test('hiding a tab settles the latest panel intent without a stale animation', async () => {
  const gsap = controlledGsap();
  const app = createApp({ loadMotion: true, gsap });
  await app.click('#assistant-launch');
  gsap.timelines[0].advance(0.1);
  await app.click('#assistant-close');
  app.document.hidden = true;
  await app.document.emit('visibilitychange');
  assert.equal(app.get('#assistant').hidden, true);
  assert.equal(gsap.timelines[0].killed, true);
});

test('panel animation setup failure keeps app controls usable', async () => {
  const app = createApp({ loadMotion: true, gsap: controlledGsap({ failSetup: true }) });
  await app.click('#assistant-launch');
  assert.equal(app.get('#assistant').hidden, false);
  assert.equal(app.get('#assistant-launch').getAttribute('aria-expanded'), 'true');
  await app.click('#assistant-close');
  assert.equal(app.get('#assistant').hidden, true);
  assert.equal(app.get('#assistant-launch').getAttribute('aria-expanded'), 'false');
});
