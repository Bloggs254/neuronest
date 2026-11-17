import { sampleProducts, money, cartSummary, moveStock, addProduct, supportReply, buildWorkflow, approveWorkflow, campaignBrief } from './lab-core.js';

const $ = id => document.getElementById(id);
const el = (tag, text = '', className = '') => {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
};
const action = (label, callback, className = 'lab-button') => {
  const button = el('button', label, className);
  button.type = 'button';
  button.addEventListener('click', callback);
  return button;
};
const notice = (message, error = false) => {
  $('lab-status').textContent = error ? '' : message;
  $('lab-error').textContent = error ? message : '';
};
const paths = {
  book: 'M8 5h17v23H8a4 4 0 0 1 0-8h17M8 5a4 4 0 0 0-4 4v15m7-12h9m-9 4h6',
  cup: 'M8 9h15v17H8V9Zm15 3h3a4 4 0 0 1 0 8h-3M11 4v2m5-2v2m5-2v2M5 29h22',
  bag: 'M6 11h21l-2 18H8L6 11Zm6 1V9a5 5 0 0 1 10 0v3',
  cable: 'M11 4v6m-3-6h6v7H8V4Zm3 7v4a5 5 0 0 0 10 0V9m-3-5h6v6h-6V4ZM14 20v3a5 5 0 0 1-10 0v-4',
  box: 'm4 10 12-6 12 6v15l-12 6-12-6V10Zm0 0 12 6 12-6M16 16v15M10 7l12 6'
};
const productIcon = type => {
  const node = el('div', '', 'product-art ' + type);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 34 34');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', Object.hasOwn(paths, type) ? paths[type] : paths.box);
  svg.append(path);
  node.append(svg);
  return node;
};

function shopfront() {
  let quantities = {};
  const invalidate = () => { $('order-result').hidden = true; $('order-text').value = ''; };
  function renderBasket() {
    const summary = cartSummary(sampleProducts, quantities);
    $('basket-count').textContent = String(summary.count);
    $('basket-total').textContent = money(summary.total);
    $('prepare-order').disabled = !summary.count;
    const rows = summary.items.map(item => {
      const row = el('div', '', 'basket-row');
      const details = el('div');
      details.append(el('strong', item.name), el('small', money(item.price) + ' each'));
      const quantity = el('div', '', 'quantity-control');
      const change = delta => {
        try {
          const next = { ...quantities, [item.id]: item.quantity + delta };
          cartSummary(sampleProducts, next);
          quantities = next;
          invalidate(); renderBasket();
          notice('Basket updated.');
        } catch (error) { notice(error.message, true); }
      };
      const minus = action('−', () => change(-1));
      minus.setAttribute('aria-label', 'Remove one ' + item.name);
      const plus = action('+', () => change(1));
      plus.setAttribute('aria-label', 'Add one ' + item.name);
      quantity.append(minus, el('span', String(item.quantity)), plus);
      row.append(details, quantity, el('strong', money(item.subtotal), 'row-price'));
      return row;
    });
    $('basket-items').replaceChildren(...(rows.length ? rows : [el('p', 'Your sample basket is empty. Choose a product to get started.', 'lab-empty')]));
  }
  function renderProducts() {
    const query = $('product-search').value.trim().toLowerCase();
    const category = $('product-category').value;
    const products = sampleProducts.filter(p => (!category || p.category === category) && p.name.toLowerCase().includes(query));
    $('catalogue').replaceChildren(...products.map(product => {
      const card = el('article', '', 'product-card');
      const add = action('Add to basket', () => {
        try {
          const next = { ...quantities, [product.id]: (quantities[product.id] || 0) + 1 };
          cartSummary(sampleProducts, next);
          quantities = next; invalidate(); renderBasket();
          notice(product.name + ' added to your sample basket.');
        } catch (error) { notice(error.message, true); }
      });
      card.append(productIcon(product.icon), el('small', product.category), el('h3', product.name), el('p', money(product.price)), add);
      return card;
    }));
    if (!products.length) $('catalogue').append(el('p', 'No matching products. Try another search or category.', 'lab-empty'));
  }
  $('product-search').addEventListener('input', renderProducts);
  $('product-category').addEventListener('change', renderProducts);
  $('prepare-order').addEventListener('click', () => {
    const summary = cartSummary(sampleProducts, quantities);
    if (!summary.count) return;
    $('order-text').value = 'Everyday Goods — sample order enquiry\n\n' + summary.items.map(item => `${item.name} × ${item.quantity}: ${money(item.subtotal)}`).join('\n') + '\n\nSample total: ' + money(summary.total) + '\nNo purchase, payment or reservation has been made.';
    $('order-result').hidden = false;
    notice('Your sample order is ready to review. Nothing has been purchased.');
  });
  $('reset-demo').addEventListener('click', () => { quantities = {}; invalidate(); renderBasket(); notice('Sample basket reset.'); });
  renderProducts(); renderBasket();
}

