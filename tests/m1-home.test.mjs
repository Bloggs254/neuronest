import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const read = name => readFileSync(new URL('../dist/' + name, import.meta.url), 'utf8');
const html = read('index.html');

test('M1 section order, anchors and five service URLs remain explicit in static HTML', () => {
  const sequence = ['hero-title','intro-title','solutions','packages','work','approach','why-title','guides','about','faq','contact'];
  let last = -1;
  for (const id of sequence) { const index = html.indexOf(`id="${id}"`); assert.ok(index > last, id); last = index; }
  assert.match(html, /class="skip" href="#main"/);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  for (const slug of ['websites','marketing','ai-assistants','automation','business-systems']) assert.ok(html.includes(`href="services/${slug}.html"`));
});
test('M1 cannot collect or deliver inquiries or load legacy assistant, feedback or motion', () => {
  assert.doesNotMatch(html, /<form\b|<input\b|<textarea\b|mailto:|tel:|wa\.me|feedback\.js|app\.js|gsap|art-motion|nest-sculpture|data-service=/i);
  assert.match(html, /Contact is not connected yet/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
  const js = read('assets/js/site.js');
  assert.ok(Buffer.byteLength(js) < 5000);
  assert.doesNotMatch(js, /fetch\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|window\.open|setInterval|\.innerHTML/);
});
test('provisional commercial details and project status are unambiguous', () => {
  for (const price of ['35,000','65,000','95,000']) assert.ok(html.includes(price));
  assert.doesNotMatch(html, /55,000|25,000|30,000|50,000|5,000 a month/);
  assert.match(html, /Local review only/);
  assert.match(html, /not an offer or a quote/);
  assert.match(html, /Not yet an incorporated company/);
  assert.match(html, /In development/);
  assert.match(html, /Concept, not a client project/);
  assert.doesNotMatch(html, /<a[^>]+href="(?:https?:|[^\"]*guides\/)/);
  assert.doesNotMatch(html, /Bloggs|Joe|Follow on X|<script[^>]+ld\+json/);
});
test('N geometry, node colours and single-run motion respect the supplied brand', () => {
  const light = read('assets/brand/neuronest-icon-light.svg');
  const dark = read('assets/brand/neuronest-icon-dark.svg');
  assert.equal(dark, light.replaceAll('#12102B','#FFFFFF'));
  for (const svg of [light,dark,html]) {
    assert.match(svg, /M52 150 V50 L148 150 V50/);
    assert.match(svg, /stroke-width="16"/);
    assert.equal([...svg.matchAll(/r="20"/g)].length, 4);
  }
  const css = read('assets/css/site.css');
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css, /infinite|scroll-timeline|animation-timeline|box-shadow|linear-gradient|rotate\(/);
  assert.match(css, /\.hero-mark \.node\.amber\{fill:var\(--amber\)/);
});
test('licensed WOFF2 files have correct signatures and pinned hashes', () => {
  const expected = JSON.parse(readFileSync(new URL('../docs/font-provenance.json',import.meta.url),'utf8'));
  for (const font of expected.fonts) {
    const bytes = readFileSync(new URL('../dist/assets/fonts/'+font.file,import.meta.url));
    assert.equal(bytes.subarray(0,4).toString(),'wOF2');
    assert.equal(createHash('sha256').update(bytes).digest('hex'),font.sha256);
    assert.match(read('assets/fonts/'+font.license),/SIL OPEN FONT LICENSE Version 1\.1/i);
  }
});
test('favicons and manifest use relative paths and exact brand colours', () => {
  const manifest = JSON.parse(read('assets/brand/site.webmanifest'));
  assert.equal(manifest.theme_color,'#12102B');
  assert.equal(manifest.background_color,'#12102B');
  for (const icon of manifest.icons) assert.ok(existsSync(new URL('../dist/assets/brand/'+icon.src,import.meta.url)));
  const ico=readFileSync(new URL('../dist/assets/brand/favicon.ico',import.meta.url));
  assert.equal(ico.readUInt16LE(2),1);
  assert.match(read('assets/brand/favicon.svg'),/prefers-color-scheme:dark/);
});
