// Browser inventory edition. Pure validation and mutations; no network or storage.
const fail = message => { throw new Error(message); };
export const LIMITS = Object.freeze({ products: 1000, movements: 10000, backupBytes: 2000000 });
const string = (value, min, max, label) => {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) fail(`${label} must have ${min}–${max} characters.`);
  return value.trim();
};
const whole = (value, min, max, label) => {
  if (!['string', 'number'].includes(typeof value) || String(value).trim() === '') fail(`Enter a whole ${label}.`);
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) fail(`${label} must be a whole number from ${min} to ${max}.`);
  return number;
};
const date = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) fail('A record has an invalid date.');
  return new Date(value).toISOString();
};
const unitValue = value => {
  const number = Number(value);
  if (!['string', 'number'].includes(typeof value) || String(value).trim() === '' || !Number.isFinite(number) || number < 0 || number > 1000000 || Math.abs(number * 100 - Math.round(number * 100)) > .000001) fail('Enter a unit value from 0 to 1,000,000, with up to two decimal places.');
  return Math.round(number * 100) / 100;
};
function product(input) {
  if (!input || typeof input !== 'object') fail('A product record is invalid.');
  const sku = string(input.sku, 2, 30, 'SKU').toUpperCase();
  if (!/^[A-Z0-9-]+$/.test(sku)) fail('Use letters, numbers and hyphens for the SKU.');
  return {
    id: string(input.id, 1, 100, 'Product ID'), sku,
    name: string(input.name, 2, 80, 'Product name'),
    category: string(input.category, 1, 50, 'Category'),
    price: unitValue(input.price), stock: whole(input.stock, 0, 1000000, 'Stock'),
    reorder: whole(input.reorder, 0, 99999, 'Reorder level')
  };
}
export function validateWorkspace(input) {
  if (!input || input.app !== 'neuronest-stockroom' || input.version !== 1) fail('Choose a Stockroom version 1 backup.');
  if (!Array.isArray(input.products) || input.products.length > LIMITS.products || !Array.isArray(input.movements) || input.movements.length > LIMITS.movements) fail('This workspace exceeds the supported record limits.');
  const products = input.products.map(product);
  if (new Set(products.map(p => p.id)).size !== products.length || new Set(products.map(p => p.sku)).size !== products.length) fail('Product IDs and SKUs must be unique.');
  const ids = new Set(products.map(p => p.id));
  const movementIds = new Set();
  const last = new Map();
  const movements = input.movements.map(m => {
    if (!m || !ids.has(m.productId) || !['in', 'out'].includes(m.direction)) fail('A movement refers to an invalid product or direction.');
    const id = string(m.id, 1, 100, 'Movement ID');
    if (movementIds.has(id)) fail('Movement IDs must be unique.');
    movementIds.add(id);
    const quantity = whole(m.quantity, 1, 99999, 'Movement quantity');
    const before = whole(m.before, 0, 1000000, 'Previous stock');
    const after = whole(m.after, 0, 1000000, 'Resulting stock');
    if (after !== before + (m.direction === 'in' ? quantity : -quantity)) fail('A stock movement does not balance.');
    if (last.has(m.productId) && last.get(m.productId) !== before) fail('The movement history is inconsistent.');
    last.set(m.productId, after);
    return { id, productId: m.productId, direction: m.direction, quantity, before, after, note: string(m.note ?? '', 0, 120, 'Note'), at: date(m.at) };
  });
  for (const p of products) if (last.has(p.id) && last.get(p.id) !== p.stock) fail('The current stock does not match its movement history.');
  return { app: 'neuronest-stockroom', version: 1, revision: whole(input.revision, 0, 1000000000, 'Revision'), updatedAt: date(input.updatedAt), products, movements };
}
export const emptyWorkspace = at => validateWorkspace({ app: 'neuronest-stockroom', version: 1, revision: 0, updatedAt: at, products: [], movements: [] });
export function stockValueText(workspace) {
  const cents = workspace.products.reduce((sum, p) => sum + BigInt(Math.round(p.price * 100)) * BigInt(p.stock), 0n);
  const whole = new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(cents / 100n);
  const fraction = cents % 100n;
  return 'KES ' + whole + (fraction ? '.' + String(fraction).padStart(2, '0') : '');
}
function changed(workspace, fields, at) {
  return validateWorkspace({ ...workspace, ...fields, revision: workspace.revision + 1, updatedAt: at });
}
export function addInventoryProduct(workspace, fields, at) {
  const sku = string(fields.sku, 2, 30, 'SKU').toUpperCase();
  if (workspace.products.some(p => p.sku === sku)) fail('That SKU is already in use. Choose another SKU.');
  const next = product({ ...fields, id: 'sku-' + sku });
  return changed(workspace, { products: [...workspace.products, next] }, at);
}
export function editInventoryProduct(workspace, id, fields, at) {
  const previous = workspace.products.find(p => p.id === id);
  if (!previous) fail('Choose an existing product.');
  // Stock and SKU stay immutable here; quantities change through recorded movements.
  const next = product({ ...previous, name: fields.name, category: fields.category, price: fields.price, reorder: fields.reorder });
  return changed(workspace, { products: workspace.products.map(p => p.id === id ? next : p) }, at);
}
export function recordInventoryMovement(workspace, fields, at, id) {
  const selected = workspace.products.find(p => p.id === fields.productId);
  if (!selected) fail('Add or choose a product first.');
  const quantity = whole(fields.quantity, 1, 99999, 'Movement quantity');
  if (!['in', 'out'].includes(fields.direction)) fail('Choose stock received or stock issued.');
  const after = selected.stock + (fields.direction === 'in' ? quantity : -quantity);
  if (after < 0) fail(`Only ${selected.stock} units are available. Reduce the quantity or record incoming stock first.`);
  const movement = { id, productId: selected.id, direction: fields.direction, quantity, before: selected.stock, after, note: fields.note ?? '', at };
  return changed(workspace, { products: workspace.products.map(p => p.id === selected.id ? { ...p, stock: after } : p), movements: [...workspace.movements, movement] }, at);
}
export function parseBackup(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > LIMITS.backupBytes) fail('Choose a Stockroom JSON backup smaller than 2 MB.');
  let input;
  try { input = JSON.parse(text); } catch { fail('This is not a readable JSON backup.'); }
  return validateWorkspace(input);
}
export const backupText = workspace => {
  const text = JSON.stringify(validateWorkspace(workspace), null, 2);
  if (new TextEncoder().encode(text).length > LIMITS.backupBytes) fail('This workspace reached the 2 MB backup limit. Export your records before starting another workspace.');
  return text;
};
// Neutralise spreadsheet formulas, including leading whitespace/control characters.
const cell = value => '"' + String(/^[\s]*[=+@-]/.test(String(value)) ? "'" + value : value).replaceAll('"', '""') + '"';
export function inventoryCsv(workspace) {
  const rows = [['SKU', 'Product', 'Category', 'Available', 'Reorder at', 'Unit value KES'], ...workspace.products.map(p => [p.sku, p.name, p.category, p.stock, p.reorder, p.price.toFixed(2)])];
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n');
}
export function movementCsv(workspace) {
  const rows = [['Date', 'SKU', 'Product', 'Movement', 'Quantity', 'Before', 'After', 'Note'], ...workspace.movements.map(m => {
    const p = workspace.products.find(p => p.id === m.productId);
    return [m.at, p.sku, p.name, m.direction, m.quantity, m.before, m.after, m.note];
  })];
  return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n');
}
