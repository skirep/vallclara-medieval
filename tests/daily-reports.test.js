import test from 'node:test';
import assert from 'node:assert/strict';
import {createDailyReports,dailyPlan} from '../daily-reports.js';
import {createPopulation} from '../simulation.js';

test('opening history and daily plans are reproducible, age appropriate and vary with the day',()=>{
 const people=createPopulation(),a=createDailyReports(people),b=createDailyReports(createPopulation());
 assert.deepEqual(people.map(a.report),people.map(b.report));
 for(const p of people){
  assert.match(a.report(p).text,/^Ahir .+\. Avui .+\.$/);
  assert.notEqual(dailyPlan(p,0),dailyPlan(p,1));
  if(p.age<16)assert.match(a.report(p).yesterday,/aprendre coses noves/);
 }
 assert.ok(new Set(people.filter(p=>p.age<16).map(p=>dailyPlan(p,0))).size>=4,'children in different households need different plans');
 assert.ok(new Set(people.filter(p=>p.age>=16&&p.jobId===0).map(p=>dailyPlan(p,0))).size>=2,'people with the same job need individual plans');
 const priest={...people[4],role:'priest'};assert.match(dailyPlan(priest,0),/coordinaré|visitaré|prepararé/);
});
test('later reports describe observed activities and never invent records for skipped days',()=>{
 const p=createPopulation()[2],log=createDailyReports([p]);
 p.state='walking';log.observe(10,10);p.state='talking';log.observe(5,11);
 log.observe(0,24);assert.match(log.report(p).yesterday,/conversar amb els veïns/);assert.doesNotMatch(log.report(p).yesterday,/treballar/);
 p.state='working';log.observe(20,25);p.assembly=true;log.observe(500,36);p.assembly=false;
 log.observe(0,48);assert.match(log.report(p).yesterday,/vaig treballar|vaig fer|vaig dedicar|vaig assajar|vaig tenir/);
 log.observe(0,96);assert.equal(log.report(p).yesterday,'no vaig deixar cap activitat anotada');
});
test('time spent in the public meeting does not count as a private conversation or work',()=>{
 const p=createPopulation()[2],log=createDailyReports([p]);p.assembly=true;p.state='talking';log.observe(100,12);log.observe(0,24);
 assert.equal(log.report(p).yesterday,'no vaig deixar cap activitat anotada');
});
