import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, lstatSync } from 'node:fs';
import { resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = resolve(root, 'dist');
function filesIn(directory) {
  return readdirSync(directory).flatMap(name => {
    assert.ok(!name.startsWith('.'), `Hidden path in public bundle: ${relative(publicRoot, directory)}/${name}`);
    const file = resolve(directory, name);
    const info = lstatSync(file);
    assert.ok(!info.isSymbolicLink(), `Public bundle contains a link: ${relative(publicRoot, file)}`);
    return info.isDirectory() ? filesIn(file) : [file];
  });
}
const files = filesIn(publicRoot);
const htmlFiles = files.filter(file => file.endsWith('.html'));

test('vendored animation code matches its recorded integrity hash', () => {
  const provenance = JSON.parse(readFileSync(resolve(publicRoot, 'vendor/gsap-provenance.json'), 'utf8'));
  const bundle = readFileSync(resolve(publicRoot, `vendor/gsap-${provenance.version}.min.js`));
  assert.equal(createHash('sha256').update(bundle).digest('hex'), provenance.bundleSHA256);
});

test('every page restricts scripts, connections and native form submission before loading assets', () => {
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    const meta = /<meta http-equiv="Content-Security-Policy" content="([^"]+)">/.exec(html);
    assert.ok(meta, `${file}: missing CSP`);
    assert.ok(meta.index < html.search(/<(?:link|script|style)\b/i), `${file}: CSP arrives after resources`);
    const directives = new Map(meta[1].split(';').map(part => part.trim().split(/\s+/)).map(([key, ...values]) => [key, values.join(' ')]));
    for (const key of ['default-src', 'script-src-attr', 'connect-src', 'object-src', 'base-uri', 'form-action', 'frame-src', 'worker-src']) {
      assert.equal(directives.get(key), "'none'", `${file}: ${key} permits unexpected activity`);
    }
    assert.equal(directives.get('script-src'), "'self'");
    assert.equal(directives.get('font-src'), "'self'");
    assert.equal(directives.get('img-src'), "'self'");
    assert.match(html, /<meta name="referrer" content="no-referrer">/);
    assert.doesNotMatch(html, /\son\w+\s*=/i, `${file}: inline event handler`);
    assert.doesNotMatch(html, /<base\b/i, `${file}: unexpected base URL`);
    for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const src = /\bsrc="([^"]+)"/.exec(script[1]);
      assert.ok(src, `${file}: executable inline script`);
      assert.doesNotMatch(src[1], /^(?:[a-z]+:|\/\/)/i, `${file}: remote script`);
      assert.equal(script[2].trim(), '');
    }
    for (const anchor of html.matchAll(/<a\b[^>]*>/gi)) {
      if (!/target="_blank"/i.test(anchor[0])) continue;
      assert.match(anchor[0], /rel="[^"]*\bnoopener\b[^"]*"/i, `${file}: unsafe new-tab link`);
    }
  }
});

test('public package excludes private files, unexpected data dumps and obvious credential formats', () => {
  const dataFiles = new Set(['assets/artwork.json', 'fonts/provenance.json', 'vendor/gsap-provenance.json']);
  const allowed = new Set(['.html', '.css', '.js', '.svg', '.webp', '.ttf', '.txt']);
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
    /\bgithub_pat_[A-Za-z0-9_]{70,}\b/,
    /\bsk-(?:proj-)?[A-Za-z0-9_-]{40,}\b/,
    /\bAKIA[0-9A-Z]{16}\b/
  ];
  for (const file of files) {
    const name = relative(publicRoot, file).replaceAll('\\', '/');
    assert.ok(!name.split('/').some(part => part.startsWith('.')), `Hidden public file: ${name}`);
    assert.ok(allowed.has(extname(file)) || dataFiles.has(name), `Unexpected public file: ${name}`);
    if (['.ttf', '.webp'].includes(extname(file))) continue;
    const content = readFileSync(file, 'utf8');
    for (const pattern of secretPatterns) assert.ok(!pattern.test(content), `Possible credential in ${name}; inspect privately`);
  }
});

test('first-party UI code does not parse strings as HTML or executable code', () => {
  for (const file of files.filter(file => file.endsWith('.js') && !relative(publicRoot, file).startsWith('vendor'))) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /\b(?:innerHTML|outerHTML|insertAdjacentHTML)\b|\beval\s*\(|\bnew\s+Function\s*\(|document\.write\s*\(/, file);
  }
});

test('publishing uses pinned actions and deployment permissions stay out of validation', () => {
  const workflow = readFileSync(resolve(root, '.github/workflows/pages.yml'), 'utf8');
  const actions = [...workflow.matchAll(/uses:\s*([^\s#]+)/g)].map(match => match[1]);
  assert.equal(actions.length, 4);
  for (const action of actions) assert.match(action, /^actions\/[a-z-]+@[a-f0-9]{40}$/);
  const validation = workflow.split('  validate:')[1].split('  deploy:')[0];
  assert.doesNotMatch(validation, /pages:\s*write|id-token:\s*write/);
  assert.match(validation, /persist-credentials: false/);
  assert.match(workflow, /needs: validate/);
  assert.match(workflow, /if: github\.ref == 'refs\/heads\/main' && github\.event_name != 'pull_request'/);
  assert.doesNotMatch(workflow, /pull_request_target|secrets: inherit/);
  assert.match(workflow, /tar --directory dist /);
});
