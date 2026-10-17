import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const patient={_id:'demo-paciente',userId:{_id:'demo-user',name:'Paciente Demo',email:'demo@example.invalid'},age:28,biologicalSex:'male',cycleStatus:'nunca',substances:[],lastExamDate:'2026-10-01',doctorId:'demo-doctor'};
const exams=[{_id:'demo-out',examDate:'2026-10-01',markers:{hdl:39,ldl:146,triglycerides:182,hematocrit:50,hemoglobin:16.2,creatinine:1.1,glucose:98,hba1c:5.6,vitaminD:25,vitaminB12:390},riskLevel:'attention',source:'pdf',originalFileName:'Exame demonstrativo - outubro.pdf',hasOriginalPdf:true},{_id:'demo-set',examDate:'2026-09-01',markers:{hdl:54,ldl:96,triglycerides:105,hematocrit:44,hemoglobin:14.8,creatinine:0.9,glucose:86,hba1c:5.1,vitaminD:32,vitaminB12:480},riskLevel:'normal',source:'pdf',originalFileName:'Exame demonstrativo - setembro.pdf',hasOriginalPdf:true}];
const followup={notes:[{_id:'demo-note',text:'Organize seus exames e traga o historico para a proxima consulta. Exemplo ficticio de acompanhamento.',createdAt:'2026-10-02T12:00:00Z',date:'2026-10-02',isActive:true}],requestedExams:[{_id:'demo-request',label:'Perfil lipidico completo',status:'pending',createdAt:'2026-10-02T12:00:00Z',isActive:true}],interactions:[]};
http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');if(u.pathname.startsWith('/api/')){let d={};const p=u.pathname;
if(p==='/api/users/profile'){const doc=(req.headers.referer||'').includes('/medico');d={user:{_id:doc?'demo-doctor-user':'demo-user',name:doc?'Profissional Demo':'Paciente Demo',role:doc?'doctor':'patient'},expiresAt:Date.now()+3600000};}
else if(p==='/api/health')d={status:'ok'};
else if(p==='/api/patients/me')d={patient};
else if(p.includes('/followup'))d=followup;
else if(p==='/api/doctors/me')d={doctor:{userId:{name:'Profissional Demo'},crm:'DEMO',specialty:'Perfil demonstrativo'}};
else if(p.endsWith('/exams')||p==='/api/exams')d={exams,nextCursor:null,stats:{total:2,normal:1,attention:1,high:0}};
else if(p==='/api/doctors/patients')d={patients:[{...patient,latestExam:exams[0],exams}]};
else if(p.startsWith('/api/doctors/patients/'))d={patient};
res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(d));return;}
let file=path.join(root,u.pathname);if(!file.startsWith(root)){res.writeHead(403);res.end();return;}if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');const ext=path.extname(file);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.mjs':'text/javascript'})[ext]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
}).listen(4178,'127.0.0.1',()=>console.log('Demo isolated: http://127.0.0.1:4178'));
