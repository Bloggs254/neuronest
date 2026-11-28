import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const config=JSON.parse(await readFile(path.join(root,'config','site.json'),'utf8'));
const siteUrl=config.siteUrl.endsWith('/')?config.siteUrl:`${config.siteUrl}/`;
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const schema=value=>JSON.stringify(value).replaceAll('<','\\u003c');
const reviewed='2026-11-28';

const guides=[
  {slug:'stock-going-missing',title:'Stock going missing',summary:'A guide placeholder for investigating stock differences with a clear, reviewable process.',minutes:5},
  {slug:'profitable-but-no-cash',title:'Profitable but no cash',summary:'A guide placeholder about separating sales, profit and available cash.',minutes:5},
  {slug:'run-your-shop-remotely',title:'Run your shop remotely',summary:'A guide placeholder about routines, authority and records when an owner is away.',minutes:5},
  {slug:'stock-count-mismatch',title:'Stock count mismatch',summary:'A guide placeholder about tracing differences between recorded and physical stock.',minutes:5},
  {slug:'ai-for-supermarkets',title:'AI for supermarkets',summary:'A guide placeholder about choosing bounded, reviewable AI uses for supermarket work.',minutes:5}
];

const csp=`default-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; worker-src 'none'; media-src 'none'; manifest-src 'self'`;
const head=({title,description,canonical,depth='../',noindex=false,type='website'})=>`<!doctype html><html lang="en-KE"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#12102B">${noindex?'<meta name="robots" content="noindex, follow">':''}<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="${type}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${siteUrl}assets/brand/social-preview.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${siteUrl}assets/brand/social-preview.png"><link rel="icon" href="${depth}assets/brand/favicon.svg" type="image/svg+xml"><link rel="alternate icon" href="${depth}assets/brand/favicon.ico"><link rel="apple-touch-icon" href="${depth}assets/brand/apple-touch-icon.png"><link rel="manifest" href="${depth}assets/brand/site.webmanifest"><link rel="preload" href="${depth}assets/fonts/plus-jakarta-sans-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="${depth}assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="${depth}assets/css/brand.css"><link rel="stylesheet" href="${depth}assets/css/m2.css"><link rel="stylesheet" href="${depth}assets/css/m3.css"><script src="${depth}assets/js/m2.js" defer></script></head>`;
const header=(depth='../')=>`<body><a class="skip" href="#main">Skip to content</a><header class="header"><a class="brand" href="${depth}index.html" aria-label="NeuroNest home"><img src="${depth}assets/brand/neuronest-icon-light.svg" width="48" height="48" alt="">NeuroNest</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav">Menu</button><nav id="nav" aria-label="Main navigation"><a href="${depth}index.html#solutions">Services</a><a href="${depth}index.html#packages">Pricing</a><a href="${depth}guides/">Guides</a><a href="${depth}work/">Work</a><a href="${depth}index.html#faq">FAQ</a><a class="nav-cta" href="${depth}index.html#contact">Contact status</a></nav></header>`;
const footer=(depth='../')=>`<footer class="studio-footer"><div class="footer-grid"><div><a class="brand" href="${depth}index.html" aria-label="NeuroNest home"><img src="${depth}assets/brand/neuronest-icon-dark.svg" width="42" height="42" alt="">NeuroNest</a><p>Websites. AI. Systems.<br>Kenya and East Africa.</p></div><nav class="footer-services" aria-label="Footer"><a href="${depth}services/websites.html">Websites</a><a href="${depth}services/ai-assistants.html">AI assistants</a><a href="${depth}services/business-systems.html">Business systems</a><a href="${depth}guides/">Guides</a><a href="${depth}privacy.html">Privacy</a><a href="${depth}terms.html">Terms</a></nav></div><div class="footer-bottom"><span>© 2026 NeuroNest</span><span>Contact channels are being verified.</span></div></footer></body></html>`;

await mkdir(path.join(dist,'guides'),{recursive:true});
const cards=guides.map(guide=>`<article><h2><a href="${guide.slug}/">${guide.title}</a></h2><p>${guide.summary}</p><p class="guide-meta">${guide.minutes} min read · Last reviewed ${reviewed}</p></article>`).join('');
const indexDescription='Five practical NeuroNest guide placeholders awaiting reviewed copy.';
await writeFile(path.join(dist,'guides','index.html'),`${head({title:'Practical business guides — NeuroNest',description:indexDescription,canonical:`${siteUrl}guides/`})}${header()}<main id="main"><section class="section m2-hero"><div class="m2-hero-grid"><h1>Practical guides for clearer business decisions.</h1><p>These guide structures are ready for reviewed copy. Each unfinished article remains excluded from search indexing.</p></div></section><section class="section m3-guide-index" aria-labelledby="guide-list-title"><div class="m2-heading"><h2 id="guide-list-title">Guides awaiting reviewed copy</h2><p>No statistics, customer results or unreviewed advice have been added.</p></div><div class="m3-guide-cards">${cards}</div></section></main>${footer()}`);

