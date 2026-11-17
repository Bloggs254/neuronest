'use strict';
// A local illustration, never a simulated live integration or a customer-data collector.
(() => {
  const examples = {
    enquiry: { source: 'From your website', message: '“Hi, can you help me build an online store?”', process: 'Understand. Organise. Route.', resultLabel: 'For your customer', result: 'A useful first response', teamLabel: 'For your team', team: 'A clear project enquiry', description: 'An assistant collects the basics and passes the conversation to your team.' },
    stock: { source: 'From your stock workflow', message: '“This product is running low. What needs restocking?”', process: 'Track. Check. Flag.', resultLabel: 'For your stock records', result: 'An up-to-date overview', teamLabel: 'For your team', team: 'A restock task to review', description: 'A connected inventory workflow can flag low stock so your team knows what needs attention.' },
    lead: { source: 'From your campaign', message: '“I’m interested. Can someone tell me more?”', process: 'Capture. Organise. Follow up.', resultLabel: 'For your new lead', result: 'A clear next step', teamLabel: 'For your team', team: 'A follow-up in the right place', description: 'A campaign enquiry becomes an organised lead for your team to follow up.' }
  };
  const buttons = [...document.querySelectorAll('[data-scenario]')];
  const fields = { source: 'demo-source', message: 'demo-message', process: 'demo-process', resultLabel: 'demo-result-label', result: 'demo-result', teamLabel: 'demo-team-label', team: 'demo-team', description: 'demo-description' };
  for (const button of buttons) button.addEventListener('click', () => {
    const example = examples[button.dataset.scenario];
    if (!example) return;
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
    for (const [key, id] of Object.entries(fields)) document.getElementById(id).textContent = example[key];
  });
  document.getElementById('open-guide')?.addEventListener('click', () => {
    const launch = document.getElementById('assistant-launch');
    if (launch.getAttribute('aria-expanded') !== 'true') launch.click();
    else document.getElementById('assistant-close').focus();
  });
})();
