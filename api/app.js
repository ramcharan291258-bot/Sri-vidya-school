import crypto from 'node:crypto';
import { readAppData, writeAppData } from './_app-data.js';
const secret=process.env.CMS_SESSION_SECRET||'change-this-secret-in-vercel';
function token(role,id){const p=Buffer.from(JSON.stringify({role,id,exp:Date.now()+1000*60*60*12})).toString('base64url');const s=crypto.createHmac('sha256',secret).update(p).digest('base64url');return `${p}.${s}`}
function auth(req){try{const raw=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');const [p,s]=raw.split('.');if(!p||!s)return null;const e=crypto.createHmac('sha256',secret).update(p).digest('base64url');if(!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(e)))return null;const d=JSON.parse(Buffer.from(p,'base64url').toString('utf8'));return d.exp>Date.now()?d:null}catch{return null}}
export default async function handler(req,res){try{
 const data=await readAppData();
 if(req.method==='POST'){
  const {role,username,password,studentId,pin}=req.body||{};
  if(role==='admin'){const ok=username===(process.env.CMS_ADMIN_USER||'admin')&&password===(process.env.CMS_ADMIN_PASSWORD||'change-me');if(!ok)return res.status(401).json({error:'Invalid admin credentials'});return res.status(200).json({token:token('admin',username),role:'admin',profile:{name:'School Admin'}})}
  const parent=(data.accounts||[]).find(a=>a.studentId===studentId&&a.pin===pin);if(!parent)return res.status(401).json({error:'Invalid Student ID or Parent PIN'});return res.status(200).json({token:token('parent',parent.id),role:'parent',profile:{name:parent.name,studentId:parent.studentId,studentName:parent.studentName,className:parent.className,phone:parent.phone}})
 }
 const a=auth(req);if(!a)return res.status(401).json({error:'Unauthorized'});
 if(req.method==='GET'){
  const profile=a.role==='admin'?{name:'School Admin'}:(data.accounts||[]).find(x=>x.id===a.id)||null;if(a.role==='parent'&&!profile)return res.status(401).json({error:'Parent account not found'});
  if(a.role==='parent'){const own=key=>Array.isArray(data[key])?data[key].filter(x=>!x.studentId||x.studentId===profile.studentId):[];const scoped={...data,homework:own('homework'),attendance:own('attendance'),results:own('results'),fees:own('fees'),transport:own('transport'),leaves:own('leaves'),complaints:own('complaints')};return res.status(200).json({role:a.role,profile,data:scoped})}
  return res.status(200).json({role:a.role,profile,data})
 }
 if(req.method==='PUT'){
  const next=req.body||{};if(a.role==='admin')return res.status(200).json(await writeAppData(next));
  const profile=(data.accounts||[]).find(x=>x.id===a.id);if(!profile)return res.status(401).json({error:'Parent account not found'});const out={...data};for(const key of ['leaves','complaints']){const incoming=Array.isArray(next[key])?next[key]:[];const added=incoming.filter(x=>x&&x.studentId===profile.studentId);const existing=(data[key]||[]).filter(x=>x.studentId!==profile.studentId);out[key]=[...existing,...added]}return res.status(200).json(await writeAppData(out))
 }
 return res.status(405).json({error:'Method not allowed'})
}catch(e){console.error('App API error',e);return res.status(500).json({error:e.message||'App API error'})}}
