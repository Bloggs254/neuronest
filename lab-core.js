// Shared, deterministic logic for original NeuroNest studio demos.
// No network calls, persistence or third-party services.
export const sampleProducts = Object.freeze([
  { id: 'notebook', sku: 'DESK-001', name: 'A5 notebook', category: 'Desk', price: 450, stock: 24, reorder: 8, icon: 'book' },
  { id: 'mug', sku: 'TRAVEL-001', name: 'Travel mug', category: 'Travel', price: 1200, stock: 6, reorder: 8, icon: 'cup' },
  { id: 'tote', sku: 'TRAVEL-002', name: 'Cotton tote', category: 'Travel', price: 850, stock: 18, reorder: 6, icon: 'bag' },
  { id: 'cable', sku: 'TECH-001', name: 'USB-C cable', category: 'Accessories', price: 650, stock: 4, reorder: 5, icon: 'cable' },
  { id: 'organiser', sku: 'DESK-002', name: 'Desk organiser', category: 'Desk', price: 950, stock: 12, reorder: 4, icon: 'box' },
  { id: 'pouch', sku: 'TRAVEL-003', name: 'Travel pouch', category: 'Travel', price: 700, stock: 9, reorder: 4, icon: 'bag' }
].map(item => Object.freeze(item)));

export const money = value => 'KES ' + new Intl.NumberFormat('en-KE', { maximumFractionDigits: 2 }).format(value);
const text = (value, max = 200) => String(value ?? '').trim().slice(0, max);
const fail = message => { throw new Error(message); };
function integer(value, minimum, maximum, message) {
  if (text(value) === '') fail(message);
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) fail(message);
  return number;
}

export function cartSummary(products, quantities) {
  const items = [];
  for (const [id, value] of Object.entries(quantities)) {
    const quantity = integer(value, 0, 20, 'Choose a whole quantity between 0 and 20.');
    const product = products.find(item => item.id === id);
    if (!product) fail('That product is not in this sample catalogue.');
    if (quantity > product.stock) fail(`Only ${product.stock} sample units of ${product.name} are available.`);
    if (quantity) items.push({ ...product, quantity, subtotal: product.price * quantity });
  }
  return { items, count: items.reduce((sum, item) => sum + item.quantity, 0), total: items.reduce((sum, item) => sum + item.subtotal, 0) };
}

export function moveStock(products, { productId, direction, quantity, note = '' }) {
  const amount = integer(quantity, 1, 99999, 'Enter a whole quantity from 1 to 99,999.');
  const product = products.find(item => item.id === productId);
  if (!product) fail('Choose a product.');
  if (!['in', 'out'].includes(direction)) fail('Choose stock received or stock issued.');
  const next = product.stock + (direction === 'in' ? amount : -amount);
  if (next < 0) fail(`Only ${product.stock} units are available. Reduce the quantity or record incoming stock first.`);
  if (next > 1000000) fail('This sample workspace supports up to 1,000,000 units per product.');
  return {
    products: products.map(item => item.id === productId ? { ...item, stock: next } : { ...item }),
    movement: { product: product.name, direction, quantity: amount, note: text(note, 120) }
  };
}

export function addProduct(products, fields) {
  const name = text(fields.name, 80), sku = text(fields.sku, 30).toUpperCase();
  if (name.length < 2) fail('Give the product a name with at least two characters.');
  if (!/^[A-Z0-9-]{2,30}$/.test(sku)) fail('Use 2–30 letters, numbers or hyphens for the SKU.');
  if (products.some(item => item.sku.toUpperCase() === sku)) fail('That SKU already exists. Use a different SKU.');
  const price = Number(fields.price);
  if (text(fields.price) === '' || !Number.isFinite(price) || price < 0 || price > 1000000) fail('Enter a sample unit price between 0 and 1,000,000.');
  const stock = integer(fields.stock, 0, 99999, 'Opening stock must be a whole number from 0 to 99,999.');
  const reorder = integer(fields.reorder, 0, 99999, 'The reorder level must be a whole number from 0 to 99,999.');
  const category = text(fields.category);
  if (!['Desk', 'Travel', 'Accessories'].includes(category)) fail('Choose a sample category.');
  return [...products.map(item => ({ ...item })), { id: 'custom-' + sku, sku, name, category, price: Math.round(price * 100) / 100, stock, reorder, icon: 'box' }];
}

