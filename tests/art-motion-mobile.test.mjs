import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Lifecycle adapter only. Real browser checks verify GSAP rendering and media styles.
const source = readFileSync(new URL('../dist/art-motion.js', import.meta.url), 'utf8');
function mobileArtwork({ reduce = false } = {}) {
  function target() {
    const listeners = new Map();
    return {
      listeners, style: {}, complete: true, naturalWidth: 640,
      getAttribute: () => null, removeAttribute() {}, setAttribute() {},
      addEventListener(type, callback) { const items = listeners.get(type) || new Set(); items.add(callback); listeners.set(type, items); },
      removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
      emit(type) { for (const callback of listeners.get(type) || []) callback(); }
    };
  }
  const image = target(), artwork = target(), hero = target();
  const observers = [], timelines = [], cleanups = [];
  const document = Object.assign(target(), {
    hidden: false,
    querySelector: selector => ({ '.hero-art img': image, '.hero-art': artwork, '.hero-inner': hero })[selector]
  });
  const gsap = {
    matchMedia: () => ({ add(query, callback) {
      if (!reduce && !query.includes('min-width')) cleanups.push(callback());
    } }),
    quickTo() { throw new Error('Cursor tracking must not initialise on phones'); },
    set() { throw new Error('Phone arrival must not transform the cursor layer'); },
    timeline() {
      const item = {
        fromTo(element, from, to) { this.target = element; this.from = from; this.toState = to; return this; },
        to() { return this; }, progress() { this.settled = true; }, kill() { this.killed = true; }
      };
      timelines.push(item);
      return item;
    }
  };
  class Observer {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(element) { this.target = element; }
    disconnect() { this.disconnected = true; }
    enter(ratio) { this.callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]); }
  }
  const window = Object.assign(target(), { gsap, IntersectionObserver: Observer });
  vm.runInNewContext(source, { window, document, IntersectionObserver: Observer, matchMedia: () => ({ matches: true }) });
  return { image, artwork, hero, observers, timelines, cleanups };
}

test('phone arrival waits until visible, plays once and never enables cursor tracking', () => {
  const app = mobileArtwork();
  assert.equal(app.timelines.length, 0);
  app.observers[0].enter(0.05);
  assert.equal(app.timelines.length, 0);
  app.observers[0].enter(0.4);
  assert.equal(app.timelines.length, 1);
  assert.equal(app.timelines[0].target, app.artwork);
  assert.equal(app.hero.listeners.get('pointermove'), undefined);
  app.observers[0].enter(0);
  assert.equal(app.timelines[0].settled, true);
  app.observers[0].enter(0.8);
  assert.equal(app.timelines.length, 1);
  app.cleanups.forEach(cleanup => cleanup());
  assert.equal(app.observers[0].disconnected, true);
  assert.equal(app.timelines[0].killed, true);
  assert.equal(app.image.listeners.get('load').size, 0);
});

test('reduced-motion phones create neither an arrival nor a pointer controller', () => {
  const app = mobileArtwork({ reduce: true });
  assert.equal(app.timelines.length, 0);
  assert.equal(app.observers.length, 0);
  assert.equal(app.hero.listeners.size, 0);
  assert.equal(app.image.listeners.size, 0);
});
