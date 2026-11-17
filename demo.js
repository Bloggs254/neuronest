'use strict';
// Local capability explorer. No AI calls, visitor storage or automatic messaging.
(() => {
  const capabilities = {"websites":{"name":"Websites & ecommerce","word":"Web.","title":"Help people understand\nwhat you offer.","lead":"We make it easy for customers to see what you do, find the details they need and enquire or order. The content and layout follow how people choose your products or services.","points":["Clear service pages and product information","Easy browsing and enquiries on a phone","Online stores with agreed payment and delivery options"],"href":"services/websites.html"},"ai-assistants":{"name":"AI assistants","word":"Assist.","title":"Give routine questions\na useful first answer.","lead":"When the same questions keep arriving, an assistant can answer from your approved information and collect the details you need. Anything that needs your judgement comes back to a person.","points":["Answers to common questions about your business","Customer details collected before you follow up","Human handover for unfamiliar or sensitive questions"],"href":"services/ai-assistants.html"},"automation":{"name":"Workflow automation","word":"Flow.","title":"Stop entering the same\ndetails over and over.","lead":"We can connect your forms, inbox and everyday tools so enquiries reach the right person and follow-ups are easier to track. You choose which steps run automatically and which need approval.","points":["Enquiries routed to the right person or tool","Reminders for tasks and customer follow-ups","Review steps before important actions"],"href":"services/automation.html"},"business-systems":{"name":"Custom business systems","word":"Clarity.","title":"Know what is in stock\nand what has changed.","lead":"When records are scattered across spreadsheets, messages and notebooks, getting a clear answer takes time. We build inventory and other internal tools around the information your team needs.","points":["Product records and stock movements in one place","Clear views of work that needs attention","Access and responsibilities agreed for your team"],"href":"services/business-systems.html"},"marketing":{"name":"Marketing & lead generation","word":"Reach.","title":"Reach people who need\nwhat you offer.","lead":"We help you explain your offer, create focused campaigns and give interested people a clear way to respond. Tracking shows where enquiries come from and what happens next.","points":["Campaign content with a clear offer","Landing pages and simple enquiry forms","Enquiry tracking and an agreed follow-up process"],"href":"services/marketing.html"}};
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