export function supportReply(message) {
  const question = text(message, 700).toLowerCase();
  if (!question) fail('Enter a question first.');
  if (/person|human|owner|urgent|complaint|refund/.test(question)) return { kind: 'handover', text: 'A person should handle that conversation. I can prepare a summary for you to review and take to NeuroNest’s enquiry form.' };
  if (/price|cost|budget|quote|charge/.test(question)) return { kind: 'answer', text: 'NeuroNest quotes after understanding the scope, integrations and support you need. The next step is to share your requirements; this demo cannot confirm a price.' };
  if (/invent|stock|system/.test(question)) return { kind: 'answer', text: 'NeuroNest builds custom operational tools. Its inventory project is in development, and Stockroom is a working browser prototype you can explore with sample data.' };
  if (/website|store|ecommerce|e-commerce/.test(question)) return { kind: 'answer', text: 'NeuroNest can build business websites, landing pages and online stores. We start with your offer, your customers and the action visitors should take.' };
  if (/whatsapp|email|assistant|automation|\bai\b/.test(question)) return { kind: 'answer', text: 'NeuroNest can scope AI assistants and connected workflows, including agreed WhatsApp or email integrations. Accounts, information boundaries and human handover are planned for each project.' };
  if (/marketing|campaign|lead/.test(question)) return { kind: 'answer', text: 'NeuroNest can help with landing pages, campaign content, lead capture and follow-up workflows. Campaign Kit demonstrates how a focused offer can become a useful campaign brief.' };
  if (/kenya|where|location|africa/.test(question)) return { kind: 'answer', text: 'NeuroNest is based in Kenya and works with businesses across East Africa. You can also enquire about a larger or international project.' };
  return { kind: 'handover', text: 'That is outside this demo’s approved answers. A useful next step is a person reviewing your question. You can prepare a handover summary instead of getting a guessed answer.' };
}

export function buildWorkflow(fields) {
  const name = text(fields.name, 80), email = text(fields.email, 200), challenge = text(fields.challenge, 700);
  if (name.length < 2) fail('Enter a name with at least two characters.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Enter a valid sample email address.');
  if (!['Website', 'AI assistant', 'Business system'].includes(fields.service)) fail('Choose a service.');
  if (challenge.length < 10) fail('Describe the challenge in at least ten characters.');
  return {
    lead: { name, email, service: fields.service, challenge },
    phase: fields.approval ? 'review' : 'ready',
    steps: ['Enquiry checked', 'Follow-up task created', 'Reply draft prepared', fields.approval ? 'Waiting for team approval' : 'Ready for a connected system'],
    draft: `Hello ${name},\n\nThanks for sharing your ${fields.service.toLowerCase()} enquiry. We would like to understand your requirements before proposing a scope.\n\nYour challenge: ${challenge}\n\nWhat would a useful next step look like for your team?\n\nNeuroNest`
  };
}

export function approveWorkflow(workflow) {
  if (!workflow || workflow.phase !== 'review') fail('Run a fresh workflow that needs approval first.');
  return { ...workflow, phase: 'ready', steps: [...workflow.steps.slice(0, 3), 'Approved sample draft — nothing sent'] };
}

export function campaignBrief(fields) {
  const business = text(fields.business, 80), offer = text(fields.offer, 120), audience = text(fields.audience, 120);
  if (business.length < 2 || offer.length < 5 || audience.length < 3) fail('Add a business name, a clear offer and an audience.');
  const channels = { instagram: ['Instagram', 'social'], facebook: ['Facebook', 'social'], whatsapp: ['WhatsApp', 'messaging'], email: ['Email', 'email'] };
  if (!channels[fields.channel]) fail('Choose a campaign channel.');
  let url;
  try { url = new URL(text(fields.destination, 1000)); } catch { fail('Use a complete destination such as https://example.com/offer.'); }
  if (url.protocol !== 'https:' || url.username || url.password) fail('Use an HTTPS destination without a username or password.');
  const slug = offer.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'campaign';
  url.searchParams.set('utm_source', fields.channel);
  url.searchParams.set('utm_medium', channels[fields.channel][1]);
  url.searchParams.set('utm_campaign', slug);
  const caption = fields.tone === 'warm'
    ? `Looking for ${offer.toLowerCase()}? ${business} can be your next stop. Explore the details and get in touch.`
    : `${business}: ${offer}. Built for ${audience}. Explore the details and enquire.`;
  const link = url.toString();
  return { business, offer, audience, channel: channels[fields.channel][0], caption, link,
    text: `Campaign brief\n\nBusiness: ${business}\nOffer: ${offer}\nAudience: ${audience}\nChannel: ${channels[fields.channel][0]}\n\nDraft caption to review:\n${caption}\n\nTracking link:\n${link}\n\nNext step: confirm the offer, prepare the assets and decide who follows up. This demo does not publish ads or predict results.` };
}
