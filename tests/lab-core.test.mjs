import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleProducts, cartSummary, moveStock, addProduct, supportReply, buildWorkflow, approveWorkflow, campaignBrief } from '../dist/lab-core.js';

test('sample basket totals come from products and quantities, without changing the catalogue', () => {
  const summary = cartSummary(sampleProducts, { notebook: 2, mug: 1, tote: 0 });
  assert.equal(summary.count, 3);
  assert.equal(summary.total, 2100);
  assert.equal(summary.items.length, 2);
  assert.equal(sampleProducts[0].stock, 24);
  assert.equal(cartSummary(sampleProducts, {}).total, 0);
});

test('a sample basket rejects missing products, fractional quantities and overselling', () => {
  assert.throws(() => cartSummary(sampleProducts, { missing: 1 }), /catalogue/);
  assert.throws(() => cartSummary(sampleProducts, { notebook: 1.5 }), /whole/);
  assert.throws(() => cartSummary(sampleProducts, { cable: 5 }), /Only 4/);
});

test('stock movements change only the requested product and preserve the original records', () => {
  const result = moveStock(sampleProducts, { productId: 'mug', direction: 'in', quantity: 5, note: 'Sample delivery' });
  assert.equal(result.products.find(p => p.id === 'mug').stock, 11);
  assert.equal(sampleProducts.find(p => p.id === 'mug').stock, 6);
  assert.equal(result.movement.note, 'Sample delivery');
  const issued = moveStock(result.products, { productId: 'mug', direction: 'out', quantity: 11 });
  assert.equal(issued.products.find(p => p.id === 'mug').stock, 0);
});

test('invalid stock changes are rejected without creating negative or fractional stock', () => {
  assert.throws(() => moveStock(sampleProducts, { productId: 'cable', direction: 'out', quantity: 5 }), /Only 4/);
  assert.throws(() => moveStock(sampleProducts, { productId: 'cable', direction: 'in', quantity: 1.5 }), /whole/);
  assert.throws(() => moveStock(sampleProducts, { productId: 'cable', direction: 'other', quantity: 1 }), /received/);
  assert.equal(sampleProducts.find(p => p.id === 'cable').stock, 4);
});

test('new product records normalise SKUs and reject duplicates and invalid prices', () => {
  const fields = { name: 'Desk lamp', sku: 'desk-003', category: 'Desk', price: 1500, stock: 3, reorder: 2 };
  const result = addProduct(sampleProducts, fields);
  assert.equal(result.length, 7);
  assert.equal(result.at(-1).sku, 'DESK-003');
  assert.equal(sampleProducts.length, 6);
  assert.throws(() => addProduct(result, fields), /already exists/);
  assert.throws(() => addProduct(sampleProducts, { ...fields, price: -1 }), /unit price/);
});

test('the scripted enquiry desk hands unknown or sensitive requests to a person', () => {
  assert.equal(supportReply('Can I speak to a person about my website?').kind, 'handover');
  assert.equal(supportReply('Guarantee my revenue will double.').kind, 'handover');
  assert.match(supportReply('How much will it cost?').text, /cannot confirm a price/);
  assert.match(supportReply('Can you build an online store?').text, /online stores/);
});

test('sample workflow requires valid details and keeps review separate from approval', () => {
  const fields = { name: ' Alex ', email: 'alex@example.com', service: 'AI assistant', challenge: 'Help us organise our incoming enquiries.', approval: true };
  const workflow = buildWorkflow(fields);
  assert.equal(workflow.lead.name, 'Alex');
  assert.equal(workflow.phase, 'review');
  const approved = approveWorkflow(workflow);
  assert.equal(approved.phase, 'ready');
  assert.equal(workflow.phase, 'review');
  assert.match(approved.steps.at(-1), /nothing sent/);
  assert.throws(() => approveWorkflow(approved), /fresh workflow/);
  assert.throws(() => buildWorkflow({ ...fields, email: 'invalid' }), /email/);
});

test('campaign links preserve the destination query and encode one clear set of tracking fields', () => {
  const brief = campaignBrief({ business: 'Everyday Goods', offer: 'Desk essentials', audience: 'small teams', channel: 'instagram', tone: 'clear', destination: 'https://example.com/offer?item=desk#details' });
  const link = new URL(brief.link);
  assert.equal(link.searchParams.get('item'), 'desk');
  assert.equal(link.searchParams.get('utm_source'), 'instagram');
  assert.equal(link.searchParams.get('utm_campaign'), 'desk-essentials');
  assert.equal(link.hash, '#details');
  assert.match(brief.text, /does not publish/);
});

test('campaign creation refuses script URLs, credential-bearing destinations and unknown channels', () => {
  const fields = { business: 'Sample business', offer: 'A useful service', audience: 'small teams', channel: 'email', destination: 'https://example.com' };
  assert.throws(() => campaignBrief({ ...fields, destination: 'javascript:alert(1)' }), /HTTPS/);
  assert.throws(() => campaignBrief({ ...fields, destination: 'https://user:password@example.com' }), /username/);
  assert.throws(() => campaignBrief({ ...fields, channel: 'unknown' }), /channel/);
});
