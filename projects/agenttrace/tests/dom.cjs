// Optional DOM integration checks; requires jsdom. This is not a browser layout test.
const {JSDOM,VirtualConsole}=require('jsdom');
const assert=require('node:assert/strict');
const path=require('node:path');
const sample=require('../sample');
(async()=>{
 const errors=[],downloads=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=await JSDOM.fromFile(path.resolve(__dirname,'../index.html'),{runScripts:'dangerously',resources:'usable',virtualConsole:vc,beforeParse(w){w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=function(){downloads.push(this.download);};}});
 await new Promise(resolve=>dom.window.addEventListener('load',resolve));
 const w=dom.window,$=id=>w.document.getElementById(id),change=id=>$(id).dispatchEvent(new w.Event('change'));
 assert.equal($('verdict').textContent,'HOLD');
 $('filter').value='attention';change('filter');assert.equal($('traces').children.length,3);
 $('scenario').value='clean';change('scenario');assert.equal($('verdict').textContent,'READY FOR HUMAN REVIEW');
 w.document.querySelector('[name=maxMeanCost]').value='.001';$('policy').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal($('verdict').textContent,'HOLD');
 w.document.querySelector('[name=maxMeanCost]').value='.030';$('policy').dispatchEvent(new w.Event('submit',{cancelable:true}));
 $('scenario').value='sparse';change('scenario');assert.equal($('verdict').textContent,'INSUFFICIENT EVIDENCE');
 async function upload(text){Object.defineProperty($('import'),'files',{configurable:true,value:[{size:text.length,text:async()=>text}]});change('import');await new Promise(resolve=>setTimeout(resolve,0));}
 await upload('{}');assert.equal($('error').hidden,false);assert.equal($('verdict').textContent,'INSUFFICIENT EVIDENCE');
 const d=sample('clean');d.name='<img src=x onerror="window.injected=true">';await upload(JSON.stringify(d));assert.equal($('verdict').textContent,'READY FOR HUMAN REVIEW');assert.equal($('error').hidden,true);assert.equal($('dataset').querySelector('img'),null);assert.equal(w.injected,undefined);
 $('export').click();$('template').click();assert.deepEqual(downloads,['agenttrace-review.md','agenttrace-dataset.json']);
 assert.deepEqual(errors,[]);dom.window.close();console.log('PASS: DOM integration checks for scenarios, filters, policy, imports, escaping and export triggers. No browser layout claim.');
})().catch(e=>{console.error(e);process.exitCode=1;});
