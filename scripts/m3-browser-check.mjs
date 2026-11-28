import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire('C:/Users/Joe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const { chromium, firefox }=require('playwright');
const base=process.env.REVIEW_BASE_URL||'http://127.0.0.1:4213/';
const routes=['','404.html','privacy.html','terms.html','guides/','guides/stock-going-missing/','guides/profitable-but-no-cash/','guides/run-your-shop-remotely/','guides/stock-count-mismatch/','guides/ai-for-supermarkets/','services/websites.html','services/ai-assistants.html','services/automation.html','services/business-systems.html','services/marketing.html','work/','work/openduka.html','work/inventory.html','work/stockroom.html','work/shopfront.html','work/frontdesk.html','work/flowboard.html','work/campaign-kit.html'];
const viewports=[{name:'phone-320',width:320,height:800},{name:'phone-390',width:390,height:844},{name:'tablet-768',width:768,height:1024},{name:'desktop-1280',width:1280,height:900},{name:'wide-1920',width:1920,height:1080}];
const out=path.join(root,'docs','m3-v2-evidence');await mkdir(out,{recursive:true});
const engine=process.env.REVIEW_ENGINE==='firefox'?'firefox':'chromium';const browserType=engine==='firefox'?firefox:chromium;
const executablePath=engine==='firefox'?'C:/Program Files/Mozilla Firefox/firefox.exe':'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const browser=await browserType.launch({executablePath,headless:true});const results=[];const failures=[];
for(const viewport of viewports){
  const page=await browser.newPage({viewport});const messages=[];
  page.on('pageerror',error=>messages.push(`pageerror: ${error.message}`));page.on('console',message=>{if(['error','warning'].includes(message.type()))messages.push(`${message.type()}: ${message.text()}`)});
  for(const route of routes){
    messages.length=0;const response=await page.goto(base+route,{waitUntil:'networkidle'});
    const metrics=await page.evaluate(()=>{
      const ids=[...document.querySelectorAll('[id]')].map(node=>node.id);const duplicateIds=[...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];
      const headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(node=>Number(node.tagName[1]));const headingJumps=headings.filter((level,index)=>index&&level>headings[index-1]+1);
      const smallTargets=innerWidth<=390?[...document.querySelectorAll('a,button,input,select,textarea')].filter(node=>{let target=node;const label=node.matches('input[type="checkbox"],input[type="radio"]')?node.closest('label'):null;if(label)target=label;const r=target.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<44||r.height<44)}).length:0;
      return{h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,lang:document.documentElement.lang,duplicateIds,headingJumps,skip:Boolean(document.querySelector('a.skip[href="#main"]')),smallTargets};
    });
    const result={engine,viewport:viewport.name,route:route||'/',status:response?.status(),...metrics,messages:[...messages]};results.push(result);
    if(result.status!==200||result.h1!==1||result.overflow>1||result.lang!=='en-KE'||result.duplicateIds.length||result.headingJumps.length||!result.skip||messages.length||result.smallTargets)failures.push(result);
    if(engine==='chromium'&&route===''&&['phone-390','tablet-768','desktop-1280'].includes(viewport.name))await page.screenshot({path:path.join(out,`home-${viewport.name}.png`),fullPage:true});
  }
  await page.close();
}
await browser.close();await writeFile(path.join(out,`browser-results-${engine}.json`),JSON.stringify({checkedAt:new Date().toISOString(),engine,results,failures},null,2));
console.log(`Checked ${routes.length} routes at ${viewports.length} viewports in ${engine}; ${failures.length} failure(s).`);if(failures.length){console.error(JSON.stringify(failures,null,2));process.exitCode=1}
