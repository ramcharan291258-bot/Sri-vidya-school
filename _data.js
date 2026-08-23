import { list, put } from '@vercel/blob';

export const seed = {
  heroTitle:'Sri Vidya E.M. School',
  heroSub:'Established 2002 • English Medium • LKG to 7th Class',
  about:'Sri Vidya E.M. School was established in 2002 at Kesavaram, Ganapavaram Mandal, West Godavari District, Andhra Pradesh. The school provides English Medium education from LKG to 7th Class and follows the State Syllabus. Along with academic education, the school encourages students to participate in sports, cultural programmes, science exhibitions, educational tours, yoga, music, dance, drawing, clubs and various celebrations.',
  heroImage:'/hero-campus.png',
  campusImage:'/campus-original.jpeg',
  principalName:'Velavalapalli Babji',
  principalRole:'Principal / Correspondent / Chairman',
  principalMessage:'Principal of Sri Vidya E.M. School. The website presents the school leadership with the official supplied photograph and school branding.',
  principalImage:'/principal-designed.png',
  transportTitle:'School Bus & Van Service',
  transportDesc:'School Bus and Van Services are available for students. Contact the school for current route and transport details.',
  busDetails:'School Bus Service available.',
  vanDetails:'School Van Service available.',
  phone:'9491171564',
  email:'babjivelavalapalli@gmail.com',
  address:'Sri Vidya E.M. School, Kesavaram, Ganapavaram Mandal, West Godavari District, Andhra Pradesh - 534186',
  mapsUrl:'https://www.google.com/maps/search/?api=1&query=Sri+Vidya+E.M.+School+Kesavaram+Andhra+Pradesh',
  seoTitle:'Sri Vidya E.M. School | English Medium School in Kesavaram',
  seoDesc:'Sri Vidya E.M. School, established in 2002 at Kesavaram, offers English Medium education from LKG to 7th Class.',
  seoKeywords:'Sri Vidya E.M. School, Kesavaram school, English Medium School, West Godavari school, LKG to 7th Class',
  academics:[], facilities:[], activities:[],
  gallery:[
    {src:'/campus-original.jpeg',title:'School Campus',cat:'Campus'},
    {src:'/principal-designed.png',title:'Principal',cat:'Principal'},
    {src:'/event-group-1.jpeg',title:'School Event',cat:'Events'},
    {src:'/event-group-2.jpeg',title:'Student Activity',cat:'Activities'},
    {src:'/event-portrait.jpeg',title:'School Programme',cat:'Events'},
    {src:'/event-celebration.png',title:'Celebration',cat:'Celebrations'},
    {src:'/staff-group.png',title:'School Team',cat:'Activities'}
  ],
  news:[]
};

const imageUrl = (value, fallback) => {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  const v = value.trim();
  if (v.startsWith('/images/')) return v.replace(/^\/images\//, '/');
  return v;
};

function normalizeAcademic(item) {
  if (Array.isArray(item)) return item.length >= 5 ? item.slice(0, 5) : null;
  if (!item || typeof item !== 'object') return null;
  return [item.title || item.name || 'Academic Item', item.subtitle || item.sub || '', item.description || item.desc || '', item.tag || item.category || '', imageUrl(item.image || item.img || item.src, '/placeholder.svg')];
}

function normalizeVisual(item) {
  if (Array.isArray(item)) return item.length >= 3 ? item.slice(0, 4) : null;
  if (!item || typeof item !== 'object') return null;
  return [item.title || item.name || 'School Facility', item.description || item.desc || '', imageUrl(item.image || item.img || item.src, '/placeholder.svg')];
}

function normalizeGallery(items) {
  if (!Array.isArray(items)) return seed.gallery;
  return items.filter(Boolean).map((item, i) => {
    if (typeof item === 'string') return { src:imageUrl(item, seed.gallery[i % seed.gallery.length].src), title:`School Photo ${i + 1}`, cat:'School' };
    return { src:imageUrl(item.src || item.image || item.img || item.url, seed.gallery[i % seed.gallery.length].src), title:item.title || item.name || `School Photo ${i + 1}`, cat:item.cat || item.category || 'School' };
  }).filter(item => item.src);
}

function normalizeRemote(remote) {
  const r = remote && typeof remote === 'object' ? remote : {};
  return {
    ...seed,
    ...r,
    heroImage:imageUrl(r.heroImage, seed.heroImage),
    campusImage:imageUrl(r.campusImage, seed.campusImage),
    principalImage:imageUrl(r.principalImage, seed.principalImage),
    academics:Array.isArray(r.academics) ? r.academics.map(normalizeAcademic).filter(Boolean) : [],
    facilities:Array.isArray(r.facilities) ? r.facilities.map(normalizeVisual).filter(Boolean) : [],
    activities:Array.isArray(r.activities) ? r.activities.map(normalizeVisual).filter(Boolean) : [],
    gallery:normalizeGallery(r.gallery),
    news:Array.isArray(r.news) ? r.news.filter(n => n && typeof n === 'object').map(n => ({title:n.title || 'School News', date:n.date || '', description:n.description || n.desc || ''})) : []
  };
}

async function findBlob() {
  const result = await list({ prefix: 'cms/site.json', limit: 20 });
  return result.blobs?.find(b => b.pathname === 'cms/site.json') || null;
}

export async function readData() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return seed;
  const blob = await findBlob();
  if (!blob) return seed;
  const res = await fetch(blob.url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`CMS data fetch failed: ${res.status}`);
  return normalizeRemote(await res.json());
}

export async function writeData(data) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  const safe = normalizeRemote(data);
  await put('cms/site.json', JSON.stringify(safe), { access: 'public', contentType: 'application/json', addRandomSuffix: false });
  return safe;
}