for(const guide of guides){
  const directory=path.join(dist,'guides',guide.slug);await mkdir(directory,{recursive:true});
  const canonical=`${siteUrl}guides/${guide.slug}/`;
  const page=`${head({title:`${guide.title} — NeuroNest`,description:guide.summary,canonical,depth:'../../',noindex:true,type:'article'})}${header('../../')}<main id="main"><article class="m3-article"><header class="section m2-hero"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../">Guides</a> / ${guide.title}</nav><h1>${guide.title}</h1><p>${guide.summary}</p><p class="guide-meta">${guide.minutes} min read · Last reviewed ${reviewed}</p></header><div class="section m3-article-layout"><aside aria-label="Guide status"><strong>Copy status</strong><p>This structure is complete, but its body is waiting for independent review.</p></aside><div class="m3-article-copy"><section aria-labelledby="guide-body-${guide.slug}"><h2 id="guide-body-${guide.slug}">Guide body</h2><p>[TODO: Nora's reviewed copy]</p></section><section class="m3-guide-next" aria-labelledby="guide-cta-${guide.slug}"><h2 id="guide-cta-${guide.slug}">Need help with the underlying problem?</h2><p>Review what NeuroNest can currently scope, then check the enquiry status.</p><a class="m2-link" href="../../index.html#contact">Check enquiry status</a></section></div></div></article></main>${footer('../../')}`;
  await writeFile(path.join(directory,'index.html'),page);
}

{
  const filename=path.join(dist,'index.html');
  const home=await readFile(filename,'utf8');
  await writeFile(filename,home.replaceAll('href="#guides"','href="guides/"'));
}

const htmlFiles=[];
async function collect(directory){for(const entry of await readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())await collect(file);else if(entry.name.endsWith('.html'))htmlFiles.push(file)}}
await collect(dist);
const routeFor=relative=>relative==='index.html'?'':relative.replace(/index\.html$/,'');
const serviceNames={
  'services/websites.html':'Website design and development',
  'services/ai-assistants.html':'AI assistants',
  'services/automation.html':'Workflow automation',
  'services/business-systems.html':'Business systems',
  'services/marketing.html':'Marketing and lead generation'
};
for(const file of htmlFiles){
  const relative=path.relative(dist,file).replaceAll('\\','/');
  let html=await readFile(file,'utf8');
  const canonical=siteUrl+routeFor(relative);
  const title=/<title>([^<]+)<\/title>/.exec(html)?.[1]||'NeuroNest';
  const description=/<meta name="description" content="([^"]+)">/.exec(html)?.[1]||'NeuroNest websites, AI assistants and business systems.';
  html=html
    .replace(/<html lang="[^"]*">/,'<html lang="en-KE">')
    .replace(/\?service=[^"#]+(?=#contact)/g,'')
    .replace(/<!-- Search Console verification is configured through config\/site\.json\. -->/g,'')
    .replace(/<link rel="canonical"[^>]*>/g,'')
    .replace(/<meta property="og:[^"]+"[^>]*>/g,'')
    .replace(/<meta name="twitter:[^"]+"[^>]*>/g,'')
    .replace(/<meta name="google-site-verification"[^>]*>/g,'')
    .replace('</head>',`<link rel="canonical" href="${canonical}"><meta property="og:type" content="${relative.startsWith('guides/')&&relative!=='guides/index.html'?'article':'website'}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${siteUrl}assets/brand/social-preview.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${siteUrl}assets/brand/social-preview.png">${config.searchConsoleVerification.startsWith('[TODO')?'<!-- Search Console verification is configured through config/site.json. -->':`<meta name="google-site-verification" content="${esc(config.searchConsoleVerification)}">`}</head>`);
  html=html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'');
  if(relative==='index.html')html=html.replace('</head>',`<script type="application/ld+json">${schema({'@context':'https://schema.org','@type':'Organization',name:'NeuroNest',url:siteUrl,areaServed:['Kenya','East Africa']})}</script></head>`);
  if(serviceNames[relative])html=html.replace('</head>',`<script type="application/ld+json">${schema({'@context':'https://schema.org','@type':'Service',name:serviceNames[relative],provider:{'@type':'Organization',name:'NeuroNest',url:siteUrl},areaServed:['Kenya','East Africa']})}</script></head>`);
  await writeFile(file,html);
}

const indexed=[];
for(const file of htmlFiles){const relative=path.relative(dist,file).replaceAll('\\','/');const html=await readFile(file,'utf8');if(relative!=='404.html'&&!/<meta name="robots" content="noindex/.test(html))indexed.push(routeFor(relative))}
indexed.sort((a,b)=>a.localeCompare(b));
await writeFile(path.join(dist,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`);
await writeFile(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexed.map(route=>`  <url><loc>${siteUrl+route}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Built ${guides.length} protected guide placeholders and SEO output for ${htmlFiles.length} pages from ${siteUrl}`);
