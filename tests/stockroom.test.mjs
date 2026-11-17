import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyWorkspace, addInventoryProduct, editInventoryProduct, recordInventoryMovement, parseBackup, backupText, inventoryCsv, movementCsv, validateWorkspace, stockValueText, LIMITS } from '../dist/stockroom-core.js';
import { STORAGE_KEY, readSaved, saveWorkspace } from '../dist/stockroom-storage.js';

const at = '2026-11-17T12:00:00.000Z';
const fields = { name: 'Paper pack', sku: 'PAPER-01', category: 'Stationery', price: '250.50', stock: '10', reorder: '3' };
const stocked = () => addInventoryProduct(emptyWorkspace(at), fields, at);
const moved = () => recordInventoryMovement(stocked(), { productId: 'sku-PAPER-01', direction: 'out', quantity: '2', note: 'Order collected' }, at, 'move-1');
const memory = initial => {
  const map = new Map(initial === undefined ? [] : [[STORAGE_KEY, initial]]);
  return { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) };
};

test('a new saved workspace is empty and round-trips through a versioned backup', () => {
  const workspace = emptyWorkspace(at);
  assert.deepEqual(parseBackup(backupText(workspace)), workspace);
  assert.equal(workspace.products.length, 0);
});
test('stock values preserve cents without floating-point summation loss', () => {
  assert.equal(stockValueText({ products: [{ price: .1, stock: 3 }, { price: .2, stock: 1 }] }), 'KES 0.50');
  assert.equal(stockValueText({ products: Array.from({ length: 1000 }, () => ({ price: 999999.99, stock: 1000000 })) }), 'KES 999,999,990,000,000');
});
test('products accept business categories, normalise SKUs and preserve exact two-decimal unit values', () => {
  const workspace = stocked();
  assert.equal(workspace.products[0].price, 250.50);
  assert.equal(workspace.products[0].category, 'Stationery');
  assert.throws(() => addInventoryProduct(workspace, { ...fields, sku: 'paper-01' }, at), /already in use/);
  assert.throws(() => addInventoryProduct(workspace, { ...fields, sku: 'OTHER', price: '.001' }, at), /decimal/);
});
test('stock movements are immutable, dated and balance before and after quantities', () => {
  const original = stocked();
  const next = recordInventoryMovement(original, { productId: 'sku-PAPER-01', direction: 'out', quantity: 2, note: 'Collected' }, at, 'm1');
  assert.equal(original.products[0].stock, 10);
  assert.equal(original.movements.length, 0);
  assert.deepEqual(next.movements[0], { id: 'm1', productId: 'sku-PAPER-01', direction: 'out', quantity: 2, before: 10, after: 8, note: 'Collected', at });
  assert.equal(next.products[0].stock, 8);
  assert.deepEqual(parseBackup(backupText(next)), next);
});
test('stock safeguards reject overselling, fractions, unknown products and invalid movement types', () => {
  for (const change of [{ quantity: 11 }, { quantity: .5 }, { quantity: 0 }, { quantity: [] }, { productId: 'missing' }, { direction: 'replace' }]) {
    assert.throws(() => recordInventoryMovement(stocked(), { productId: 'sku-PAPER-01', direction: 'out', quantity: 1, ...change }, at, 'm1'));
  }
});
test('editing details cannot silently alter stock or its stable SKU', () => {
  const next = editInventoryProduct(moved(), 'sku-PAPER-01', { ...fields, name: 'A4 paper pack', sku: 'CHANGED', stock: 999 }, at);
  assert.equal(next.products[0].stock, 8);
  assert.equal(next.products[0].sku, 'PAPER-01');
  assert.equal(next.products[0].name, 'A4 paper pack');
  assert.deepEqual(next.movements, moved().movements);
});
test('backup validation rejects malformed, oversized, unsupported and inconsistent records', () => {
  assert.throws(() => parseBackup('{bad'), /JSON/);
  assert.throws(() => parseBackup(' '.repeat(LIMITS.backupBytes + 1)), /2 MB/);
  for (const change of [{ version: 2 }, { products: {} }, { updatedAt: 'yesterday' }, { revision: [] }]) assert.throws(() => validateWorkspace({ ...moved(), ...change }));
  const inconsistent = moved(); inconsistent.products[0].stock = 99;
  assert.throws(() => validateWorkspace(inconsistent), /history/);
  const wrongProduct = moved(); wrongProduct.movements[0].productId = 'missing';
  assert.throws(() => validateWorkspace(wrongProduct), /invalid product/);
});
test('movement history rejects duplicate IDs and broken quantity chains', () => {
  const previous = moved();
  assert.throws(() => recordInventoryMovement(previous, { productId: 'sku-PAPER-01', direction: 'in', quantity: 1 }, at, 'move-1'), /unique/);
  const next = recordInventoryMovement(previous, { productId: 'sku-PAPER-01', direction: 'in', quantity: 1 }, at, 'move-2');
  next.movements[1].before = 9; next.movements[1].after = 10; next.products[0].stock = 10;
  assert.throws(() => validateWorkspace(next), /inconsistent/);
});
test('backups project known fields and never merge untrusted object properties', () => {
  const raw = JSON.stringify(stocked()).replace('"version":1', '"version":1,"__proto__":{"polluted":true}');
  const result = parseBackup(raw);
  assert.equal({}.polluted, undefined);
  assert.equal(Object.hasOwn(result, '__proto__'), false);
});
test('CSV exports quote commas, quotes and newlines and neutralise formula cells', () => {
  const workspace = stocked();
  workspace.products[0].name = '\t=HYPERLINK("bad")';
  workspace.products[0].category = 'Paper, white\nA4';
  const csv = inventoryCsv(workspace);
  assert.ok(csv.includes('"\'\t=HYPERLINK(""bad"")"'));
  assert.ok(csv.includes('"Paper, white\nA4"'));
  const change = recordInventoryMovement(stocked(), { productId: 'sku-PAPER-01', direction: 'out', quantity: 1, note: '@SUM(1,2)' }, at, 'm1');
  assert.ok(movementCsv(change).includes('"\'@SUM(1,2)"'));
});
test('saved state reloads without mixing sample data into the owned workspace', () => {
  const storage = memory();
  assert.deepEqual(readSaved(storage), { raw: null, workspace: null });
  const raw = saveWorkspace(storage, moved(), null);
  assert.equal(raw, storage.getItem(STORAGE_KEY));
  assert.deepEqual(readSaved(storage).workspace, moved());
});
test('stale tabs and quota failures do not overwrite the last saved records', () => {
  const storage = memory();
  const original = saveWorkspace(storage, stocked(), null);
  const latest = saveWorkspace(storage, moved(), original);
  assert.throws(() => saveWorkspace(storage, stocked(), original), /another tab/);
  assert.equal(storage.getItem(STORAGE_KEY), latest);
  storage.setItem = () => { throw new Error('quota'); };
  assert.throws(() => saveWorkspace(storage, moved(), latest), /could not save/);
  assert.equal(storage.getItem(STORAGE_KEY), latest);
});
test('corrupt saved data is surfaced without being replaced automatically', () => {
  const storage = memory('broken backup');
  assert.throws(() => readSaved(storage));
  assert.equal(storage.getItem(STORAGE_KEY), 'broken backup');
});
