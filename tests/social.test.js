import test from 'node:test';import assert from 'node:assert/strict';
import {createPopulation,updatePerson} from '../simulation.js';
import {createHistories} from '../stories.js';
import {createSocialSystem,writeConversation} from '../social.js';
function town(){return createHistories(createPopulation(500));}
test('all 500 residents have distinct, reproducible biographies with valid named relationships',()=>{
  const a=town(),b=town();assert.equal(new Set(a.map(p=>p.name)).size,500);assert.equal(new Set(a.map(p=>p.story.biography)).size,500);assert.deepEqual(a.map(p=>p.story),b.map(p=>p.story));
  for(const p of a){assert.ok(p.story.biography.includes(p.name));assert.ok(p.story.biography.includes(a[p.story.friendId].name));assert.ok(p.story.biography.includes(a[p.story.kinId].name));assert.ok(p.story.year<1348);assert.ok(p.story.year>=1348-p.age+9);assert.ok(p.story.wish);}
});
test('nearby conversations stop movement, alternate speakers, complete and leave persistent memories',()=>{
  const p=town(),a=p[0],b=p[1];a.social.cooldown=b.social.cooldown=0;a.x=0;a.z=0;b.x=1.5;b.z=0;a.path=[1];
  const system=createSocialSystem(p);assert.ok(system.begin(a,b,10));const before=a.x;updatePerson(a,1,10);assert.equal(a.x,before);assert.equal(a.state,'talking');assert.equal(system.begin(a,p[2],10),false);
  const turns=system.active[0].turns;assert.ok(new Set(turns.map(t=>t.speakerId)).size===2);assert.ok(turns.every(t=>t.text.length>10));
  for(let i=0;i<40;i++)system.update(1,10);
  assert.equal(a.social.conversation,null);assert.equal(b.social.conversation,null);assert.equal(a.social.met[b.id],1);assert.ok(a.social.meetings>=1);assert.ok(system.journal.some(c=>c.a===a.id&&c.b===b.id));
  const restored=town(),next=createSocialSystem(restored);next.restore(JSON.parse(JSON.stringify(system.serialize())));assert.equal(restored[0].social.met[1],1);assert.ok(next.journal.length>0);assert.equal(restored[0].social.conversation,null);
});
test('dialogues refer to personal histories, vary across encounters, and remember previous meetings',()=>{
  const p=town(),a=p[3],b=p[24];const first=writeConversation(a,b,9,0),variants=new Set();for(let i=0;i<12;i++)variants.add(JSON.stringify(writeConversation(a,b,9,i)));assert.ok(variants.size>=5);a.social.met[b.id]=1;assert.match(writeConversation(a,b,19,1)[0].text,/Bon vespre.*última vegada/);assert.ok(first.some(t=>t.text.includes(a.story.wish)||t.text.includes(b.story.wish)||t.text.includes(b.story.keepsake)||t.text.includes(b.story.worry)||t.text.includes('feina')));
});
test('social memory rejects unknown people and malformed saved entries',()=>{const p=town(),s=createSocialSystem(p);s.restore({version:1,memories:[null,{id:0,meetings:4,met:{'99999':8,'1':2}}],journal:[null,{a:0,b:9999,turns:[]}]});assert.equal(p[0].social.meetings,4);assert.deepEqual(p[0].social.met,{'1':2});assert.equal(s.journal.length,0);});
