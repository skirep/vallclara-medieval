import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

test('a deployed release versions entrypoints and transitive modules together without touching asset URLs',()=>{
 const dir=mkdtempSync(join(tmpdir(),'vallclara-release-'));
 try{
  writeFileSync(join(dir,'index.html'),'<link href="./style.css"><script type="module" src="./main.js"></script>');
  writeFileSync(join(dir,'main.js'),"import {roster} from './resident-roster.js'; const image=new URL('./assets/a.png',import.meta.url);");
  writeFileSync(join(dir,'resident-roster.js'),"import {artists} from './newcomers.js';");
  execFileSync('python3',['scripts/version-site.py',dir,'abc123']);
  assert.match(readFileSync(join(dir,'index.html'),'utf8'),/main\.js\?v=abc123/);
  assert.match(readFileSync(join(dir,'main.js'),'utf8'),/resident-roster\.js\?v=abc123/);
  assert.match(readFileSync(join(dir,'main.js'),'utf8'),/assets\/a\.png'/);
  assert.match(readFileSync(join(dir,'resident-roster.js'),'utf8'),/newcomers\.js\?v=abc123/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
