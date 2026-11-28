import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=process.env.REVIEW_BASE_URL||'http://127.0.0.1:4213/';
const cli='C:/Users/Joe/Documents/ChatGPT/website/.m1-tool-cache/_npx/2613f46d5c6aba5c/node_modules/lighthouse/cli/index.js';
const chrome='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const routes=['','404.html','privacy.html','terms.html','guides/','guides/stock-going-missing/','guides/profitable-but-no-cash/','guides/run-your-shop-remotely/','guides/stock-count-mismatch/','guides/ai-for-supermarkets/','services/websites.html','services/ai-assistants.html','services/automation.html','services/business-systems.html','services/marketing.html','work/','work/openduka.html','work/inventory.html','work/stockroom.html','work/shopfront.html','work/frontdesk.html','work/flowboard.html','work/campaign-kit.html'];
const out=path.join(root,'docs','m3-v2-evidence','lighthouse');await mkdir(out,{recursive:true});
const slug=route=>route?route.replace(/index\.html$|\.html$/,'').replaceAll('/','-').replace(/-$/,''):'home';
const scores=(route,report)=>({route:route||'/',url:base+route,performance:Math.round(report.categories.performance.score*100),accessibility:Math.round(report.categories.accessibility.score*100),bestPractices:Math.round(report.categories['best-practices'].score*100),seo:Math.round(report.categories.seo.score*100)});
async function audit(route){
  const target=path.join(out,`${slug(route)}.json`);try{return scores(route,JSON.parse(await readFile(target,'utf8')))}catch{}
  const args=[cli,base+route,'--quiet','--output=json',`--output-path=${target}`,`--chrome-path=${chrome}`,'--chrome-flags=--headless --no-sandbox --disable-gpu','--form-factor=mobile','--only-categories=performance,accessibility,best-practices,seo','--max-wait-for-load=15000'];
  await new Promise((resolve,reject)=>{let settled=false;const child=spawn(process.execPath,args,{stdio:'ignore'});const finish=error=>{if(settled)return;settled=true;clearInterval(timer);if(!child.killed)child.kill();error?reject(error):resolve()};const timer=setInterval(async()=>{try{const report=JSON.parse(await readFile(target,'utf8'));if(report.categories?.performance)finish()}catch{}},1000);child.on('error',finish);child.on('exit',async code=>{try{const report=JSON.parse(await readFile(target,'utf8'));if(report.categories?.performance)return finish()}catch{}finish(new Error(`${route||'/'}: Lighthouse exited ${code}`))});setTimeout(()=>finish(new Error(`${route||'/'}: Lighthouse timed out`)),180000)});
  return scores(route,JSON.parse(await readFile(target,'utf8')));
}
const results=[];let next=0;async function worker(){while(next<routes.length){const route=routes[next++];const result=await audit(route);results.push(result);console.log(`${result.route}: P${result.performance} A${result.accessibility} B${result.bestPractices} S${result.seo}`)}}const concurrency=Math.max(1,Math.min(4,Number(process.env.LIGHTHOUSE_WORKERS||4)));await Promise.all(Array.from({length:concurrency},()=>worker()));
results.sort((a,b)=>routes.indexOf(a.route==='/'?'':a.route)-routes.indexOf(b.route==='/'?'':b.route));await writeFile(path.join(out,'summary.json'),JSON.stringify({auditedAt:new Date().toISOString(),formFactor:'mobile',results},null,2));
const below=results.filter(item=>Object.entries(item).some(([key,value])=>['performance','accessibility','bestPractices','seo'].includes(key)&&value<90));console.log(`Audited ${results.length} pages; ${below.length} page(s) have a score below 90.`);if(below.length)console.log(JSON.stringify(below,null,2));
