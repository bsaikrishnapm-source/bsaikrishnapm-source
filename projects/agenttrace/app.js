'use strict';
const $=id=>document.getElementById(id);
let data=agentTraceSample(),settings={...AgentTrace.defaults},result;
const el=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
const pct=n=>n===null?'—':(100*n).toFixed(1)+'%';
function render(){
 result=AgentTrace.evaluate(data,settings);$('dataset').textContent=data.name+' · '+data.runs.length+' recorded runs · changes are held in memory only';
 $('verdict').textContent=result.verdict;$('coverage').textContent=`${result.paired} of ${result.total} cases paired · ${result.baselineViolations} baseline policy violations`;
 $('metrics').replaceChildren();
 for(const [title,key,fmt] of [['Task success','success',pct],['p95 latency','p95',n=>n===null?'—':n+' ms'],['Mean cost / run','meanCost',n=>n===null?'—':'$'+n.toFixed(4)],['Paired coverage','n',n=>n+' cases']]){const box=el('article','');box.className='metric';box.append(el('h3',title),el('strong',fmt(result.candidate[key])),el('p','Baseline: '+fmt(result.baseline[key])));$('metrics').append(box);}
 $('findings').replaceChildren(...(result.findings.length?result.findings.map(f=>el('li',f.message)):[el('li','No configured gates failed. Inspect the traces and obtain human approval before rollout.')]));
 $('segments').replaceChildren(...result.segments.map(s=>{const tr=el('tr','');const diff=s.candidate.n?((s.candidate.success-s.baseline.success)*100).toFixed(1)+' pp':'—';tr.append(...[s.name,s.candidate.n+' / '+s.total,pct(s.baseline.success),pct(s.candidate.success),diff].map(x=>el('td',x)));return tr;}));
 renderTraces();
}
function renderTraces(){
 const rows=result.rows.filter(r=>$('filter').value==='all'||!r.baseline||!r.candidate||r.candidate.violations.length||!r.candidate.success);
 $('traces').replaceChildren(...rows.map(r=>{const d=el('details','');const state=!r.baseline||!r.candidate?'Missing pair':r.candidate.violations.length?'Policy violation':!r.candidate.success?'Task failed':'No case-level issues';d.append(el('summary',r.id+' · '+r.segment+' · '+state),el('pre',JSON.stringify(r,null,2)));return d;}));
 if(!rows.length)$('traces').append(el('p','No cases match this filter.'));
}
function error(e){$('error').textContent=e.message;$('error').hidden=false;}
function clearError(){$('error').hidden=true;}
function download(name,text,type){const u=URL.createObjectURL(new Blob([text],{type})),a=el('a','');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}
$('scenario').addEventListener('change',()=>{data=agentTraceSample($('scenario').value);clearError();render();});
$('policy').addEventListener('submit',e=>{e.preventDefault();try{const p=Object.fromEntries([...new FormData(e.target)].map(([k,v])=>[k,Number(v)]));AgentTrace.evaluate(data,p);settings=p;clearError();render();$('policy-status').textContent='Edited policy applied. Download it to reproduce this review.';}catch(e){error(e);}});
$('import').addEventListener('change',async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>5*1024*1024)throw new Error('Import is limited to 5 MB.');const next=JSON.parse(await f.text());AgentTrace.evaluate(next,settings);data=next;clearError();render();}catch(e){error(e);}finally{e.target.value='';}});
$('filter').addEventListener('change',renderTraces);
$('export').addEventListener('click',()=>download('agenttrace-review.md',AgentTrace.memo(result),'text/markdown'));
$('template').addEventListener('click',()=>download('agenttrace-dataset.json',JSON.stringify(data,null,2),'application/json'));
render();

function applySavedPolicy(next,message){
 if(!next||typeof next!=='object'||Array.isArray(next))throw new Error('Policy must be a JSON object.');
 const keys=Object.keys(AgentTrace.defaults);
 if(Object.keys(next).length!==keys.length||keys.some(k=>!Object.prototype.hasOwnProperty.call(next,k)))throw new Error('Policy must contain exactly the six documented threshold fields.');
 AgentTrace.evaluate(data,next);
 settings={...next};
 for(const key of keys)$('policy').elements.namedItem(key).value=settings[key];
 clearError();render();$('policy-status').textContent=message;
}
$('policy-export').addEventListener('click',()=>download('agenttrace-policy.json',JSON.stringify(settings,null,2),'application/json'));
$('policy-reset').addEventListener('click',()=>applySavedPolicy({...AgentTrace.defaults},'Default policy restored and applied.'));
$('policy-import').addEventListener('change',async e=>{
 try{
  const file=e.target.files[0];if(!file)return;
  if(file.size>16384)throw new Error('Policy import is limited to 16 KB.');
  applySavedPolicy(JSON.parse(await file.text()),'Imported policy applied. Review its thresholds before using the recommendation.');
 }catch(e){error(e);}finally{e.target.value='';}
});
