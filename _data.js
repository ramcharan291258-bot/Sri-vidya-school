import { list, put } from '@vercel/blob';

export const seed = {
  heroTitle:'Sri Vidya E.M. School', heroSub:'Established 2002 • English Medium • LKG to 7th Class',
  about:'Sri Vidya E.M. School was established in 2002 at Kesavaram, Ganapavaram Mandal, West Godavari District, Andhra Pradesh. The school provides English Medium education from LKG to 7th Class and follows the State Syllabus. Along with academic education, the school encourages students to participate in sports, cultural programmes, science exhibitions, educational tours, yoga, music, dance, drawing, clubs and various celebrations.',
  heroImage:'/images/hero-campus.png', campusImage:'/images/campus-original.jpeg',
  principalName:'Velavalapalli Babji', principalRole:'Principal / Correspondent / Chairman',
  principalMessage:'Principal of Sri Vidya E.M. School. The website presents the school leadership with the official supplied photograph and school branding.', principalImage:'/images/event-portrait.jpeg',
  transportTitle:'School Bus & Van Service', transportDesc:'School Bus and Van Services are available for students. Contact the school for current route and transport details.', busDetails:'School Bus Service available.', vanDetails:'School Van Service available.',
  phone:'9491171564', email:'babjivelavalapalli@gmail.com', address:'Sri Vidya E.M. School, Kesavaram, Ganapavaram Mandal, West Godavari District, Andhra Pradesh - 534186', mapsUrl:'https://www.google.com/maps/search/?api=1&query=Sri+Vidya+E.M.+School+Kesavaram+Andhra+Pradesh',
  seoTitle:'Sri Vidya E.M. School | English Medium School in Kesavaram', seoDesc:'Sri Vidya E.M. School, established in 2002 at Kesavaram, offers English Medium education from LKG to 7th Class.', seoKeywords:'Sri Vidya E.M. School, Kesavaram school, English Medium School, West Godavari school, LKG to 7th Class',
  academics:[], facilities:[], activities:[],
  gallery:[
    {src:'/images/campus-original.jpeg',title:'School Campus',cat:'Campus'},
    {src:'/images/event-portrait.jpeg',title:'Principal',cat:'Principal'},
    {src:'/images/event-group-1.jpeg',title:'School Event',cat:'Events'},
    {src:'/images/event-group-2.jpeg',title:'Student Activity',cat:'Activities'},
    {src:'/images/event-portrait.jpeg',title:'Principal — Official Photo',cat:'Principal'},
    {src:'/images/event-celebration.png',title:'Celebration',cat:'Celebrations'},
    {src:'/images/staff-group.png',title:'School Team',cat:'Activities'}
  ], news:[]
};

const imageUrl = (value, fallback) => {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  const v = value.trim();
  if (/^(https?:|data:|blob:)/i.test(v)) return v;
  if (v.startsWith('/images/')) return v;
  if (v.startsWith('images/')) return `/${v}`;
  if (v.startsWith('/')) return `/images${v}`;
  return `/images/${v}`;
};

function normalizeAcademic(item,index){const fallback=seed.academics[index]||[];if(Array.isArray(item)){if(item.length<5)return fallback.length?[...fallback]:null;const out=item.slice(0,5);out[4]=imageUrl(out[4],fallback[4]);return out}if(!item||typeof item!=='object')return fallback.length?[...fallback]:null;return[item.title||item.name||fallback[0]||'Academic Item',item.subtitle||item.sub||fallback[1]||'',item.description||item.desc||fallback[2]||'',item.tag||item.category||fallback[3]||'',imageUrl(item.image||item.img||item.src,fallback[4]||'/images/items/placeholder.svg')]}
function normalizeVisual(item,index,section){const fallbackList=seed[section]||[];const fallback=fallbackList[index]||[];if(Array.isArray(item)){if(item.length<3)return fallback.length?[...fallback]:null;const out=item.slice(0,4);out[2]=imageUrl(out[2],fallback[2]);return out}if(!item||typeof item!=='object')return fallback.length?[...fallback]:null;return[item.title||item.name||fallback[0]||'School Facility',item.description||item.desc||fallback[1]||'',imageUrl(item.image||item.img||item.src,fallback[2]||'/images/items/placeholder.svg')]}
function normalizeGallery(items){
  if(!Array.isArray(items)||items.length===0)return seed.gallery.map(x=>({...x}));
  const result=items.filter(Boolean).map((item,i)=>{
    const fallback=seed.gallery[i%seed.gallery.length];
    if(typeof item==='string')return{src:imageUrl(item,fallback.src),title:`School Photo ${i+1}`,cat:'School'};
    const isPrincipal=String(item.cat||item.category||'').toLowerCase()==='principal'||String(item.title||item.name||'').toLowerCase().includes('principal');
    if(isPrincipal)return{src:'/images/event-portrait.jpeg',title:item.title||'Principal',cat:'Principal'};
    return{src:imageUrl(item.src||item.image||item.img||item.url,fallback.src),title:item.title||item.name||fallback.title||`School Photo ${i+1}`,cat:item.cat||item.category||fallback.cat||'School'};
  }).filter(item=>typeof item.src==='string'&&item.src.trim());
  return result.length?result:seed.gallery.map(x=>({...x}));
}
function normalizeRemote(remote){const r=remote&&typeof remote==='object'?remote:{};return{...seed,...r,heroImage:imageUrl(r.heroImage,seed.heroImage),campusImage:imageUrl(r.campusImage,seed.campusImage),principalImage:'/images/event-portrait.jpeg',academics:Array.isArray(r.academics)&&r.academics.length?r.academics.map((x,i)=>normalizeAcademic(x,i)).filter(Boolean):seed.academics.map(x=>[...x]),facilities:Array.isArray(r.facilities)&&r.facilities.length?r.facilities.map((x,i)=>normalizeVisual(x,i,'facilities')).filter(Boolean):seed.facilities.map(x=>[...x]),activities:Array.isArray(r.activities)&&r.activities.length?r.activities.map((x,i)=>normalizeVisual(x,i,'activities')).filter(Boolean):seed.activities.map(x=>[...x]),gallery:normalizeGallery(r.gallery),news:Array.isArray(r.news)?r.news.filter(n=>n&&typeof n==='object').map(n=>({title:n.title||'School News',date:n.date||'',description:n.description||n.desc||''})):[]}}
async function findBlob(){const result=await list({prefix:'cms/site.json',limit:20});return result.blobs?.find(b=>b.pathname==='cms/site.json')||null}
export async function readData(){if(!process.env.BLOB_READ_WRITE_TOKEN)return seed;const blob=await findBlob();if(!blob)return seed;const res=await fetch(blob.url,{cache:'no-store'});if(!res.ok)throw new Error(`CMS data fetch failed: ${res.status}`);return normalizeRemote(await res.json())}
export async function writeData(data){if(!process.env.BLOB_READ_WRITE_TOKEN)throw new Error('BLOB_READ_WRITE_TOKEN is not configured');const safe=normalizeRemote(data);await put('cms/site.json',JSON.stringify(safe),{access:'public',contentType:'application/json',addRandomSuffix:false});return safe}
