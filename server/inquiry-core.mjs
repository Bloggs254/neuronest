import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';

const services=new Set(['website','ai-assistant','business-system','not-sure']);
const clean=(value,max)=>String(value??'').trim().replaceAll('\0','').slice(0,max+1);
const hasHtml=value=>/[<>]/.test(value);

export function validateInquiry(input,{now=Date.now(),minimumMs=3000}={}){
  const honeypot=clean(input.website,200);
  if(honeypot)return {ok:false,status:422,code:'spam',message:'The inquiry could not be accepted.'};
  const startedAt=Number(input.startedAt);
  if(!Number.isFinite(startedAt)||now-startedAt<minimumMs||now-startedAt>86_400_000)return {ok:false,status:422,code:'timing',message:'Please reload the form and try again.'};
  const data={
    name:clean(input.name,80),
    phone:clean(input.phone,40),
    email:clean(input.email,160),
    service:clean(input.service,40),
    message:clean(input.message,1000),
    consent:input.consent===true||input.consent==='yes'||input.consent==='on'
  };
  if(Object.values(data).some(value=>typeof value==='string'&&hasHtml(value)))return {ok:false,status:422,code:'html',message:'Please remove HTML or angle brackets.'};
  if(data.name.length<2||data.name.length>80)return {ok:false,status:422,code:'name',message:'Enter your name using 2 to 80 characters.'};
  if(!/^\+?[0-9][0-9 ()-]{6,38}$/.test(data.phone))return {ok:false,status:422,code:'phone',message:'Enter a valid phone or WhatsApp number.'};
  if(data.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))return {ok:false,status:422,code:'email',message:'Enter a valid email address or leave it blank.'};
  if(!services.has(data.service))return {ok:false,status:422,code:'service',message:'Choose one of the listed services.'};
  if(data.message.length<10||data.message.length>1000)return {ok:false,status:422,code:'message',message:'Use 10 to 1,000 characters for your message.'};
  if(!data.consent)return {ok:false,status:422,code:'consent',message:'Confirm that NeuroNest may use these details to reply.'};
  return {ok:true,data};
}

export function createRateLimiter({limit=5,windowMs=60_000,now=()=>Date.now()}={}){
  const attempts=new Map();
  return ip=>{const current=now();const recent=(attempts.get(ip)||[]).filter(time=>current-time<windowMs);if(recent.length>=limit)return false;recent.push(current);attempts.set(ip,recent);return true};
}

export function openInquiryStore(filename){
  const db=new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL,
    service TEXT NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL,
    created_at TEXT NOT NULL, notification_error TEXT
  )`);
  const insert=db.prepare('INSERT INTO inquiries (id,name,phone,email,service,message,status,created_at,notification_error) VALUES (?,?,?,?,?,?,?,?,?)');
  const update=db.prepare('UPDATE inquiries SET status=?,notification_error=? WHERE id=?');
  const get=db.prepare('SELECT id,status,created_at FROM inquiries WHERE id=?');
  return {
    save(data){const id=`NN-${randomUUID()}`;const createdAt=new Date().toISOString();insert.run(id,data.name,data.phone,data.email,data.service,data.message,'stored',createdAt,null);return {id,status:'stored',createdAt}},
    mark(id,status,error=null){update.run(status,error,id);return get.get(id)},
    get(id){return get.get(id)},
    close(){db.close()}
  };
}
