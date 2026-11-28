import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const read = name => readFileSync(new URL('../dist/' + name, import.meta.url), 'utf8');
const html = read('index.html');

test('M1 section order, anchors and five service URLs remain explicit in static HTML', () => {
  const sequence = ['hero-title','intro-title','solutions','packages','work','how-we-work','why-neuronest','guides','about','faq','contact'];
  let last = -1;
  for (const id of sequence) { const index = html.indexOf(`id="${id}"`); assert.ok(index > last, id); last = index; }
  assert.match(html, /class="skip" href="#main"/);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
  for (const slug of ['websites','marketing','ai-assistants','automation','business-systems']) assert.ok(html.includes(`href="services/${slug}.html"`));
});
test('GitHub Pages inquiry form is visible but disabled and cannot deliver', () => {
  assert.match(html, /<form class="inquiry-form"/);
  assert.match(html, /<fieldset disabled>/);
  assert.match(html, /Enquiries are not open yet/);
  assert.doesNotMatch(html, /mailto:|tel:|wa\.me|feedback\.js|app\.js|gsap|art-motion|nest-sculpture|data-service=|\?service=/i);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /form-action 'none'/);
  const js = read('assets/js/site.js');
  assert.ok(Buffer.byteLength(js) < 5000);
  assert.doesNotMatch(js, /fetch\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|window\.open|setInterval|\.innerHTML/);
});
test('provisional commercial details and project status are unambiguous', () => {
  for (const price of ['35,000','65,000','95,000']) assert.ok(html.includes(price));
  assert.doesNotMatch(html, /55,000|25,000|30,000|50,000|5,000 a month/);
  assert.match(html, /Indicative website packages/);
  assert.match(html, /Final scope and quotation/);
  assert.match(html, /\[TODO: approved About copy\]/);
  assert.match(html, /In development/);
  assert.match(html, /Concept, not a client project/);
  assert.doesNotMatch(html, /<a[^>]+href="(?:https?:|[^\"]*guides\/)/);
  assert.doesNotMatch(html, /Bloggs|Joe|Follow on X|<script[^>]+ld\+json/);
});
test('N geometry and supplied CSS-only motion sequence respect the brand and fallbacks', () => {
  const light = read('assets/brand/neuronest-icon-light.svg');
  const dark = read('assets/brand/neuronest-icon-dark.svg');
  assert.equal(dark, light.replaceAll('#12102B','#FFFFFF'));
  for (const svg of [light,dark]) {
    assert.match(svg, /M52 150 V50 L148 150 V50/);
    assert.match(svg, /stroke-width="16"/);
    assert.equal([...svg.matchAll(/r="20"/g)].length, 4);
  }
  const hero=html.match(/<div class="hero-vis">([\s\S]*?)<\/div>/)?.[1]||'';
  assert.match(hero, /M52 150 V50 L148 150 V50/);
  assert.match(hero, /stroke-width="16"/);
  assert.equal([...hero.matchAll(/r="20"/g)].length,4);
  assert.match(html,/class="wrap header-row hdr-in"/);
  assert.match(html,/class="amb"/);
  const css = read('assets/css/site.css');
  assert.match(css, /prefers-reduced-motion:reduce/);
  for(const name of ['draw','pop','drop','jolt','travel','hop','hdr-shrink','leave','catch'])assert.match(css,new RegExp(`@keyframes ${name}\\{`));
  assert.match(css, /@supports \(animation-timeline:view\(\)\)/);
  assert.match(css, /\.pkt\{display:none\}/);
  assert.match(css, /\.hero-n:hover\{transform:scale\(1\.08\) rotate\(-6deg\)\}/);
  assert.doesNotMatch(css, /url\([^)]*(?:gsap|animation)/i);
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
