'use strict';
// Local capability explorer. No AI calls, visitor storage or automatic messaging.
(() => {
  const capabilities = {"websites": {"name": "Websites & ecommerce", "word": "Web.", "title": "A better first impression.\nA clearer next step.", "lead": "We shape the content, design and customer journey around what you sell and who you want to reach.", "points": ["Business websites and focused landing pages", "Online stores and product catalogues", "Mobile layouts, enquiry forms and clear navigation"], "href": "services/websites.html"}, "ai-assistants": {"name": "AI assistants", "word": "Assist.", "title": "A helpful first response.\nA human when it matters.", "lead": "An assistant can handle routine questions and collect the details your team needs, with a clear route to a person.", "points": ["Answers based on approved business information", "Structured customer enquiries", "Handover when a person or approval is needed"], "href": "services/ai-assistants.html"}, "automation": {"name": "Workflow automation", "word": "Flow.", "title": "Less copying. Less chasing.\nMore moving forward.", "lead": "We map the handoffs, connect the right tools and make the next action easier to see and manage.", "points": ["Enquiry routing between your tools", "Reminders and follow-up workflows", "Clear exception and approval steps"], "href": "services/automation.html"}, "business-systems": {"name": "Custom business systems", "word": "Clarity.", "title": "Your operations.\nIn clearer view.", "lead": "We turn day-to-day processes into useful software, with clear views, sensible controls and room for your real workflow.", "points": ["Inventory and stock-management workflows", "Internal tools and operational dashboards", "Team roles and agreed access controls"], "href": "services/business-systems.html"}, "marketing": {"name": "Marketing & lead generation", "word": "Reach.", "title": "Turn attention\ninto a useful conversation.", "lead": "We connect the message, the page and the follow-up so people understand your offer and know how to respond.", "points": ["Campaign landing pages and lead forms", "Social content and campaign assets", "Connected lead capture and follow-up"], "href": "services/marketing.html"}};
  const buttons = [...document.querySelectorAll('[data-capability]')];
  const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
  for (const button of buttons) button.addEventListener('click', () => {
    const item = capabilities[button.dataset.capability];
    if (!item) return;
    for (const other of buttons) other.setAttribute('aria-pressed', String(other === button));
    document.getElementById('capability-status').textContent = item.name + ' details shown.';
    document.getElementById('capability-word').textContent = item.word;
    document.getElementById('capability-title').textContent = item.title;
    document.getElementById('capability-description').textContent = item.lead;
    const list = document.getElementById('capability-points');
    list.replaceChildren(...item.points.map(text => {
      const li = document.createElement('li');
      li.innerHTML = check;
      li.append(document.createTextNode(text));
      return li;
    }));
    document.getElementById('capability-detail').href = item.href;
    document.getElementById('capability-enquire').dataset.service = item.name;
  });
  document.getElementById('open-guide')?.addEventListener('click', () => {
    const launch = document.getElementById('assistant-launch');
    if (launch.getAttribute('aria-expanded') !== 'true') launch.click();
    else document.getElementById('assistant-close').focus();
  });
  // Only public service slugs are accepted; never place contact details in URLs.
  const service = new URLSearchParams(window.location.search).get('service');
  if (service && capabilities[service]) document.querySelector('#project-form select[name="service"]').value = capabilities[service].name;
})();
