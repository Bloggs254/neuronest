import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

export function evaluateReadiness(config){
  const pending=Object.entries(config.gates).filter(([,ready])=>ready!==true).map(([name])=>name);
  const active=Object.entries(config.features).filter(([,enabled])=>enabled===true).map(([name])=>name);
  return{
    status:config.liveActivationAuthorized===true&&pending.length===0?'ready':'blocked',
    localFoundationAuthorized:config.localFoundationAuthorized===true,
    liveActivationAuthorized:config.liveActivationAuthorized===true,
    pending,
    active
  };
}

export async function loadReadiness(){return JSON.parse(await readFile(path.join(root,'config','m4-readiness.json'),'utf8'))}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const result=evaluateReadiness(await loadReadiness());
  console.log(JSON.stringify(result,null,2));
  if(process.argv.includes('--require-ready')&&result.status!=='ready')process.exitCode=1;
}
