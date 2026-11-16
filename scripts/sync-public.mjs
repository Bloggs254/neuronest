// Keep the existing root-level Pages-compatible files aligned with dist.
import { copyFileSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const name of ['index.html', 'styles.css', 'app.js', 'motion.js', 'icon.svg']) {
  copyFileSync(path.join(root, 'dist', name), path.join(root, name));
}
mkdirSync(path.join(root, 'vendor'), { recursive: true });
for (const entry of readdirSync(path.join(root, 'dist', 'vendor'), { withFileTypes: true })) {
  if (entry.isFile()) copyFileSync(path.join(root, 'dist', 'vendor', entry.name), path.join(root, 'vendor', entry.name));
}
console.log('Updated public file mirrors from dist.');
