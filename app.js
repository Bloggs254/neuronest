'use strict';

const $ = (selector) => document.querySelector(selector);
const form = $('#project-form');
const serviceSelect = form.elements.service;
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Interaction machines are intentionally small and local to this static page.
// DOM attributes/classes are projections of state, not independent sources of truth.

// Progressive enhancement: without IntersectionObserver the content stays visible.
if (!prefersReducedMotion.matches && 'IntersectionObserver' in window) {
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

// Mobile navigation: closed <-> open. Keep ARIA and visual state in sync.
const menuButton = $('.menu-toggle');
const nav = $('#nav');
let navState = 'closed';
function setNavState(next, { restoreFocus = false } = {}) {
  if (next !== 'closed' && next !== 'open') return;
  navState = next;
  menuButton.setAttribute('aria-expanded', String(navState === 'open'));
  nav.classList.toggle('open', navState === 'open');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => setNavState(navState === 'open' ? 'closed' : 'open'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setNavState('closed')));
document.addEventListener('click', event => {
  if (navState === 'open' && !nav.contains(event.target) && !menuButton.contains(event.target)) setNavState('closed');
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 760 && navState === 'open') setNavState('closed');
});

// Project inquiry: editing -> prepared -> editing. Any edit invalidates its
// generated message and channel links so a visitor cannot copy stale details.
const inquiry = { phase: 'editing', message: '', copy: 'idle' };
const inquiryResult = $('#inquiry-result');
const whatsappLink = $('#send-whatsapp');
const emailLink = $('#send-email');
const copyStatus = $('#copy-status');
function invalidateInquiry() {
  inquiry.phase = 'editing';
  inquiry.message = '';
  inquiry.copy = 'idle';
  inquiryResult.hidden = true;
  whatsappLink.removeAttribute('href');
  emailLink.removeAttribute('href');
  copyStatus.textContent = '';
}

document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => {
  serviceSelect.value = button.dataset.service;
  invalidateInquiry();
  $('#contact').scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
  serviceSelect.focus({ preventScroll: true });
}));

$('#year').textContent = new Date().getFullYear();

// Privacy uses the browser's native dialog state, including focus trapping and Escape.
const privacyDialog = $('#privacy-dialog');
['#privacy-open', '#privacy-footer'].forEach(id => $(id).addEventListener('click', () => privacyDialog.showModal()));
$('#privacy-close').addEventListener('click', () => privacyDialog.close());
privacyDialog.addEventListener('click', event => {
  if (event.target !== privacyDialog) return;
  const bounds = privacyDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) privacyDialog.close();
});

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const business = String(data.get('business') || '').trim() || 'Not specified';
  const email = String(data.get('email') || '').trim();
  const service = String(data.get('service') || '');
  const challenge = String(data.get('message') || '').trim();
  inquiry.message = `Hello NeuroNest, I'd like to discuss a project.\n\nName: ${name}\nBusiness: ${business}\nEmail: ${email}\nService: ${service}\n\nChallenge / goals:\n${challenge}\n\nBudget range: ${data.get('budget')}\nTimeline: ${data.get('timeline')}`;
  inquiry.phase = 'prepared';
  inquiry.copy = 'idle';

  whatsappLink.href = 'https://wa.me/254747700610?text=' + encodeURIComponent(inquiry.message);
  emailLink.href = 'mailto:neuronest@gmail.com?subject=' + encodeURIComponent('Project inquiry — ' + service) + '&body=' + encodeURIComponent(inquiry.message);
  copyStatus.textContent = '';
  inquiryResult.hidden = false;
  inquiryResult.scrollIntoView({ block: 'nearest', behavior: 'auto' });
});
form.addEventListener('input', invalidateInquiry);
form.addEventListener('change', invalidateInquiry);

$('#copy-inquiry').addEventListener('click', async () => {
  if (inquiry.phase !== 'prepared' || !inquiry.message) return;
  try {
    await navigator.clipboard.writeText(inquiry.message);
    inquiry.copy = 'copied';
    copyStatus.textContent = 'Copied.';
  } catch {
    inquiry.copy = 'unavailable';
    copyStatus.textContent = 'Copy unavailable. Use WhatsApp or email above.';
  }
});

// Guide flow: service -> business -> challenge -> timeline -> handoff -> contact.
// Closing the panel preserves progress; Start again resets both state and transcript.
const GUIDE_TRANSITIONS = {
  service: ['business'],
  business: ['challenge'],
  challenge: ['timeline'],
  timeline: ['handoff'],
  handoff: ['contact'],
  contact: []
};
const assistantPanel = $('#assistant');
const assistantLaunch = $('#assistant-launch');
const assistantClose = $('#assistant-close');
const messages = $('#chat-messages');
const options = $('#chat-options');
const chatForm = $('#chat-form');
const chatInput = $('#chat-input');
const guide = { panel: 'closed', flow: 'service', lead: {} };
const descriptions = {
  'Websites & ecommerce': 'We can discuss a business website or online store shaped around your customers and goals.',
  'AI assistants': 'We can explore an assistant that answers approved questions, collects inquiries, and hands over when a person is needed.',
  'Workflow automation': 'We can explore connecting your tools and automating repetitive steps, reminders, and follow-ups.',
  'Custom business systems': 'We can discuss a system for your operations, including inventory management. Our current inventory project is still in development.',
  'Marketing & lead generation': 'We can discuss landing pages, social content, lead capture, and customer follow-up automation.',
  'Help me figure it out': 'Let’s start with the everyday challenge. NeuroNest can help explore which kind of solution would fit.'
};

