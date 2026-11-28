import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire('C:/Users/Joe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const { chromium }=require('playwright');
const base=process.env.REVIEW_BASE_URL||'http://127.0.0.1:4211/';
const out=path.join(root,'docs','m2-v2-evidence','logo-animation');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900}});
const frames=[];

async function inspect(page,name){
  const state=await page.evaluate(()=>{
    const read=selector=>{const element=document.querySelector(selector);const style=getComputedStyle(element);return {selector,animationName:style.animationName,opacity:style.opacity,transform:style.transform,strokeDashoffset:style.strokeDashoffset,display:style.display}};
    return {pageTitle:document.title,supportsScrollTimeline:CSS.supports('animation-timeline:view()'),scrollY,items:['.n-draw','.nd1','.nd2','.nd3','.node','.pkt','.hero-vis','.logo .amb'].map(read)};
  });
  frames.push({name,...state});
}

for(const frame of [
  {name:'01-draw-in',wait:500},
  {name:'02-node-pop',wait:950},
  {name:'03-ball-drop',wait:1650},
  {name:'04-ball-bounce',wait:2250},
  {name:'05-hop-with-dot',wait:3100}
]){
  const page=await context.newPage();
  await page.goto(base,{waitUntil:'load'});
  await page.waitForTimeout(frame.wait);
  await page.locator('.hero-vis').screenshot({path:path.join(out,`${frame.name}.png`)});
  await inspect(page,frame.name);
  await page.close();
}

{
  const page=await context.newPage();
  await page.goto(base,{waitUntil:'load'});await page.waitForTimeout(3100);
  await page.locator('.hero-n').hover();await page.waitForTimeout(250);
  await page.locator('.hero-vis').screenshot({path:path.join(out,'06-hover.png')});
  await inspect(page,'06-hover');await page.close();
}

{
  const page=await context.newPage();
  await page.goto(base,{waitUntil:'load'});await page.waitForTimeout(3100);
  await page.evaluate(()=>scrollTo(0,Math.round(document.querySelector('.hero').getBoundingClientRect().height*.7)));
  await page.waitForTimeout(300);
  await page.screenshot({path:path.join(out,'07-scroll-handover.png')});
  await inspect(page,'07-scroll-handover');await page.close();
}

const reduced=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
{
  const page=await reduced.newPage();
  await page.goto(base,{waitUntil:'load'});await page.waitForTimeout(500);
  await page.locator('.hero-vis').screenshot({path:path.join(out,'08-reduced-motion.png')});
  await inspect(page,'08-reduced-motion');await page.close();
}
await reduced.close();await context.close();await browser.close();
await writeFile(path.join(out,'frame-states.json'),JSON.stringify({capturedAt:new Date().toISOString(),frames},null,2));
console.log(`Captured ${frames.length} logo animation states.`);
