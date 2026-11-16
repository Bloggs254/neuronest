'use strict';
const $ = (selector) => document.querySelector(selector);
const form = $('#project-form');
const serviceSelect = form.elements.service;
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.section-heading,.service,.project,.steps article,.project-form,.faq-items details');
  document.documentElement.classList.add('motion-ready');
  revealTargets.forEach((element, index) => {
    element.classList.add('reveal');
    if (element.classList.contains('service')) element.style.transitionDelay = `${(index % 3) * 70}ms`;
  });
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
  revealTargets.forEach(element => revealObserver.observe(element));
}
const menu = $('.menu-toggle');
menu.addEventListener('click', () => { const expanded = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(expanded)); $('#nav').classList.toggle('open', expanded); });
document.querySelectorAll('#nav a').forEach(link => link.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); $('#nav').classList.remove('open'); }));
document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => { serviceSelect.value = button.dataset.service; $('#contact').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); serviceSelect.focus({ preventScroll: true }); }));
$('#year').textContent = new Date().getFullYear();
const privacy = $('#privacy-dialog');
['#privacy-open', '#privacy-footer'].forEach(id => $(id).addEventListener('click', () => privacy.showModal()));
$('#privacy-close').addEventListener('click', () => privacy.close());
privacy.addEventListener('click', event => { if (event.target === privacy) { const r = privacy.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) privacy.close(); } });
let inquiry = '';
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  inquiry = `Hello NeuroNest, I'd like to discuss a project.\n\nName: ${data.get('name').trim()}\nBusiness: ${data.get('business').trim() || 'Not specified'}\nEmail: ${data.get('email').trim()}\nService: ${data.get('service')}\n\nChallenge / goals:\n${data.get('message').trim()}\n\nBudget range: ${data.get('budget')}\nTimeline: ${data.get('timeline')}`;
  $('#send-whatsapp').href = 'https://wa.me/254747700610?text=' + encodeURIComponent(inquiry);
  $('#send-email').href = 'mailto:neuronest@gmail.com?subject=' + encodeURIComponent('Project inquiry — ' + data.get('service')) + '&body=' + encodeURIComponent(inquiry);
  $('#inquiry-result').hidden = false;
  $('#inquiry-result').scrollIntoView({ block: 'nearest', behavior: 'auto' });
});
form.addEventListener('input', () => { $('#inquiry-result').hidden = true; $('#copy-status').textContent = ''; });
$('#copy-inquiry').addEventListener('click', async () => { try { await navigator.clipboard.writeText(inquiry); $('#copy-status').textContent = 'Copied.'; } catch { $('#copy-status').textContent = 'Copy unavailable. Use WhatsApp or email above.'; } });
const assistant = $('#assistant');
const launch = $('#assistant-launch');
function closeAssistant() { assistant.hidden = true; launch.setAttribute('aria-expanded', 'false'); launch.focus(); }
launch.addEventListener('click', () => { assistant.hidden = !assistant.hidden; launch.setAttribute('aria-expanded', String(!assistant.hidden)); if (!assistant.hidden) $('#assistant-close').focus(); });
$('#assistant-close').addEventListener('click', closeAssistant);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !assistant.hidden && !privacy.open) closeAssistant(); });
const messages = $('#chat-messages');
const options = $('#chat-options');
const chatForm = $('#chat-form');
let stage = 'service';
let lead = {};
const descriptions = {
  'Websites & ecommerce': 'We can discuss a business website or online store shaped around your customers and goals.',
  'AI assistants': 'We can explore an assistant that answers approved questions, collects inquiries, and hands over when a person is needed.',
  'Workflow automation': 'We can explore connecting your tools and automating repetitive steps, reminders, and follow-ups.',
  'Custom business systems': 'We can discuss a system for your operations, including inventory management. Our current inventory project is still in development.',
  'Marketing & lead generation': 'We can discuss landing pages, social content, lead capture, and customer follow-up automation.',
  'Help me figure it out': 'Let’s start with the everyday challenge. NeuroNest can help explore which kind of solution would fit.'
};
function bubble(text, user = false) { const node = document.createElement('div'); node.className = 'chat-bubble' + (user ? ' user' : ''); node.textContent = text; messages.append(node); messages.scrollTop = messages.scrollHeight; }
function choices(items) { options.replaceChildren(); items.forEach(([label, callback]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', callback); options.append(b); }); }
function ask(text, next) { stage = next; options.replaceChildren(); bubble(text); chatForm.hidden = false; $('#chat-input').value = ''; $('#chat-input').focus(); }
function startGuide() { messages.replaceChildren(); lead = {}; stage = 'service'; chatForm.hidden = true; bubble('Hello! Let’s find a useful next step for your business. What would you like help with?'); choices(Object.keys(descriptions).map(service => [service, () => { lead.service = service; bubble(service, true); bubble(descriptions[service]); ask('What kind of business do you run, and where are you based?', 'business'); }])); }
function showHandoff() {
  chatForm.hidden = true;
  bubble('Your project brief is ready to take to the inquiry form. Add your contact details and choose WhatsApp or email to send it. Pricing and commitments need a tailored quote.');
  choices([['Review my project brief ↗', () => { serviceSelect.value = lead.service; form.elements.business.value = lead.business; form.elements.message.value = `Business and location: ${lead.business}\n\nChallenge: ${lead.challenge}\n\nPreferred timeline: ${lead.timeline}`; $('#inquiry-result').hidden = true; closeAssistant(); $('#contact').scrollIntoView(); form.elements.name.focus({ preventScroll: true }); }], ['Talk to a person now ↗', () => { bubble('You can contact NeuroNest directly. This guide cannot send an alert automatically.'); options.replaceChildren(); const a = document.createElement('a'); a.href = 'https://wa.me/254747700610?text=' + encodeURIComponent('Hello NeuroNest, I would like to speak with you about ' + lead.service + '.\n\nBusiness: ' + lead.business + '\nChallenge: ' + lead.challenge + '\nTimeline: ' + lead.timeline); a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Continue on WhatsApp ↗'; options.append(a); }]]);
}
chatForm.addEventListener('submit', event => { event.preventDefault(); const text = $('#chat-input').value.trim(); if (!text) return; bubble(text, true); if (stage === 'business') { lead.business = text; ask('What problem would you most like to solve? Please leave out sensitive information.', 'challenge'); } else if (stage === 'challenge') { lead.challenge = text; ask('When would you ideally like to get started? “Not sure yet” is fine.', 'timeline'); } else if (stage === 'timeline') { lead.timeline = text; stage = 'complete'; showHandoff(); } });
$('#chat-restart').addEventListener('click', startGuide);
startGuide();
