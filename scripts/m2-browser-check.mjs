import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(process.env.PLAYWRIGHT_MODULE_PATH||'C:/Users/Joe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const { chromium, firefox }=require('playwright');
const base=process.env.REVIEW_BASE_URL||'http://127.0.0.1:4210/';
const routes=['','privacy.html','terms.html','services/websites.html','services/ai-assistants.html','services/automation.html','services/business-systems.html','services/marketing.html','work/','work/openduka.html','work/inventory.html','work/stockroom.html','work/shopfront.html','work/frontdesk.html','work/flowboard.html','work/campaign-kit.html'];
const viewports=[{name:'phone-390',width:390,height:844},{name:'tablet-768',width:768,height:1024},{name:'desktop-1280',width:1280,height:900}];
const evidence=path.join(root,'docs','m2-v2-evidence');await mkdir(evidence,{recursive:true});
const engine=process.env.REVIEW_ENGINE==='firefox'?'firefox':'chromium';
const browserType=engine==='firefox'?firefox:chromium;
const executablePath=process.env.REVIEW_BROWSER_PATH||(engine==='firefox'?'C:/Program Files/Mozilla Firefox/firefox.exe':'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe');
const browser=await browserType.launch({executablePath,headless:true});
const results=[];const failures=[];
for(const viewport of viewports){const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height}});const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});for(const route of routes){errors.length=0;const response=await page.goto(base+route,{waitUntil:'networkidle'});const metrics=await page.evaluate(()=>({h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,lang:document.documentElement.lang}));const result={engine,viewport:viewport.name,route:route||'/',status:response?.status(),...metrics,errors:[...errors]};results.push(result);if(result.status!==200||result.h1!==1||result.overflow>1||result.lang!=='en-KE'||errors.length)failures.push(result);if(route===''){const inquiry=await page.locator('.inquiry-form fieldset').evaluate(element=>element.hasAttribute('disabled'));const state=await page.locator('#inquiry-state').textContent();if(!inquiry||!/not open yet/i.test(state||''))failures.push({engine,viewport:viewport.name,route:'/',issue:'Pages inquiry form is not safely disabled'});const height=await page.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<height;y+=Math.max(400,viewport.height-120)){await page.evaluate(value=>scrollTo(0,value),y);await page.waitForTimeout(35)}await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);if(engine==='chromium')await page.screenshot({path:path.join(evidence,`home-${viewport.name}.png`),fullPage:true})}}await page.close()}
if(engine==='chromium'){
  const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const noJsPage=await noJs.newPage();
  const noJsResponse=await noJsPage.goto(base,{waitUntil:'load'});
  const noJsResult=await noJsPage.evaluate(()=>({h1:document.querySelectorAll('h1').length,formDisabled:document.querySelector('.inquiry-form fieldset')?.hasAttribute('disabled')===true,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}));
  results.push({engine,mode:'javascript-off',viewport:'phone-390',route:'/',status:noJsResponse?.status(),...noJsResult});
  if(noJsResponse?.status()!==200||noJsResult.h1!==1||!noJsResult.formDisabled||noJsResult.overflow>1)failures.push({engine,mode:'javascript-off',...noJsResult});
  await noJs.close();

  const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
  const reducedPage=await reduced.newPage();
  const reducedResponse=await reducedPage.goto(base,{waitUntil:'networkidle'});
  const reducedResult=await reducedPage.evaluate(()=>({h1:document.querySelectorAll('h1').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches}));
  results.push({engine,mode:'reduced-motion',viewport:'phone-390',route:'/',status:reducedResponse?.status(),...reducedResult});
  if(reducedResponse?.status()!==200||reducedResult.h1!==1||!reducedResult.reduced||reducedResult.overflow>1)failures.push({engine,mode:'reduced-motion',...reducedResult});
  await reduced.close();

  const animationsOff=await browser.newContext({viewport:{width:390,height:844}});
  const animationsOffPage=await animationsOff.newPage();
  await animationsOffPage.route('**/assets/css/site.css',async route=>{const response=await route.fetch();const body=await response.text();await route.fulfill({response,body:`${body}\n*,*::before,*::after{animation:none!important}`})});
  const animationsOffResponse=await animationsOffPage.goto(base,{waitUntil:'networkidle'});
  const animationsOffResult=await animationsOffPage.evaluate(()=>({h1:document.querySelectorAll('h1').length,heroOpacity:getComputedStyle(document.querySelector('.hero-vis')).opacity,nodeOpacity:getComputedStyle(document.querySelector('.node')).opacity,pktOpacity:getComputedStyle(document.querySelector('.pkt')).opacity,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}));
  results.push({engine,mode:'css-animation-off',viewport:'phone-390',route:'/',status:animationsOffResponse?.status(),...animationsOffResult});
  if(animationsOffResponse?.status()!==200||animationsOffResult.h1!==1||animationsOffResult.heroOpacity!=='1'||animationsOffResult.nodeOpacity!=='1'||animationsOffResult.pktOpacity!=='0'||animationsOffResult.overflow>1)failures.push({engine,mode:'css-animation-off',...animationsOffResult});
  await animationsOff.close();
}
await browser.close();await writeFile(path.join(evidence,`browser-results-${engine}.json`),JSON.stringify({checkedAt:new Date().toISOString(),engine,results,failures},null,2));console.log(`Checked ${routes.length} routes at ${viewports.length} viewports in ${engine}; ${failures.length} failure(s).`);if(failures.length){console.error(JSON.stringify(failures,null,2));process.exitCode=1}
