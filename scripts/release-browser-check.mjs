import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(process.env.PLAYWRIGHT_MODULE_PATH||'C:/Users/Joe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const { chromium }=require('playwright');
const base=process.env.REVIEW_BASE_URL||'http://127.0.0.1:4173/';
const routes=['','privacy.html','services/websites.html','services/ai-assistants.html','services/automation.html','services/business-systems.html','services/marketing.html','work/','work/openduka.html','work/inventory.html','work/stockroom.html','work/shopfront.html','work/frontdesk.html','work/flowboard.html','work/campaign-kit.html'];
const viewports=[{name:'mobile',width:390,height:844},{name:'desktop',width:1440,height:1000}];
const evidence=path.join(root,'docs','release-evidence');
await mkdir(evidence,{recursive:true});

const browser=await chromium.launch({executablePath:process.env.REVIEW_BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const results=[];
let failures=[];
for(const viewport of viewports){
  const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1});
  const pageErrors=[]; const consoleErrors=[]; const requestFailures=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text())});
  page.on('requestfailed',request=>requestFailures.push(`${request.url()} ${request.failure()?.errorText||''}`));
  for(const route of routes){
    pageErrors.length=0; consoleErrors.length=0; requestFailures.length=0;
    const response=await page.goto(base+route,{waitUntil:'networkidle'});
    const metrics=await page.evaluate(()=>({h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,title:document.title,lang:document.documentElement.lang}));
    const entry={viewport:viewport.name,route:route||'/',status:response?.status(),...metrics,pageErrors:[...pageErrors],consoleErrors:[...consoleErrors],requestFailures:[...requestFailures]};
    results.push(entry);
    if(entry.status!==200||entry.h1!==1||entry.overflow>1||entry.lang!=='en-KE'||pageErrors.length||consoleErrors.length||requestFailures.length)failures.push(entry);
    if(route===''){
      const height=await page.evaluate(()=>document.documentElement.scrollHeight);
      for(let y=0;y<height;y+=Math.max(400,viewport.height-120)){await page.evaluate(value=>scrollTo(0,value),y);await page.waitForTimeout(40)}
      await page.evaluate(()=>scrollTo(0,0));
      await page.waitForTimeout(100);
      const visibleSections=await page.locator('main section').evaluateAll(sections=>sections.every(section=>{const style=getComputedStyle(section);return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity)>0&&section.getBoundingClientRect().height>0}));
      if(!visibleSections)failures.push({viewport:viewport.name,route:'/',issue:'a homepage section is not visibly rendered'});
      await page.screenshot({path:path.join(evidence,`home-${viewport.name}.png`),fullPage:true});
    }
  }
  if(viewport.name==='mobile'){
    await page.goto(base,{waitUntil:'networkidle'});
    const toggle=page.locator('.menu-toggle');
    await toggle.click();
    if(await toggle.getAttribute('aria-expanded')!=='true')failures.push({viewport:'mobile',route:'/',issue:'menu did not open'});
    await page.keyboard.press('Escape');
    if(await toggle.getAttribute('aria-expanded')!=='false')failures.push({viewport:'mobile',route:'/',issue:'menu did not close with Escape'});
  }
  await page.close();
}
const missing=await browser.newPage();
const missingResponse=await missing.goto(base+'not-a-real-page',{waitUntil:'networkidle'});
results.push({viewport:'desktop',route:'/not-a-real-page',status:missingResponse?.status()});
if(missingResponse?.status()!==404)failures.push({route:'/not-a-real-page',issue:`expected 404, received ${missingResponse?.status()}`});
await missing.close();
await browser.close();
await writeFile(path.join(evidence,'browser-results.json'),JSON.stringify({checkedAt:new Date().toISOString(),results,failures},null,2));
console.log(`Checked ${routes.length} routes at ${viewports.length} viewports; ${failures.length} failure(s).`);
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exitCode=1}