function setGuidePanel(next, { restoreFocus = false } = {}) {
  if (next !== 'closed' && next !== 'open') return;
  guide.panel = next;
  assistantPanel.hidden = guide.panel === 'closed';
  assistantLaunch.setAttribute('aria-expanded', String(guide.panel === 'open'));
  if (guide.panel === 'open') assistantClose.focus();
  else if (restoreFocus) assistantLaunch.focus();
}

function transitionGuide(next) {
  if (!GUIDE_TRANSITIONS[guide.flow]?.includes(next)) return false;
  guide.flow = next;
  return true;
}

function bubble(text, user = false) {
  const node = document.createElement('div');
  node.className = 'chat-bubble' + (user ? ' user' : '');
  node.textContent = text;
  messages.append(node);
  messages.scrollTop = messages.scrollHeight;
}

function choices(items) {
  options.replaceChildren();
  items.forEach(([label, callback]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', callback);
    options.append(button);
  });
}

function ask(text, expectedAnswerState) {
  if (guide.flow !== expectedAnswerState) return;
  options.replaceChildren();
  bubble(text);
  chatForm.hidden = false;
  chatInput.value = '';
  chatInput.focus();
}

function startGuide() {
  guide.flow = 'service';
  guide.lead = {};
  messages.replaceChildren();
  options.replaceChildren();
  chatForm.hidden = true;
  bubble('Hello! Let’s find a useful next step for your business. What would you like help with?');
  choices(Object.keys(descriptions).map(service => [service, () => {
    if (!transitionGuide('business')) return;
    guide.lead.service = service;
    bubble(service, true);
    bubble(descriptions[service]);
    ask('What kind of business do you run, and where are you based?', 'business');
  }]));
}

function showHandoff() {
  if (guide.flow !== 'handoff') return;
  chatForm.hidden = true;
  bubble('Your project brief is ready to take to the inquiry form. Add your contact details and choose WhatsApp or email to send it. Pricing and commitments need a tailored quote.');
  choices([
    ['Review my project brief ↗', () => {
      serviceSelect.value = guide.lead.service;
      form.elements.business.value = guide.lead.business;
      form.elements.message.value = `Business and location: ${guide.lead.business}\n\nChallenge: ${guide.lead.challenge}\n\nPreferred timeline: ${guide.lead.timeline}`;
      invalidateInquiry();
      setGuidePanel('closed');
      $('#contact').scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
      form.elements.name.focus({ preventScroll: true });
    }],
    ['Talk to a person now ↗', () => {
      if (!transitionGuide('contact')) return;
      bubble('You can contact NeuroNest directly. This guide cannot send an alert automatically.');
      const message = `Hello NeuroNest, I would like to speak with you about ${guide.lead.service}.\n\nBusiness: ${guide.lead.business}\nChallenge: ${guide.lead.challenge}\nTimeline: ${guide.lead.timeline}`;
      const link = document.createElement('a');
      link.href = 'https://wa.me/254747700610?text=' + encodeURIComponent(message);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Continue on WhatsApp ↗';
      choices([]);
      options.append(link);
    }]
  ]);
}

assistantLaunch.addEventListener('click', () => setGuidePanel(guide.panel === 'open' ? 'closed' : 'open'));
assistantClose.addEventListener('click', () => setGuidePanel('closed', { restoreFocus: true }));
$('#chat-restart').addEventListener('click', startGuide);

chatForm.addEventListener('submit', event => {
  event.preventDefault();
  const answer = chatInput.value.trim();
  if (!answer) return;
  bubble(answer, true);

  if (guide.flow === 'business' && transitionGuide('challenge')) {
    guide.lead.business = answer;
    ask('What problem would you most like to solve? Please leave out sensitive information.', 'challenge');
  } else if (guide.flow === 'challenge' && transitionGuide('timeline')) {
    guide.lead.challenge = answer;
    ask('When would you ideally like to get started? “Not sure yet” is fine.', 'timeline');
  } else if (guide.flow === 'timeline' && transitionGuide('handoff')) {
    guide.lead.timeline = answer;
    showHandoff();
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (guide.panel === 'open' && !privacyDialog.open) setGuidePanel('closed', { restoreFocus: true });
  if (navState === 'open') setNavState('closed', { restoreFocus: true });
});

startGuide();
