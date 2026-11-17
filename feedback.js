import { prepareFeedback } from './feedback-core.js';
const form = document.getElementById('feedback-form');
const result = document.getElementById('feedback-result');
const link = document.getElementById('feedback-email');
const error = document.getElementById('feedback-error');
function invalidate() {
  result.hidden = true;
  link.removeAttribute('href');
  document.getElementById('feedback-review').value = '';
  error.textContent = '';
}
form.addEventListener('input', invalidate);
form.addEventListener('change', invalidate);
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  try {
    const prepared = prepareFeedback(Object.fromEntries(new FormData(form)));
    link.href = prepared.href;
    document.getElementById('feedback-review').value = prepared.text;
    result.hidden = false;
  } catch (e) { error.textContent = e.message; }
});
