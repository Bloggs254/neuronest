import { sampleProducts } from './lab-core.js';
import { emptyWorkspace, addInventoryProduct, editInventoryProduct, recordInventoryMovement, parseBackup, backupText, inventoryCsv, movementCsv, stockValueText, LIMITS } from './stockroom-core.js';
import { STORAGE_KEY, readSaved, saveWorkspace } from './stockroom-storage.js';

const $ = id => document.getElementById(id);
const node = (tag, text = '') => { const n = document.createElement(tag); n.textContent = text; return n; };
const now = () => new Date().toISOString();
const message = (text, error = false) => { $('lab-status').textContent = error ? '' : text; $('lab-error').textContent = error ? text : ''; };
const download = (text, filename, type) => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = node('a'); link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const sample = () => ({ ...emptyWorkspace(now()), products: sampleProducts.map(({ id, sku, name, category, price, stock, reorder }) => ({ id, sku, name, category, price, stock, reorder })) });

export function stockroom() {
  let workspace = sample();
  let mode = 'sample';
  let baseline = null;
  let busy = false;
  let stale = false;
  let restore = null;
  let restoreBaseline = null;
  const storage = () => window.localStorage;
  const locked = task => navigator.locks ? navigator.locks.request(STORAGE_KEY, task) : task();
  function controls() {
    for (const form of [$('movement-form'), $('add-product-form'), $('edit-product-form')]) {
      for (const input of form.elements) input.disabled = busy || stale || (form.id === 'movement-form' && !workspace.products.length);
    }
    for (const id of ['sample-workspace', 'saved-workspace', 'reset-demo', 'restore-file', 'confirm-restore', 'cancel-restore', 'start-empty']) $(id).disabled = busy;
    $('reset-demo').hidden = mode !== 'sample';
    $('sample-workspace').setAttribute('aria-pressed', String(mode === 'sample'));
    $('saved-workspace').setAttribute('aria-pressed', String(mode === 'saved'));
    $('stock-mode').textContent = mode === 'sample' ? 'Sample workspace. Changes here reset on reload.' : stale ? 'Saved records changed in another tab. Open My saved records to reload them.' : 'Saved in this browser only. Keep a downloaded backup.';
    $('stock-saved-at').textContent = mode === 'saved' ? 'Last saved: ' + new Date(workspace.updatedAt).toLocaleString() : 'Sample figures are not your business records.';
  }
  function render() {
    $('stock-lines').textContent = String(workspace.products.length);
    $('stock-low').textContent = String(workspace.products.filter(p => p.stock <= p.reorder).length);
    $('stock-value').textContent = stockValueText(workspace);
    const query = $('stock-search').value.trim().toLowerCase();
    const visible = workspace.products.filter(p => (p.name + ' ' + p.sku + ' ' + p.category).toLowerCase().includes(query) && (!$('low-only').checked || p.stock <= p.reorder));
    $('stock-rows').replaceChildren(...visible.map(p => {
      const row = node('tr'), label = node('th'); label.scope = 'row';
      label.append(node('strong', p.name), node('small', p.sku));
      const status = node('td'), badge = node('span', p.stock <= p.reorder ? 'Review stock' : 'In stock');
      badge.className = p.stock <= p.reorder ? 'demo-badge warm' : 'demo-badge'; status.append(badge);
      const action = node('td'), edit = node('button', 'Edit'); edit.type = 'button'; edit.className = 'lab-button'; edit.disabled = busy || stale;
      edit.setAttribute('aria-label', 'Edit ' + p.name);
      edit.addEventListener('click', () => {
        const form = $('edit-product-form');
        form.elements.productId.value = p.id;
        for (const key of ['name', 'category', 'price', 'reorder']) form.elements[key].value = p[key];
        $('edit-product-name').textContent = p.name + ' · ' + p.sku;
        $('edit-product').hidden = false; form.elements.name.focus();
      });
      action.append(edit);
      row.append(label, node('td', p.category), node('td', String(p.stock)), node('td', String(p.reorder)), status, action);
      return row;
    }));
    $('stock-empty').hidden = visible.length > 0;
    $('stock-empty').textContent = workspace.products.length ? 'No matching products. Clear the search or low-stock filter.' : 'No products yet. Add your first product below.';
    const selected = $('movement-product').value;
    $('movement-product').replaceChildren(...workspace.products.map(p => { const option = node('option', p.name + ' · ' + p.sku); option.value = p.id; return option; }));
    if (workspace.products.some(p => p.id === selected)) $('movement-product').value = selected;
    $('movement-list').replaceChildren(...workspace.movements.slice(-100).reverse().map(m => {
      const p = workspace.products.find(p => p.id === m.productId), item = node('li');
      item.append(node('strong', `${p.name}: ${m.direction === 'in' ? '+' : '−'}${m.quantity} · ${m.before} → ${m.after}`), node('span', new Date(m.at).toLocaleString() + (m.note ? ' · ' + m.note : '')));
      return item;
    }));
    $('movement-empty').hidden = workspace.movements.length > 0;
    $('history-count').textContent = workspace.movements.length > 100 ? 'Showing the latest 100 movements. The history export includes all ' + workspace.movements.length + '.' : workspace.movements.length + (workspace.movements.length === 1 ? ' recorded movement' : ' recorded movements');
    controls();
  }
  async function run(task) {
    if (busy) return;
    busy = true; message(''); controls();
    try { await task(); } catch (error) { message(error.message || 'The change could not be completed.', true); }
    finally { busy = false; render(); }
  }
  async function commit(next) {
    if (stale) throw new Error('Open My saved records to reload before making changes.');
    backupText(next); // Every accepted workspace must remain exportable/restorable.
    if (mode === 'saved') baseline = await locked(() => saveWorkspace(storage(), next, baseline));
    workspace = next;
  }
  function resetForms() {
    $('stock-search').value = ''; $('low-only').checked = false;
    $('movement-form').reset(); $('add-product-form').reset();
    $('edit-product').hidden = true; $('restore-preview').hidden = true;
    $('restore-file').value = ''; restore = null;
  }
  $('stock-search').addEventListener('input', render);
  $('low-only').addEventListener('change', render);
  $('sample-workspace').addEventListener('click', () => run(async () => {
    if (mode === 'sample') return;
    mode = 'sample'; stale = false; workspace = sample(); resetForms(); message('Sample workspace opened. Your saved records have not changed.');
  }));
  $('saved-workspace').addEventListener('click', () => run(async () => {
    let saved;
    try { saved = readSaved(storage()); }
    catch { throw new Error('Saved records could not be read. Use a downloaded backup to restore them. Existing browser data has not been overwritten.'); }
    let next = saved.workspace;
    let raw = saved.raw;
    if (!next) { next = emptyWorkspace(now()); raw = await locked(() => saveWorkspace(storage(), next, saved.raw)); }
    workspace = next; baseline = raw; mode = 'saved'; stale = false; resetForms();
    message('Your saved workspace is open. Records stay on this device and browser.');
  }));
  $('movement-form').addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = { productId: form.elements.product.value, direction: form.elements.direction.value, quantity: form.elements.quantity.value, note: form.elements.note.value };
    run(async () => { await commit(recordInventoryMovement(workspace, fields, now(), crypto.randomUUID())); form.elements.quantity.value = ''; form.elements.note.value = ''; message(mode === 'saved' ? 'Stock movement saved in this browser.' : 'Sample movement recorded.'); });
  });
  $('add-product-form').addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    run(async () => { await commit(addInventoryProduct(workspace, fields, now())); form.reset(); message(mode === 'saved' ? 'Product saved in this browser.' : 'Sample product added.'); });
  });
  $('edit-product-form').addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    run(async () => { await commit(editInventoryProduct(workspace, fields.productId, fields, now())); $('edit-product').hidden = true; message('Product details updated. Quantities change only through stock movements.'); });
  });
  $('cancel-edit').addEventListener('click', () => { $('edit-product').hidden = true; });
  $('reset-demo').addEventListener('click', () => { if (busy || mode !== 'sample') return; workspace = sample(); resetForms(); render(); message('Sample workspace restored.'); });
  const filename = suffix => 'stockroom-' + mode + '-' + new Date().toISOString().slice(0, 10) + suffix;
  $('export-backup').addEventListener('click', () => { try { download(backupText(workspace), filename('.json'), 'application/json'); message('Backup download prepared. Keep it somewhere safe.'); } catch (e) { message(e.message, true); } });
  $('export-stock').addEventListener('click', () => download(inventoryCsv(workspace), filename('-products.csv'), 'text/csv;charset=utf-8'));
  $('export-movements').addEventListener('click', () => download(movementCsv(workspace), filename('-history.csv'), 'text/csv;charset=utf-8'));
  $('start-empty').addEventListener('click', () => run(async () => {
    restoreBaseline = storage().getItem(STORAGE_KEY);
    restore = emptyWorkspace(now());
    $('restore-summary').textContent = 'This starts an empty saved workspace and replaces this browser’s existing Stockroom records. Download the existing records first if you need them. Nothing changes until you confirm below.';
    $('backup-existing').hidden = restoreBaseline === null;
    $('restore-preview').hidden = false;
    message('Review the replacement before starting a new workspace.');
  }));
  $('restore-file').addEventListener('change', () => run(async () => {
    restore = null; $('restore-preview').hidden = true;
    const file = $('restore-file').files[0]; if (!file) return;
    if (file.size > LIMITS.backupBytes) throw new Error('Choose a JSON backup smaller than 2 MB.');
    const parsed = parseBackup(await file.text());
    restoreBaseline = storage().getItem(STORAGE_KEY);
    $('restore-summary').textContent = `This backup contains ${parsed.products.length} products and ${parsed.movements.length} movements. Restoring it replaces this browser’s saved Stockroom records. Download the existing saved records first if you need them.`;
    $('backup-existing').hidden = restoreBaseline === null;
    restore = parsed; $('restore-preview').hidden = false; message('Backup checked. Review it before replacing saved records.');
  }));
  $('backup-existing').addEventListener('click', () => { if (restoreBaseline !== null) download(restoreBaseline, 'stockroom-existing-records.json', 'application/json'); });
  $('cancel-restore').addEventListener('click', () => { restore = null; $('restore-preview').hidden = true; $('restore-file').value = ''; });
  $('confirm-restore').addEventListener('click', () => run(async () => {
    if (!restore) return;
    const next = { ...restore, revision: 0, updatedAt: now() };
    const raw = await locked(() => saveWorkspace(storage(), next, restoreBaseline));
    workspace = next; baseline = raw; mode = 'saved'; stale = false; resetForms(); message('Reviewed workspace saved in this browser.');
  }));
  window.addEventListener('storage', event => {
    if (mode === 'saved' && (event.key === STORAGE_KEY || event.key === null)) { stale = true; $('edit-product').hidden = true; render(); message('Saved records changed in another tab. Open My saved records to reload them.', true); }
  });
  window.addEventListener('pageshow', () => {
    if (mode !== 'saved') return;
    try { if (storage().getItem(STORAGE_KEY) !== baseline) { stale = true; render(); } } catch { stale = true; render(); }
  });
  render();
}
