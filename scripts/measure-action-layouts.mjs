import {readdirSync,writeFileSync,existsSync} from 'node:fs';
import {RESIDENT_ROSTER} from '../resident-roster.js';
import {measure} from './measure-resident-layouts.mjs';
const layouts={},sources={};
for(const file of readdirSync(new URL('../assets/',import.meta.url)).filter(f=>/^actions-[\w-]+\.png$/.test(f)).sort()){
 const id=file.slice(8,-4);if(!RESIDENT_ROSTER.some(r=>r.id===id))continue;const punch=`punch-${id}.png`;
 const partial=['girl-fisher','boy-carpenter'].includes(id);
 if(!partial&&!existsSync(new URL('../assets/'+punch,import.meta.url)))throw Error(`Missing reviewed punch sheet: ${id}`);
 let rows;try{rows=measure(file,12);}catch(error){if(String(error.message).includes('found 66'))rows=measure(file,11);else if(partial&&String(error.message).includes('found 48'))rows=measure(file,8);else throw error;}
 layouts[id]={jump:rows.slice(0,4),talk:rows.slice(-4)};
 sources[id]={jump:file,talk:file};
 if(!partial){layouts[id].punch=measure(punch,4);sources[id].punch=punch;}
 for(const action of ['jump','talk']){const override=`${action}-${id}.png`;if(existsSync(new URL('../assets/'+override,import.meta.url))){layouts[id][action]=measure(override,4);sources[id][action]=override;}}
 const left=`jump-left-${id}.png`;if(existsSync(new URL('../assets/'+left,import.meta.url))){layouts[id].jump[3]=measure(left,1)[0];layouts[id].jump[3].source='jumpLeft';sources[id].jumpLeft=left;}
 console.log(id,Object.keys(layouts[id]).length*24,'action frames');
}
writeFileSync(new URL('../action-layouts.js',import.meta.url),'// Measured rectangles and anchors for actual painted jump, punch and talk frames.\nexport const ACTION_LAYOUTS='+JSON.stringify(layouts)+';\nexport const ACTION_SOURCES='+JSON.stringify(sources)+';\n');
