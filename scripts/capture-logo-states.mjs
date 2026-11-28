import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire('C:/Users/Joe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const { chromium }=require('playwright');
const base=process.env.REVIEW_BASE_URL||'http://127.0.0.1:4211/';
const out=path.join(root,'docs','m2-v2-evidence','logo-animation-timing-fix');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900}});
const frames=[];

async function state(page,label,atMs){
  const values=await page.evaluate(()=>Object.fromEntries(['.n-draw','.nd1','.nd2','.nd3','.node','.pkt'].map(selector=>{const style=getComputedStyle(document.querySelector(selector));return [selector,{opacity:Number(style.opacity),transform:style.transform,strokeDashoffset:style.strokeDashoffset,animationName:style.animationName,animationDelay:style.animationDelay,animationFillMode:style.animationFillMode}]})));
  frames.push({label,atMs,values});
  return values;
}

const requested=[
  {label:'01-0.3s-draw',atMs:300},
  {label:'02-0.8s-node-pop',atMs:800},
  {label:'03-1.3s-ball-drop',atMs:1300},
  {label:'04-1.8s-ball-bounce',atMs:1800},
  {label:'05-2.8s-hop-with-dot',atMs:2800},
  {label:'06-3.4s-hop-with-dot',atMs:3400}
];

for(const frame of requested){
  const page=await context.newPage();
  await page.goto(base,{waitUntil:'load'});
  await page.waitForTimeout(frame.atMs);
  const values=await state(page,frame.label,frame.atMs);
  if(frame.atMs<2600&&values['.pkt'].opacity!==0)throw new Error(`Packet appeared early at ${frame.atMs}ms`);
  if(frame.atMs<600&&(values['.nd2'].opacity!==0||values['.nd3'].opacity!==0||values['.node'].opacity!==0))throw new Error(`A scheduled node appeared early at ${frame.atMs}ms`);
  if(frame.atMs<1000&&(values['.nd3'].opacity!==0||values['.node'].opacity!==0))throw new Error(`A later node appeared early at ${frame.atMs}ms`);
  if(frame.atMs<1200&&values['.node'].opacity!==0)throw new Error(`Amber ball appeared before its drop at ${frame.atMs}ms`);
  await page.locator('.hero-vis').screenshot({path:path.join(out,`${frame.label}.png`)});
  await page.close();
}

await context.close();await browser.close();
await writeFile(path.join(out,'frame-states.json'),JSON.stringify({capturedAt:new Date().toISOString(),frames},null,2));
console.log(`Captured and timing-checked ${frames.length} requested frames.`);
