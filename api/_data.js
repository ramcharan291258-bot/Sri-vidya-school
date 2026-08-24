import { list, put } from '@vercel/blob';

export const seed = {
  heroTitle:'Sri Vidya E.M. School',
  heroSub:'Established 2002 • English Medium • LKG to 7th Class',
  about:'Sri Vidya E.M. School was established in 2002 at Kesavaram, Ganapavaram Mandal, West Godavari District, Andhra Pradesh. The school provides English Medium education from LKG to 7th Class and follows the State Syllabus. Along with academic education, the school encourages students to participate in sports, cultural programmes, science exhibitions, educational tours, yoga, music, dance, drawing, clubs and various celebrations.',
  heroImage:'/images/hero-campus.png',
  campusImage:'/images/campus-original.jpeg',
  principalName:'Velavalapalli Babji',
  principalRole:'Principal / Correspondent / Chairman',
  principalMessage:'Principal of Sri Vidya E.M. School. The website presents the school leadership with the official supplied photograph and school branding.',
  principalImage:'/images/principal-designed.png',
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
  academics:[], facilities:[], activities:[], gallery:[], news:[]
};

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
  return await res.json();
}

export async function writeData(data) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  await put('cms/site.json', JSON.stringify(data), { access: 'public', contentType: 'application/json', addRandomSuffix: false });
  return data;
}
