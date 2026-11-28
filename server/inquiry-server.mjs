import http from 'node:http';
import { readFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRateLimiter, openInquiryStore, validateInquiry } from './inquiry-core.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const defaultConfig=JSON.parse(readFileSync(path.join(root,'config','inquiry.json'),'utf8'));
const json=(res,status,body,extra={})=>res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}).end(JSON.stringify(body));

async function readBody(req){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>12_000)throw Object.assign(new Error('Request too large.'),{status:413});chunks.push(chunk)}const raw=Buffer.concat(chunks).toString('utf8');return req.headers['content-type']?.includes('application/json')?JSON.parse(raw):Object.fromEntries(new URLSearchParams(raw))}

export function sendmailNotification(record,{destination,sendmailPath=process.env.NEURONEST_SENDMAIL_PATH||'/usr/sbin/sendmail'}={}){
  if(!destination||destination.includes('[TODO'))return Promise.reject(new Error('Notification address is not configured.'));
  const subject=`NeuroNest inquiry ${record.id}`;
  const body=`A new inquiry has been stored.\n\nReference: ${record.id}\nService: ${record.service}\nReceived: ${record.createdAt}\n\nOpen the protected inquiry store to review it.`;
  const message=`To: ${destination}\nFrom: ${process.env.NEURONEST_INQUIRY_FROM||destination}\nSubject: ${subject}\nContent-Type: text/plain; charset=UTF-8\n\n${body}\n`;
  return new Promise((resolve,reject)=>{const child=spawn(sendmailPath,['-t'],{stdio:['pipe','ignore','ignore']});child.once('error',reject);child.once('close',code=>code===0?resolve():reject(new Error(`Notification command failed (${code}).`)));child.stdin.end(message)});
}

export function createInquiryServer({config=defaultConfig,store,notify,rateLimit=createRateLimiter(),now=()=>Date.now()}={}){
  const destination=process.env.NEURONEST_INQUIRY_NOTIFY_TO||config.notificationAddress;
  return http.createServer(async(req,res)=>{try{
    const url=new URL(req.url,'http://127.0.0.1');
    if(req.method!=='POST'||url.pathname!=='/api/inquiry')return json(res,404,{ok:false,message:'Not found.'});
    if(!config.enabled)return json(res,503,{ok:false,code:'not_open',message:'Enquiries are not open yet.'},{'Retry-After':'3600'});
    const ip=req.socket.remoteAddress||'unknown';
    if(!rateLimit(ip))return json(res,429,{ok:false,code:'rate_limit',message:'Too many enquiries. Please wait and try again.'},{'Retry-After':'60'});
    const checked=validateInquiry(await readBody(req),{now:now()});
    if(!checked.ok)return json(res,checked.status,{ok:false,code:checked.code,message:checked.message});
    const record=store.save(checked.data);
    try{await (notify?notify({...record,...checked.data}):sendmailNotification({...record,...checked.data},{destination}));store.mark(record.id,'notified');return json(res,201,{ok:true,id:record.id,message:'Thank you. Your inquiry has been received.'})}
    catch(error){store.mark(record.id,'notification_failed','NOTIFICATION_FAILED');console.warn(JSON.stringify({event:'inquiry_notification_failed',id:record.id}));return json(res,503,{ok:false,id:record.id,code:'delivery_failed',message:'Your inquiry was saved, but notification failed. Please try again later.'})}
  }catch(error){const status=error.status||400;console.warn(JSON.stringify({event:'inquiry_rejected',status}));return json(res,status,{ok:false,message:status===413?'Request too large.':'The inquiry could not be processed.'})}});
}

if(import.meta.url===`file:///${process.argv[1]?.replaceAll('\\','/')}`){
  const dataDir=path.resolve(root,process.env.NEURONEST_INQUIRY_DATA||'.inquiry-data');mkdirSync(dataDir,{recursive:true});
  const store=openInquiryStore(path.join(dataDir,'inquiries.sqlite'));
  const port=Number(process.env.PORT||4200);
  createInquiryServer({store}).listen(port,'127.0.0.1',()=>console.log(`NeuroNest inquiry server listening on http://127.0.0.1:${port}`));
}
