import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
function pagesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = resolve(directory, entry.name);
    return entry.isDirectory() ? pagesIn(file) : extname(file) === '.html' ? [file] : [];
  });
}

test('every standalone page has a resolvable local navigation and asset path', () => {
  const pages = pagesIn(root);
  assert.equal(pages.length, 23);
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    for (const match of html.matchAll(/\b(?:href|src|srcset)="([^"]+)"/g)) {
      const link = match[1];
      if (/^(?:https?:|mailto:|tel:|#|data:)/.test(link)) continue;
      const pathname = decodeURIComponent(link.split(/[?#]/)[0]);
      if (!pathname) continue;
      let target = resolve(dirname(page), pathname);
      assert.ok(target.startsWith(root), `Path escapes public root: ${link}`);
      if (existsSync(target) && statSync(target).isDirectory()) target = resolve(target, 'index.html');
      assert.ok(existsSync(target) && statSync(target).isFile(), `${page}: missing ${link}`);
    }
  }
});

test('all service enquiry links target contact without stale query parameters', () => {
  const slugs = ['websites', 'ai-assistants', 'automation', 'business-systems', 'marketing'];
  for (const slug of slugs) {
    const html = readFileSync(resolve(root, 'services', `${slug}.html`), 'utf8');
    assert.ok(html.includes('../index.html#contact'));
    assert.ok(!html.includes('?service='));
  }
  for (const page of pagesIn(root)) assert.ok(!readFileSync(page, 'utf8').includes('?service='), `${page}: stale service query`);
});
