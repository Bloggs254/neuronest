import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './dom-fixture.mjs';

function fillInquiry(app) {
  Object.assign(app.form.elements.name, { value: ' Amina ' });
  app.form.elements.business.value = 'Example Shop';
  app.form.elements.email.value = 'amina@example.com';
  app.form.elements.service.value = 'Custom business systems';
  app.form.elements.message.value = 'Track stock across our two locations.';
}

test('a prepared inquiry has actual line breaks and usable contact drafts', async () => {
  const app = createApp();
  fillInquiry(app);
  await app.submit();
  const url = new URL(app.get('#send-whatsapp').href);
  const message = url.searchParams.get('text');
  assert.equal(app.get('#inquiry-result').hidden, false);
  assert.match(message, /\n\nName: Amina\nBusiness: Example Shop/);
  assert.doesNotMatch(message, /\\n/);
  assert.match(app.get('#send-email').href, /^mailto:neuronest@gmail\.com\?/);
});

test('editing or selecting a service invalidates every prepared action', async () => {
  let copies = 0;
  const app = createApp({ clipboardWrite: async () => { copies++; } });
  fillInquiry(app);
  await app.submit();
  await app.form.emit('change');
  assert.equal(app.get('#inquiry-result').hidden, true);
  assert.equal(app.get('#send-whatsapp').getAttribute('href'), null);
  assert.equal(app.get('#send-email').getAttribute('href'), null);
  await app.click('#copy-inquiry');
  assert.equal(copies, 0);
  await app.submit();
  await app.serviceButtons[0].emit('click');
  assert.equal(app.get('#inquiry-result').hidden, true);
  assert.equal(app.get('#send-whatsapp').getAttribute('href'), null);
  assert.equal(app.document.activeElement, app.form.elements.service);
});

test('clipboard completion cannot restore feedback from an edited inquiry', async () => {
  let resolveCopy;
  const app = createApp({ clipboardWrite: () => new Promise(resolve => { resolveCopy = resolve; }) });
  fillInquiry(app);
  await app.submit();
  const pendingCopy = app.click('#copy-inquiry');
  await app.form.emit('input');
  resolveCopy();
  await pendingCopy;
  assert.equal(app.get('#copy-status').textContent, '');
  assert.equal(app.get('#inquiry-result').hidden, true);
});

test('clipboard rejection after an edit also leaves the new draft feedback clear', async () => {
  let rejectCopy;
  const app = createApp({ clipboardWrite: () => new Promise((_, reject) => { rejectCopy = reject; }) });
  fillInquiry(app);
  await app.submit();
  const pendingCopy = app.click('#copy-inquiry');
  await app.form.emit('input');
  rejectCopy(new Error('Clipboard permission denied'));
  await pendingCopy;
  assert.equal(app.get('#copy-status').textContent, '');
});

test('an invalid form does not prepare or reveal contact actions', async () => {
  const app = createApp();
  app.form.valid = false;
  await app.submit();
  assert.equal(app.get('#inquiry-result').hidden, true);
  assert.equal(app.get('#send-whatsapp').getAttribute('href'), null);
});

test('guide close/reopen preserves answers and completed brief prefills the inquiry', async () => {
  const app = createApp();
  await app.click('#assistant-launch');
  await app.chooseService(3);
  await app.answer('Example Shop in Nairobi');
  await app.click('#assistant-close');
  assert.equal(app.get('#assistant').hidden, true);
  assert.equal(app.document.activeElement, app.get('#assistant-launch'));
  await app.click('#assistant-launch');
  await app.answer('Keep our stock counts consistent');
  await app.answer('Within a month');
  assert.equal(app.get('#chat-form').hidden, true);
  await app.choose('Review my project brief');
  assert.equal(app.get('#assistant').hidden, true);
  assert.equal(app.form.elements.service.value, 'Custom business systems');
  assert.match(app.form.elements.message.value, /Nairobi\n\nChallenge:/);
  assert.match(app.form.elements.message.value, /Within a month/);
  assert.equal(app.document.activeElement, app.form.elements.name);
  assert.equal(app.get('#inquiry-result').hidden, true);
});

test('rapid launcher toggles settle on the latest open/closed intent', async () => {
  const app = createApp();
  await app.click('#assistant-launch');
  await app.click('#assistant-launch');
  await app.click('#assistant-launch');
  assert.equal(app.get('#assistant').hidden, false);
  assert.equal(app.get('#assistant-launch').getAttribute('aria-expanded'), 'true');
  await app.click('#assistant-close');
  assert.equal(app.get('#assistant').hidden, true);
  assert.equal(app.get('#assistant-launch').getAttribute('aria-expanded'), 'false');
});

test('the optional motion adapter receives panel intent without owning ARIA state', async () => {
  const calls = [];
  const app = createApp({ motion: { setPanel(element, open) { calls.push(open); element.hidden = !open; } } });
  await app.click('#assistant-launch');
  await app.click('#assistant-launch');
  await app.click('#assistant-launch');
  assert.deepEqual(calls.slice(-3), [true, false, true]);
  assert.equal(app.get('#assistant').hidden, false);
  assert.equal(app.get('#assistant-launch').getAttribute('aria-expanded'), 'true');
  await app.click('#assistant-close');
  assert.equal(app.get('#assistant').hidden, true);
  assert.equal(app.get('#assistant-launch').getAttribute('aria-expanded'), 'false');
  assert.equal(app.document.activeElement, app.get('#assistant-launch'));
});

test('Start again clears the guide and a fresh service remains selectable', async () => {
  const app = createApp();
  await app.chooseService(0);
  await app.answer('A prior answer');
  await app.click('#chat-restart');
  assert.equal(app.get('#chat-form').hidden, true);
  assert.equal(app.get('#chat-options').children.length, 6);
  assert.doesNotMatch(app.get('#chat-messages').textContent, /A prior answer/);
  await app.chooseService(1);
  assert.equal(app.get('#chat-form').hidden, false);
});

test('mobile navigation closes with Escape and when returning to desktop', async () => {
  const app = createApp();
  await app.click('.menu-toggle');
  assert.equal(app.get('#nav').classList.contains('open'), true);
  await app.document.emit('keydown', { key: 'Escape' });
  assert.equal(app.get('#nav').classList.contains('open'), false);
  assert.equal(app.document.activeElement, app.get('.menu-toggle'));
  await app.click('.menu-toggle');
  app.window.innerWidth = 1280;
  await app.window.emit('resize');
  assert.equal(app.get('.menu-toggle').getAttribute('aria-expanded'), 'false');
});

test('reduced motion preserves service selection and uses immediate navigation', async () => {
  const app = createApp({ reducedMotion: true });
  await app.serviceButtons[0].emit('click');
  assert.equal(app.get('#contact').lastScroll.behavior, 'auto');
  assert.equal(app.form.elements.service.value, app.serviceButtons[0].dataset.service);
  fillInquiry(app);
  await app.submit();
  assert.equal(app.get('#inquiry-result').hidden, false);
});

test('Escape leaves the guide open while the privacy dialog is in front', async () => {
  const app = createApp();
  await app.click('#assistant-launch');
  app.get('#privacy-dialog').open = true;
  await app.document.emit('keydown', { key: 'Escape' });
  assert.equal(app.get('#assistant').hidden, false);
  app.get('#privacy-dialog').open = false;
  await app.document.emit('keydown', { key: 'Escape' });
  assert.equal(app.get('#assistant').hidden, true);
});
