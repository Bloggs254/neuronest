import { cp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const base='https://bloggs254.github.io/neuronest/';
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const publicPages=['','privacy.html','services/websites.html','services/ai-assistants.html','services/automation.html','services/business-systems.html','services/marketing.html','work/','work/openduka.html','work/inventory.html','work/stockroom.html','work/shopfront.html','work/frontdesk.html','work/flowboard.html','work/campaign-kit.html'];
const meta={
  'index.html':['NeuroNest | Websites, AI assistants and business systems in Kenya','Professional websites, AI assistants and practical business systems for businesses in Kenya and across East Africa.'],
  'privacy.html':['Privacy and inquiry handling — NeuroNest','How NeuroNest handles website information and prepares for future inquiry services.'],
  'work/index.html':['Our work — NeuroNest','Verified NeuroNest product screens and clearly labelled concepts.'],
  'work/openduka.html':['OpenDuka product evidence — NeuroNest','Genuine OpenDuka product screenshots using fictional sample data, with current development limits stated clearly.']
};

await rm(path.join(dist,'guides'),{recursive:true,force:true});
await writeFile(path.join(dist,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${base}sitemap.xml\n`);
await writeFile(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPages.map(page=>`  <url><loc>${base+page}</loc></url>`).join('\n')}\n</urlset>\n`);

const htmlFiles=[];
async function collect(directory){for(const entry of await readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())await collect(file);else if(entry.name.endsWith('.html'))htmlFiles.push(file)}}
await collect(dist);
for(const file of htmlFiles){const relative=path.relative(dist,file).replaceAll('\\','/');let html=await readFile(file,'utf8');if(relative!=='404.html')html=html.replace(/<meta name="robots" content="noindex, nofollow">/g,'');html=html.replace('<!-- Local M1 review only. Social artwork and metadata expansion deferred to M3. -->','').replaceAll('Local review. Contact channels remain disabled.','Contact channels are being verified.').replaceAll('The local inquiry prototype can be reviewed only when this site is run on the local M2 server.','A live inquiry service will be introduced only after delivery and privacy controls are verified.').replace('What this preview handles, and what it does not.','What this website handles, and what it does not.').replace('The static preview serves local fonts, images, styles and scripts.','The static website serves local fonts, images, styles and scripts.').replace('<p class="review-note">Founder statement supplied for local review. The call promise and delivery wording still need owner confirmation before publication.</p>','');const currentTitle=/<title>([^<]+)<\/title>/.exec(html)?.[1]||'NeuroNest';const currentDescription=/<meta name="description" content="([^"]*)">/.exec(html)?.[1]||'NeuroNest websites, AI and business systems.';const [title,description]=meta[relative]||[currentTitle,currentDescription];const canonical=base+(relative==='index.html'?'':relative.replace(/index\.html$/,''));html=html.replace(/<html lang="[^"]*">/,'<html lang="en-KE">').replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(title)}</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${esc(description)}">`).replace(/<link rel="canonical"[^>]*>/g,'').replace(/<meta property="og:[^"]+"[^>]*>/g,'').replace(/<meta name="twitter:[^"]+"[^>]*>/g,'').replace('</head>',`<link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${base}assets/brand/social-preview.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${base}assets/brand/social-preview.png"></head>`);await writeFile(file,html)}

let websites=await readFile(path.join(dist,'services','websites.html'),'utf8');
websites=websites
  .replace('Website packages for local review.','Website packages.')
  .replace('Prices and scope are provisional. They are not a public offer or quote until the owner approves them.','These packages are a starting point. Final scope and quotation are confirmed after we understand the project.')
  .replace('Timelines and commercial terms are withheld pending approval.','Timelines and commercial terms are confirmed in a written proposal.');
await writeFile(path.join(dist,'services','websites.html'),websites);

let home=await readFile(path.join(dist,'index.html'),'utf8');
home=home
  .replace('<strong>Local review only.</strong> These package prices and scopes are provisional and await owner approval. They are not an offer or a quote.','<strong>Indicative website packages.</strong> Final scope and quotation are confirmed after we understand the project.')
  .replace('Timelines, ongoing support and commercial terms remain subject to approval.','Timelines, ongoing support and commercial terms are confirmed in a written proposal.')
  .replace('The package figures on this local preview are provisional, not approved prices.','The package figures are indicative and a final quote follows an agreed scope.')
  .replace('This preview does not promise an ongoing support plan.','Any optional support plan is agreed in the proposal.')
  .replace('Five guide drafts are in editorial review. They remain unavailable until independently reviewed and approved.','Practical business guides are being independently reviewed before publication.')
  .replace('No draft is linked or included in the public sitemap. Editorial approval is still required.','New guides will appear here only after editorial approval.')
  .replace('<h3>Contact is not connected yet.</h3>','<h3>Direct enquiries are temporarily unavailable.</h3>')
  .replace('This is a local website preview. Email, phone and WhatsApp will appear here after ownership, monitoring and reply have been verified.','Email, phone and WhatsApp will appear after ownership, monitoring and reply handling have been verified.')
  .replace('There is no enquiry form in this preview. Nothing you type is collected or sent.','There is currently no enquiry form on this website. Nothing is collected or sent.')
  .replace('Local review. Not open for enquiries.','Contact channels are being verified.');
await writeFile(path.join(dist,'index.html'),home);

let privacy=await readFile(path.join(dist,'privacy.html'),'utf8');
privacy=privacy
  .replace('The public static files do not send an inquiry or activate email, phone, WhatsApp or analytics. A separate loopback-only M2 server can test synthetic inquiry delivery locally.','This static website does not collect enquiries or run analytics. Email, phone and WhatsApp will remain unavailable until their ownership, monitoring and data-handling procedures are verified.')
  .replace('<a href="#local">Local inquiry test</a>','<a href="#local">Future enquiries</a>')
  .replace('<h2>Local synthetic inquiry test</h2><p>When the M2 test server is running on this computer, its inquiry page accepts synthetic test details only. It validates and stores them in a local SQLite queue outside the public site. The fake delivery adapter records delivered or failed status; it does not send email, WhatsApp or any network message.</p><p>The test records contain the submitted fields, request ID, status and timestamps. Logs contain request IDs and status, not message content. Local evidence is retained for this milestone review and can be removed through the documented local cleanup procedure after review.</p>','<h2>Future enquiries</h2><p>No enquiry form is active, so this website does not currently receive or store customer messages. Before enquiries are enabled, this page will explain what information is collected, why it is needed, how long it is kept, who processes it and how to request access or deletion.</p>')
  .replace('<h2>Access and erasure procedure</h2><p>During local testing, the reviewer can use a request ID to inspect a synthetic record through the local test evidence tools. The local administrator can delete milestone test storage after evidence is preserved. There is no public deletion endpoint in this phase.</p>','<h2>Access and erasure</h2><p>There is no public enquiry record to access or erase while contact channels are disabled. A verified request method and operating procedure will be published before customer information is collected.</p>')
  .replace('<h2>Decisions required before real inquiries</h2><div class="legal-draft"><p>Owner approval is still required for the lawful basis, retention period, inbox and processors, any international transfer safeguards, access/erasure operating procedure and the final customer notice. This draft is implementation evidence, not legal advice or launch approval.</p></div>','<h2>Before real enquiries</h2><div class="legal-draft"><p>NeuroNest will verify the responsible inbox, processors, retention period, access and deletion procedure, and any transfer safeguards before activating customer enquiries. The customer notice will be updated when those details are confirmed.</p></div>');
await writeFile(path.join(dist,'privacy.html'),privacy);
await cp(path.join(dist,'assets','brand','social-preview.png'),path.join(root,'assets','brand','social-preview.png'));
console.log('Built production metadata, indexing files and 15 approved public routes.');
