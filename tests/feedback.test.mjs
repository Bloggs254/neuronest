import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareFeedback } from '../dist/feedback-core.js';

test('feedback is a reviewable encoded draft to the fixed business address', () => {
  const fields = { understanding: 'You build stock tools & websites.', unclear: 'What happens after a quote?', interest: 'Not sure' };
  const draft = prepareFeedback(fields);
  const url = new URL(draft.href);
  assert.equal(url.pathname, 'neuronest@gmail.com');
  assert.equal(url.searchParams.get('body'), draft.text);
  assert.ok(draft.text.includes(fields.understanding));
});
test('feedback rejects missing answers, oversized input and unknown choices', () => {
  const valid = { understanding: 'Build websites', interest: 'Yes' };
  for (const change of [{ understanding: '' }, { understanding: 'x'.repeat(401) }, { unclear: 'x'.repeat(601) }, { interest: 'other' }]) assert.throws(() => prepareFeedback({ ...valid, ...change }));
});
