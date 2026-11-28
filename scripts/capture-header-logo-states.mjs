import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire('C:/Users/Joe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const { chromium }=require('playwright');const base=process.env.REVIEW_BASE_URL||'http://127.0.0.1:4213/';
const out=path.join(root,'docs','m3-v2-evidence','header-animation');await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const frames=[];
async function capture(label,wait,action){const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();await page.goto(base,{waitUntil:'load'});await page.waitForTimeout(wait);if(action)await action(page);const state=await page.locator('.logo .amb').evaluate(node=>{const s=getComputedStyle(node);return{opacity:s.opacity,transform:s.transform,animationName:s.animationName,animationDelay:s.animationDelay,animationTimeline:s.animationTimeline}});await page.screenshot({path:path.join(out,`${label}.png`),clip:{x:0,y:0,width:420,height:120}});frames.push({label,atMs:wait,state});await context.close()}
for(const [label,wait] of [['01-0.3s-drop',300],['02-0.6s-drop',600],['03-1.0s-first-bounce',1000],['04-1.4s-second-bounce',1400],['05-2.0s-settled',2000]])await capture(label,wait);
await capture('06-hover-bounce',2000,async page=>{await page.locator('.logo').hover();await page.waitForTimeout(80)});
await capture('07-scroll-catch',2000,async page=>{await page.evaluate(()=>scrollTo(0,document.querySelector('.hero').offsetHeight*.72));await page.waitForTimeout(250)});
const reduced=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});const reducedPage=await reduced.newPage();await reducedPage.goto(base,{waitUntil:'load'});await reducedPage.waitForTimeout(350);const reducedState=await reducedPage.locator('.logo .amb').evaluate(node=>{const s=getComputedStyle(node);return{opacity:s.opacity,transform:s.transform,animationName:s.animationName}});await reducedPage.locator('.logo').screenshot({path:path.join(out,'08-reduced-motion-still.png')});frames.push({label:'08-reduced-motion-still',atMs:350,state:reducedState});await reduced.close();
await browser.close();await writeFile(path.join(out,'frame-states.json'),JSON.stringify({capturedAt:new Date().toISOString(),frames},null,2));console.log(`Captured ${frames.length} header animation states.`);
