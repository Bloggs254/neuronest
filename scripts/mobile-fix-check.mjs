import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire('C:/Users/Joe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const { chromium }=require('playwright');
const base=process.env.REVIEW_BASE_URL||'http://127.0.0.1:4214/';
const out=path.join(root,'docs','mobile-fix-evidence');await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const results=[];const failures=[];
const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;

for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:844}});const messages=[];page.on('pageerror',error=>messages.push(error.message));page.on('console',message=>{if(['error','warning'].includes(message.type()))messages.push(message.text())});
  await page.goto(base,{waitUntil:'networkidle'});await page.waitForTimeout(2100);
  const closed=await page.evaluate(()=>{const header=document.querySelector('.site-header').getBoundingClientRect(),hero=document.querySelector('.hero').getBoundingClientRect(),nav=getComputedStyle(document.querySelector('#nav'));return{navDisplay:nav.display,headerBottom:header.bottom,heroTop:hero.top,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,h1LineHeight:getComputedStyle(document.querySelector('h1')).lineHeight}});
  if(closed.navDisplay!=='none'||closed.heroTop<closed.headerBottom-1||closed.overflow>1||messages.length)failures.push({width,mode:'closed',closed,messages});
  await page.locator('.menu-toggle').click();await page.waitForTimeout(50);
  const open=await page.evaluate(()=>{const header=document.querySelector('.site-header').getBoundingClientRect(),hero=document.querySelector('.hero').getBoundingClientRect(),nav=getComputedStyle(document.querySelector('#nav'));return{navDisplay:nav.display,headerBottom:header.bottom,heroTop:hero.top,expanded:document.querySelector('.menu-toggle').getAttribute('aria-expanded'),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}});
  if(open.navDisplay==='none'||open.expanded!=='true'||open.heroTop<open.headerBottom-1||open.overflow>1)failures.push({width,mode:'open',open});
  results.push({width,closed,open,messages});
  if(width===390){await page.screenshot({path:path.join(out,'mobile-menu-open-390.png'),fullPage:false});await page.locator('.menu-toggle').click();await page.waitForTimeout(50);await page.screenshot({path:path.join(out,'mobile-settled-390.png'),fullPage:true})}
  await page.close();
}

for(const atMs of [1250,1400,1600,1850,2200]){
  const page=await browser.newPage({viewport:{width:390,height:844}});await page.goto(base,{waitUntil:'load'});await page.waitForTimeout(atMs);
  const geometry=await page.evaluate(()=>{const node=document.querySelector('.hero-vis .node').getBoundingClientRect(),copy=document.querySelector('.hero-copy p').getBoundingClientRect();return{node:{left:node.left,right:node.right,top:node.top,bottom:node.bottom},copy:{left:copy.left,right:copy.right,top:copy.top,bottom:copy.bottom}}});
  const overlap=intersects(geometry.node,geometry.copy);results.push({atMs,overlap,...geometry});if(overlap)failures.push({atMs,issue:'amber node overlaps hero paragraph',geometry});
  if(atMs===1400)await page.screenshot({path:path.join(out,'mobile-ball-path-390.png'),fullPage:false});await page.close();
}

const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const noJsPage=await noJs.newPage();await noJsPage.goto(base,{waitUntil:'load'});const noJsState=await noJsPage.evaluate(()=>{const header=document.querySelector('.site-header').getBoundingClientRect(),hero=document.querySelector('.hero').getBoundingClientRect();return{navDisplay:getComputedStyle(document.querySelector('#nav')).display,menuDisplay:getComputedStyle(document.querySelector('.menu-toggle')).display,headerBottom:header.bottom,heroTop:hero.top,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}});results.push({mode:'javascript-off',...noJsState});if(noJsState.navDisplay==='none'||noJsState.menuDisplay!=='none'||noJsState.heroTop<noJsState.headerBottom-1||noJsState.overflow>1)failures.push({mode:'javascript-off',...noJsState});await noJs.close();

const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});const reducedPage=await reduced.newPage();await reducedPage.goto(base,{waitUntil:'load'});const reducedState=await reducedPage.locator('.hero-vis .node').evaluate(node=>({animation:getComputedStyle(node).animationName,opacity:getComputedStyle(node).opacity}));results.push({mode:'reduced-motion',...reducedState});if(reducedState.animation!=='none'||reducedState.opacity!=='1')failures.push({mode:'reduced-motion',...reducedState});await reduced.close();

await browser.close();await writeFile(path.join(out,'results.json'),JSON.stringify({checkedAt:new Date().toISOString(),results,failures},null,2));console.log(`Mobile fix check completed with ${failures.length} failure(s).`);if(failures.length){console.error(JSON.stringify(failures,null,2));process.exitCode=1}
