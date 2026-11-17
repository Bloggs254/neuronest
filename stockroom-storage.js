import { parseBackup, backupText } from './stockroom-core.js';
export const STORAGE_KEY = 'neuronest.stockroom.v1';
// Commit before updating the visible workspace. A failed write never masquerades as saved.
export function readSaved(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  return { raw, workspace: raw === null ? null : parseBackup(raw) };
}
export function saveWorkspace(storage, workspace, expectedRaw) {
  if (storage.getItem(STORAGE_KEY) !== expectedRaw) throw new Error('These records changed in another tab. Reload saved records before making another change.');
  const raw = backupText(workspace);
  try { storage.setItem(STORAGE_KEY, raw); }
  catch { throw new Error('The browser could not save this change. Export a backup of your current records and check browser storage.'); }
  return raw;
}