function stockroom() {
  let products = sampleProducts.map(p => ({ ...p }));
  let movements = [];
  function render() {
    $('stock-lines').textContent = String(products.length);
    $('stock-low').textContent = String(products.filter(p => p.stock <= p.reorder).length);
    $('stock-value').textContent = money(products.reduce((sum, p) => sum + p.stock * p.price, 0));
    const query = $('stock-search').value.trim().toLowerCase();
    const visible = products.filter(p => (p.name + ' ' + p.sku).toLowerCase().includes(query) && (!$('low-only').checked || p.stock <= p.reorder));
    $('stock-rows').replaceChildren(...visible.map(product => {
      const row = el('tr');
      const label = el('th'); label.scope = 'row';
      label.append(el('strong', product.name), el('small', product.sku));
      const status = el('td'); status.append(el('span', product.stock <= product.reorder ? 'Review stock' : 'In stock', product.stock <= product.reorder ? 'demo-badge warm' : 'demo-badge'));
      row.append(label, el('td', product.category), el('td', String(product.stock)), el('td', String(product.reorder)), status);
      return row;
    }));
    $('stock-empty').hidden = visible.length > 0;
    const selected = $('movement-product').value;
    $('movement-product').replaceChildren(...products.map(p => {
      const option = el('option', p.name); option.value = p.id; return option;
    }));
    if (products.some(p => p.id === selected)) $('movement-product').value = selected;
    $('movement-list').replaceChildren(...movements.slice().reverse().map(m => {
      const item = el('li');
      item.append(el('strong', `${m.product}: ${m.direction === 'in' ? '+' : '−'}${m.quantity}`), el('span', m.note || (m.direction === 'in' ? 'Stock received' : 'Stock issued')));
      return item;
    }));
    $('movement-empty').hidden = movements.length > 0;
  }
  $('stock-search').addEventListener('input', render);
  $('low-only').addEventListener('change', render);
  $('movement-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    try {
      const result = moveStock(products, { productId: form.elements.product.value, direction: form.elements.direction.value, quantity: form.elements.quantity.value, note: form.elements.note.value });
      products = result.products; movements.push(result.movement); render();
      form.elements.quantity.value = ''; form.elements.note.value = '';
      notice('Sample stock movement recorded.');
    } catch (error) { notice(error.message, true); }
  });
  $('add-product-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    try {
      const fields = Object.fromEntries(new FormData(form));
      products = addProduct(products, fields); render(); form.reset();
      notice('Sample product added to this workspace.');
    } catch (error) { notice(error.message, true); }
  });
  $('reset-demo').addEventListener('click', () => {
    products = sampleProducts.map(p => ({ ...p })); movements = [];
    $('stock-search').value = ''; $('low-only').checked = false;
    $('movement-form').reset(); $('add-product-form').reset(); render();
    notice('Sample workspace restored.');
  });
  render();
}

function frontdesk() {
  let questions = [];
  function bubble(text, user = false) {
    const node = el('div', '', 'desk-bubble' + (user ? ' user' : ''));
    node.append(el('small', user ? 'You' : 'Demo guide'), el('p', text));
    $('desk-messages').append(node);
    $('desk-messages').scrollTop = $('desk-messages').scrollHeight;
  }
  function answer(question) {
    try {
      const reply = supportReply(question);
      questions.push(question.trim().slice(0, 700));
      bubble(question, true); bubble(reply.text);
      $('desk-phase').textContent = reply.kind === 'handover' ? 'Human review needed' : 'Approved information';
      $('prepare-handover').disabled = false;
      $('handover-result').hidden = true; $('handover-text').value = '';
      notice(reply.kind === 'handover' ? 'This question needs a person. You can prepare a summary.' : 'A scripted answer was shown.');
    } catch (error) { notice(error.message, true); }
  }
  $('desk-form').addEventListener('submit', event => {
    event.preventDefault();
    const question = $('desk-question').value.trim();
    if (!question) return;
    answer(question); $('desk-question').value = '';
  });
  document.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => answer(button.dataset.question)));
  $('prepare-handover').addEventListener('click', () => {
    if (!questions.length) return;
    $('handover-text').value = 'Frontdesk — sample handover summary\n\nQuestions to review:\n' + questions.map((q, i) => `${i + 1}. ${q}`).join('\n') + '\n\nA person should confirm scope, pricing and any unanswered details. No alert has been sent.';
    $('handover-result').hidden = false;
    notice('Handover summary prepared for review. No message was sent.');
  });
  function reset() {
    questions = []; $('desk-messages').replaceChildren();
    $('desk-phase').textContent = 'Ready for a question';
    $('prepare-handover').disabled = true; $('handover-result').hidden = true; $('handover-text').value = '';
    bubble('Hello. You can ask about NeuroNest’s services, pricing process or location. This demo uses a small set of approved answers and hands unfamiliar questions to a person.');
  }
  $('reset-demo').addEventListener('click', () => { reset(); notice('Sample conversation reset.'); });
  reset();
}

