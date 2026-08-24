import { list, put } from '@vercel/blob';

const seed={
  accounts:[
    {id:'SVP001',name:'Demo Parent',studentId:'SV001',studentName:'Demo Student',className:'5th Class',phone:'9491171564',pin:'1234'}
  ],
  announcements:[
    {title:'Welcome to Sri Vidya E.M. School',date:'2026-08-24',description:'Welcome parents and students. All school updates will appear here live.'},
    {title:'Parent–Teacher Meeting',date:'2026-08-29',description:'Parent–Teacher Meeting will be conducted on Saturday. Please attend without fail.'}
  ],
  homework:[
    {studentId:'SV001',title:'English Homework',date:'2026-08-24',description:'Read Lesson 3 and write the new words five times.'},
    {studentId:'SV001',title:'Mathematics Homework',date:'2026-08-24',description:'Complete Exercise 4.1 in the Mathematics notebook.'}
  ],
  attendance:[
    {studentId:'SV001',title:'August Attendance',date:'2026-08-24',description:'Present: 18 days • Absent: 1 day • Attendance: 94.7%'}
  ],
  timetable:[
    {studentId:'SV001',title:'Monday Timetable',date:'2026-08-24',description:'9:00 English • 10:00 Mathematics • 11:00 Science • 12:00 Telugu • 2:00 Social Studies • 3:00 Activity'}
  ],
  results:[
    {studentId:'SV001',title:'Unit Test – Term 1',date:'2026-08-20',description:'English 88/100 • Mathematics 92/100 • Science 86/100 • Telugu 90/100'}
  ],
  fees:[
    {studentId:'SV001',title:'School Fee Status',date:'2026-08-24',description:'Current academic fee notice: Please contact the school office for the latest payable amount and due date.'}
  ],
  holidays:[
    {title:'School Holiday',date:'2026-08-26',description:'School holiday. Regular classes resume on the next working day.'}
  ],
  circulars:[
    {title:'School Circular',date:'2026-08-24',description:'Parents are requested to check the app regularly for official school notices.'}
  ],
  events:[
    {title:'Independence Day Celebration',date:'2026-08-15',description:'Students participated in cultural programmes and patriotic activities.'}
  ],
  achievements:[
    {studentId:'SV001',title:'Student Achievement',date:'2026-08-22',description:'Congratulations to our students for active participation in school activities.'}
  ],
  transport:[
    {studentId:'SV001',title:'School Transport',date:'2026-08-24',description:'School Bus / Van transport is available. Contact 9491171564 for route and pickup information.'}
  ],
  leaves:[],
  complaints:[],
  gallery:[]
};
async function find(){const r=await list({prefix:'app/school.json',limit:20});return r.blobs?.find(b=>b.pathname==='app/school.json')||null}
export async function readAppData(){if(!process.env.BLOB_READ_WRITE_TOKEN)return seed;const b=await find();if(!b)return seed;const r=await fetch(b.url,{cache:'no-store'});if(!r.ok)throw new Error('App data fetch failed');return await r.json()}
export async function writeAppData(data){if(!process.env.BLOB_READ_WRITE_TOKEN)throw new Error('BLOB_READ_WRITE_TOKEN is not configured');await put('app/school.json',JSON.stringify(data),{access:'public',contentType:'application/json',addRandomSuffix:false});return data}
export {seed};
