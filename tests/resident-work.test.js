import test from 'node:test';
import assert from 'node:assert/strict';
import {createPopulation,nodes} from '../simulation.js';
import {createVillageWork,WORK_SITES} from '../resident-work.js';
import {taskFor,ROLE_LABELS} from '../resident-tasks.js';
import {createDailyReports} from '../daily-reports.js';
const town=()=>{const p=createPopulation();p[4].role='priest';return p;};

test('all 500 residents have a deterministic real task, safe child learning and a reachable work site',()=>{
 const p=town(),work=createVillageWork(p),copy=town();createVillageWork(copy);
 assert.deepEqual(p.map(p=>p.duty),copy.map(p=>p.duty));assert.equal(new Set(p.map(p=>p.duty.role)).size,14);
 for(const person of p){const d=person.duty;assert.ok(ROLE_LABELS[d.role]);assert.ok(nodes[work.sites[d.station].node]);assert.equal(d.plan,taskFor(person,0).future);assert.ok(d.task.duration>0);assert.ok(Object.keys(d.task.outputs).length);if(person.age<16){assert.equal(d.role,12);assert.deepEqual(d.task.inputs,{});assert.deepEqual(d.task.outputs,{knowledge:1});}}
 assert.equal(WORK_SITES.length,48);
});

test('work takes time, reserves inputs only at the workplace, and credits output only after actual delivery',()=>{
 const p=town(),work=createVillageWork(p),person=p[2];for(const other of p)other.assembly=other!==person;
 const d=person.duty,site=WORK_SITES[d.station];person.x=site.x;person.z=site.z;person.node=site.node;d.phase='travel';person.path=[site.node];
 const before=work.stock;work.update(1,9);assert.equal(d.phase,'working');assert.equal(work.stock.timber,before.timber-1);assert.equal(work.stock.tools,0);
 work.update(10,9);assert.equal(work.stock.tools,0);const remaining=d.remaining;
 person.assembly=true;work.update(20,12);assert.equal(d.remaining,remaining);person.assembly=false;person.social={conversation:12};work.update(20,10);assert.equal(d.remaining,remaining);person.social.conversation=null;
 work.update(0,10);assert.equal(d.remaining,remaining);
 for(let i=0;i<60&&d.phase==='working';i++)work.update(1,10);
 assert.equal(d.phase,'delivery');assert.equal(work.stock.tools,0);assert.deepEqual(d.cargo,{tools:2});
 const pos={x:person.x,z:person.z};work.update(1,10);assert.ok(Math.hypot(person.x-pos.x,person.z-pos.z)<=person.speed+1e-7);assert.equal(work.stock.tools,0);
 for(let i=0;i<600&&d.today.completed===0;i++)work.update(1,10);
 assert.equal(d.today.completed,1);assert.equal(work.stock.tools,2);assert.equal(d.cargo,null);assert.equal(work.summary().journal[0].personId,person.id);
});

test('a full village works, moves continuously, delivers for every resident and never makes negative stocks',()=>{
 const p=town(),work=createVillageWork(p);const seen=new Set();
 for(let step=0;step<1620;step++){
  const before=p.map(p=>({x:p.x,z:p.z}));work.update(1,9+step/180);
  for(const [i,person]of p.entries()){assert.ok(Math.hypot(person.x-before[i].x,person.z-before[i].z)<=person.speed+1e-6,`teleport ${person.id}`);assert.ok(Number.isFinite(person.x)&&Math.abs(person.x)<90);if(person.duty.today.completed)seen.add(person.id);}
  for(const amount of Object.values(work.stock))assert.ok(Number.isFinite(amount)&&amount>=0);
 }
 assert.equal(seen.size,500,`residents without a completed function: ${p.filter(p=>!seen.has(p.id)).map(p=>p.id)}`);
 assert.ok(work.summary().delivered>=500);assert.ok(work.stock.bread>0);assert.ok(work.stock.knowledge>0);assert.ok(work.stock.care>0);
});

test('a depleted input blocks a task until supplies arrive, with no free output',()=>{
 const p=town(),work=createVillageWork(p),data=work.serialize();data.stock.grain=0;data.stock.water=0;assert.ok(work.restore(JSON.parse(JSON.stringify(data)),9));
 const baker=p.find(p=>p.age>=16&&p.jobId===1),d=baker.duty,site=WORK_SITES[d.station];for(const other of p)other.assembly=other!==baker;baker.node=site.node;baker.x=site.x;baker.z=site.z;d.phase='travel';baker.path=[site.node];for(let i=0;i<10&&d.phase==='travel';i++)work.update(1,9);
 assert.equal(d.phase,'blocked');assert.match(d.blocker,/gra/);const before=work.stock.bread;for(let i=0;i<100;i++)work.update(1,9);assert.equal(work.stock.bread,before);assert.equal(d.inputPaid,false);
 const supplied=JSON.parse(JSON.stringify(work.serialize()));supplied.stock.grain=10;supplied.stock.water=10;assert.ok(work.restore(supplied,9));work.update(1,9);assert.equal(baker.duty.phase,'working');assert.equal(work.stock.grain,8);
});

test('mid-task saves preserve reserved inputs and carried output without duplicating a delivery',()=>{
 const p=town(),work=createVillageWork(p);for(let i=0;i<360;i++)work.update(1,9+i/180);
 const saved=JSON.parse(JSON.stringify(work.serialize())),p2=town(),restored=createVillageWork(p2);assert.ok(restored.restore(saved,11));assert.deepEqual(restored.stock,work.stock);
 assert.equal(p2.filter(p=>p.duty.inputPaid).length,p.filter(p=>p.duty.inputPaid).length);
 for(let i=0;i<240;i++){const h=11+i/180;work.update(1,h);restored.update(1,h);}
 assert.deepEqual(restored.stock,work.stock);assert.equal(restored.summary().delivered,work.summary().delivered);
 assert.deepEqual(p2.map(p=>p.duty.today),p.map(p=>p.duty.today));
 assert.equal(restored.restore({...saved,stock:{grain:-1}},11),false);
});

test('daily reports use completed deliveries, preserve yesterday and do not invent work on skipped days',()=>{
 const p=town(),work=createVillageWork(p),reports=createDailyReports(p);
 for(let i=0;i<1620;i++)work.update(1,9+i/180);
 const completed=p[12].duty.today.completed;assert.ok(completed>0);work.update(0,24);reports.observe(0,24);assert.match(reports.report(p[12]).yesterday,/vaig/);assert.equal(p[12].duty.yesterday.completed,completed);
 assert.equal(reports.report(p[12]).today,taskFor(p[12],1).future);
 const before=p[12].duty.yesterday;work.update(1,25);assert.deepEqual(p[12].duty.yesterday,before);
 work.update(0,96);reports.observe(0,96);assert.equal(reports.report(p[12]).yesterday,'no vaig completar cap tasca anotada');
});