function flowboard() {
  let workflow = null;
  const form = $('workflow-form');
  function invalidate() {
    workflow = null; $('workflow-result').hidden = true; $('workflow-draft').value = '';
    notice('Run the workflow to prepare a fresh task and reply draft.');
  }
  function render() {
    $('workflow-result').hidden = false;
    $('workflow-steps').replaceChildren(...workflow.steps.map(step => el('li', step)));
    $('workflow-owner').textContent = 'NeuroNest team — ' + workflow.lead.service;
    $('workflow-draft').value = workflow.draft;
    $('approve-draft').hidden = workflow.phase !== 'review';
    $('workflow-phase').textContent = workflow.phase === 'review' ? 'Awaiting sample approval' : 'Ready for a connected system';
  }
  form.addEventListener('input', invalidate);
  form.addEventListener('change', invalidate);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    try {
      workflow = buildWorkflow({ name: form.elements.name.value, email: form.elements.email.value, service: form.elements.service.value, challenge: form.elements.challenge.value, approval: form.elements.approval.checked });
      render(); notice('Sample task and reply draft created. No email was sent.');
    } catch (error) { notice(error.message, true); }
  });
  $('approve-draft').addEventListener('click', () => {
    try { workflow = approveWorkflow(workflow); render(); notice('Sample draft approved. This demo still sends nothing.'); }
    catch (error) { notice(error.message, true); }
  });
  $('reset-demo').addEventListener('click', () => { form.reset(); invalidate(); notice('Sample workflow reset.'); });
}

function campaignKit() {
  const form = $('campaign-form');
  function invalidate() { $('campaign-result').hidden = true; $('campaign-text').value = ''; $('campaign-link').value = ''; }
  form.addEventListener('input', invalidate);
  form.addEventListener('change', invalidate);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    try {
      const brief = campaignBrief(Object.fromEntries(new FormData(form)));
      $('campaign-business').textContent = brief.business;
      $('campaign-offer').textContent = brief.offer;
      $('campaign-caption').textContent = brief.caption;
      $('campaign-channel').textContent = brief.channel;
      $('campaign-link').value = brief.link; $('campaign-text').value = brief.text;
      $('campaign-result').hidden = false;
      notice('Your campaign draft and tracking link are ready to review. Nothing has been published.');
    } catch (error) { notice(error.message, true); }
  });
  $('reset-demo').addEventListener('click', () => { form.reset(); invalidate(); notice('Sample campaign reset.'); });
}

document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const target = $(button.dataset.copy), snapshot = target.value;
  if (!snapshot) return;
  try { await navigator.clipboard.writeText(snapshot); if (target.value === snapshot) notice('Copied.'); }
  catch { if (target.value === snapshot) notice('Copy is unavailable. Select the text in the preview to copy it.'); }
}));
document.querySelectorAll('[data-download]').forEach(button => button.addEventListener('click', () => {
  const text = $(button.dataset.download).value;
  if (!text) return;
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = el('a'); link.href = url; link.download = 'neuronest-demo-brief.txt';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notice('Sample brief downloaded.');
}));
document.querySelectorAll('.lab-app input,.lab-app select,.lab-app textarea:not([readonly])').forEach(input => input.addEventListener('input', () => { $('lab-error').textContent = ''; }));
const controllers = { shopfront, stockroom, frontdesk, flowboard, 'campaign-kit': campaignKit };
controllers[document.body.dataset.lab]?.();
