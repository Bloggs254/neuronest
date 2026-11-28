import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
const services=new Set(['websites','ai-assistants','automation','business-systems','marketing','not-sure']);
const budgets=new Set(['','under-50000','50000-150000','150000-500000','500000-plus','not-sure']);
const timelines=new Set(['','soon','one-three-months','later','not-sure']);
const clean=(value,max)=>String(value??'').trim().replaceAll('\0','').slice(0,max+1);
export function validateInquiry(input){
 if(clean(input.website,200))return {ok:false,code:'spam',message:'The inquiry could not be accepted.'};
 const data={name:clean(input.name,80),business:clean(input.business,120),reply:clean(input.reply,160),service:clean(input.service,40),message:clean(input.message,2000),budget:clean(input.budget,40),timeline:clean(input.timeline,40),consent:input.consent==='yes'||input.consent==='on',idempotencyKey:clean(input.idempotencyKey,100)};
 if(data.name.length<2||data.name.length>80)return {ok:false,code:'name',message:'Enter a name between 2 and 80 characters.'};
 if(data.business.length>120)return {ok:false,code:'business',message:'Business name is too long.'};
 if(data.reply.length<5||data.reply.length>160)return {ok:false,code:'reply',message:'Enter a usable reply email or phone number.'};
 if(!services.has(data.service))return {ok:false,code:'service',message:'Choose a listed service.'};
 if(data.message.length<20||data.message.length>2000)return {ok:false,code:'message',message:'Describe the problem in 20 to 2,000 characters.'};
 if(!budgets.has(data.budget)||!timelines.has(data.timeline))return {ok:false,code:'choice',message:'Choose a listed optional value.'};
 if(!data.consent)return {ok:false,code:'consent',message:'Confirm that NeuroNest may use these details to reply about this inquiry.'};
 if(!/^[A-Za-z0-9_-]{16,100}$/.test(data.idempotencyKey))return {ok:false,code:'idempotency',message:'Refresh the form and try again.'};
 if(/(?:password|one[- ]?time code|credit card|private key)/i.test(data.message))return {ok:false,code:'sensitive',message:'Remove passwords, payment details or other sensitive information.'};
 return {ok:true,data};
}
export function openInquiryStore(filename){
 const db=new DatabaseSync(filename); db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, idempotency_key TEXT UNIQUE NOT NULL, name TEXT NOT NULL, business TEXT NOT NULL, reply TEXT NOT NULL, service TEXT NOT NULL, message TEXT NOT NULL, budget TEXT NOT NULL, timeline TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN (\'accepted\',\'queued\',\'delivered\',\'failed\')), created_at TEXT NOT NULL, updated_at TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, failure_code TEXT); CREATE TABLE IF NOT EXISTS events (event_id TEXT PRIMARY KEY, inquiry_id TEXT NOT NULL REFERENCES inquiries(id), state TEXT NOT NULL, happened_at TEXT NOT NULL);');
 const insert=db.prepare('INSERT INTO inquiries (id,idempotency_key,name,business,reply,service,message,budget,timeline,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
 const event=db.prepare('INSERT INTO events (event_id,inquiry_id,state,happened_at) VALUES (?,?,?,?)');
 const byKey=db.prepare('SELECT id,status,attempts,failure_code FROM inquiries WHERE idempotency_key=?');
 const byId=db.prepare('SELECT id,status,attempts,failure_code FROM inquiries WHERE id=?');
 const update=db.prepare('UPDATE inquiries SET status=?,updated_at=?,attempts=attempts+1,failure_code=? WHERE id=?');
 const setState=(id,state,failure=null)=>{const now=new Date().toISOString();update.run(state,now,failure,id);event.run(randomUUID(),id,state,now)};
 return {db,accept(data,delivery='deliver'){
   const duplicate=byKey.get(data.idempotencyKey);if(duplicate)return {...duplicate,duplicate:true};
   const id='NN-'+randomUUID();const now=new Date().toISOString();
   db.exec('BEGIN IMMEDIATE');try{insert.run(id,data.idempotencyKey,data.name,data.business,data.reply,data.service,data.message,data.budget,data.timeline,'accepted',now,now);event.run(randomUUID(),id,'accepted',now);setState(id,'queued');setState(id,delivery==='fail'?'failed':'delivered',delivery==='fail'?'FAKE_DELIVERY_FAILED':null);db.exec('COMMIT')}catch(error){db.exec('ROLLBACK');throw error}
   return byId.get(id);
 },retry(id,delivery='deliver'){const record=byId.get(id);if(!record||record.status!=='failed')return null;setState(id,'queued');setState(id,delivery==='fail'?'failed':'delivered',delivery==='fail'?'FAKE_DELIVERY_FAILED':null);return byId.get(id)},get(id){return byId.get(id)},close(){db.close()}};
}
