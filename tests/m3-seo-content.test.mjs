import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const project=fileURLToPath(new URL('../',import.meta.url));
const root=resolve(project,'dist');
const config=JSON.parse(readFileSync(resolve(project,'config/site.json'),'utf8'));
const read=name=>readFileSync(resolve(root,name),'utf8');
function pages(dir=root){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?pages(resolve(dir,e.name)):e.name.endsWith('.html')?[resolve(dir,e.name)]:[])}
const guideSlugs=['stock-going-missing','profitable-but-no-cash','run-your-shop-remotely','stock-count-mismatch','ai-for-supermarkets'];

test('all pages carry unique metadata derived from the configured site URL',()=>{
  const htmlFiles=pages();assert.equal(htmlFiles.length,23);const titles=new Set(),descriptions=new Set();
  for(const file of htmlFiles){
    const html=readFileSync(file,'utf8');const route=relative(root,file).replaceAll('\\','/');
    assert.match(html,/<html lang="en-KE">/);
    if(route==='404.html')assert.match(html,/<meta name="robots" content="noindex, nofollow">/);
    else if(route.startsWith('guides/')&&route!=='guides/index.html')assert.match(html,/<meta name="robots" content="noindex, follow">/);
    else assert.doesNotMatch(html,/<meta name="robots" content="noindex/);
    assert.equal([...html.matchAll(/<link rel="canonical"/g)].length,1,route);
    for(const name of ['og:title','og:description','og:url','og:image'])assert.match(html,new RegExp(`<meta property="${name}"`),route);
    for(const name of ['twitter:card','twitter:title','twitter:description','twitter:image'])assert.match(html,new RegExp(`<meta name="${name}"`),route);
    assert.ok(html.includes(config.siteUrl),route);
    const title=/<title>([^<]+)<\/title>/.exec(html)?.[1];const description=/<meta name="description" content="([^"]+)">/.exec(html)?.[1];
    assert.ok(title&&description,route);assert.ok(!titles.has(title),`duplicate title: ${title}`);assert.ok(!descriptions.has(description),`duplicate description: ${description}`);titles.add(title);descriptions.add(description);
  }
});

test('guide index is public while placeholder guides remain noindex and outside sitemap',()=>{
  assert.doesNotMatch(read('guides/index.html'),/noindex/);
  for(const slug of guideSlugs){
    const html=read(`guides/${slug}/index.html`);assert.match(html,/<meta name="robots" content="noindex, follow">/);assert.match(html,/\[TODO: Nora's reviewed copy\]/);assert.match(html,/5 min read · Last reviewed 2026-11-28/);assert.match(html,/href="\.\.\/\.\.\/index\.html#contact"/);assert.doesNotMatch(read('sitemap.xml'),new RegExp(`guides/${slug}`));
  }
  assert.match(read('sitemap.xml'),/<loc>https:\/\/bloggs254\.github\.io\/neuronest\/guides\/<\/loc>/);
});

test('robots and sitemap are generated from the configured URL and real indexable routes',()=>{
  const robots=read('robots.txt');const sitemap=read('sitemap.xml');assert.equal(robots,`User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}sitemap.xml\n`);assert.equal([...sitemap.matchAll(/<url>/g)].length,17);assert.doesNotMatch(sitemap,/404\.html/);for(const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g))assert.ok(match[1].startsWith(config.siteUrl));
});

test('JSON-LD is valid and contains only approved Organization and Service facts',()=>{
  const structured=[];for(const file of pages())for(const match of readFileSync(file,'utf8').matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g))structured.push({file,value:JSON.parse(match[1])});
  assert.equal(structured.length,6);assert.deepEqual(new Set(structured.map(item=>item.value['@type'])),new Set(['Organization','Service']));
  for(const item of structured){const serial=JSON.stringify(item.value);for(const key of ['address','telephone','email','aggregateRating','review','founder','foundingDate','numberOfEmployees'])assert.ok(!serial.includes(`"${key}"`),`${item.file}: ${key}`);assert.equal(item.value['@context'],'https://schema.org')}
  assert.equal(config.localBusinessAddress,'[TODO: address for LocalBusiness schema]');
});

test('search verification and production domain remain explicit one-value configuration markers',()=>{
  assert.equal(config.searchConsoleVerification,'[TODO: verification token]');assert.equal(config.productionDomain,'[TODO: production domain]');for(const file of pages())assert.doesNotMatch(readFileSync(file,'utf8'),/<meta name="google-site-verification" content="\[TODO/);
});

test('brand icons, manifest, social image and self-hosted fonts are complete',()=>{
  const files=[['social-preview.png',1200,630],['apple-touch-icon.png',180,180],['icon-192.png',192,192],['icon-512.png',512,512]];
  for(const [name,width,height] of files){const png=readFileSync(resolve(root,'assets/brand',name));assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height)}
  assert.ok(existsSync(resolve(root,'assets/brand/favicon.ico')));assert.equal(JSON.parse(read('assets/brand/site.webmanifest')).icons.length,2);
  for(const font of ['inter-latin.woff2','plus-jakarta-sans-latin.woff2'])assert.ok(readFileSync(resolve(root,'assets/fonts',font)).length>1000);
  assert.ok(existsSync(resolve(root,'assets/fonts/Inter-OFL.txt')));assert.ok(existsSync(resolve(root,'assets/fonts/PlusJakartaSans-OFL.txt')));assert.match(read('assets/css/brand.css'),/font-display:\s*swap/);
});

test('header amber node has load, hover and scroll animations with reduced-motion gating',()=>{
  const css=read('assets/css/site.css');assert.match(css,/\.logo svg\{[^}]*overflow:visible/);assert.match(css,/\.logo \.amb\{animation:drop 1\.4s linear \.2s both\}/);assert.match(css,/\.logo:hover \.amb\{animation:hop 1s linear 1\}/);assert.match(css,/animation:drop 1\.4s linear \.2s both,catch linear/);assert.match(css,/animation-timeline:auto,--hero/);assert.match(css,/@media \(prefers-reduced-motion:no-preference\)/);assert.match(css,/\.logo \.amb\{transform-box:fill-box;transform-origin:50% 100%/);
});

test('security contacts remain unpublished',()=>{
  assert.equal(existsSync(resolve(root,'.well-known/security.txt')),false);for(const file of pages())assert.doesNotMatch(readFileSync(file,'utf8'),/mailto:|wa\.me|tel:|neuronest@gmail\.com|254747700610/i);
});
