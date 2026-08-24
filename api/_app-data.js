import { list, put } from '@vercel/blob';

const seed={
  accounts:[
    {id:'SVP001',name:'Demo Parent',studentId:'SV001',studentName:'Demo Student',className:'5th Class',phone:'9491171564',pin:'1234'}
  ],
  announcements:[], homework:[], attendance:[], timetable:[], results:[], fees:[], holidays:[], circulars:[], events:[], achievements:[], transport:[], leaves:[], complaints:[], gallery:[]
};
async function find(){const r=await list({prefix:'app/school.json',limit:20});return r.blobs?.find(b=>b.pathname==='app/school.json')||null}
export async function readAppData(){if(!process.env.BLOB_READ_WRITE_TOKEN)return seed;const b=await find();if(!b)return seed;const r=await fetch(b.url,{cache:'no-store'});if(!r.ok)throw new Error('App data fetch failed');return await r.json()}
export async function writeAppData(data){if(!process.env.BLOB_READ_WRITE_TOKEN)throw new Error('BLOB_READ_WRITE_TOKEN is not configured');await put('app/school.json',JSON.stringify(data),{access:'public',contentType:'application/json',addRandomSuffix:false});return data}
export {seed};
