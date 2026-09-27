'use strict';
const api=window.LaunchReadiness;
let gates=api.sample(),current=null;
const $=id=>document.getElementById(id);
function el(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
function renderGates(){
  $('gates').replaceChildren();
  for(const g of gates){
    const card=el('article',undefined,'gate');card.id='gate-'+g.id;
    card.append(el('span',g.critical?'Critical gate':'Rollout follow-up','tag'),el('h3',g.name));
    card.append(el('p','Depends on: '+(g.depends.join(', ')||'No prerequisites'),'depends'));
    const fields=el('div',undefined,'fields');
    for(const key of ['status','owner','evidence']){
      const box=el('div');const label=el('label',key==='status'?'Reported status':key==='owner'?'Accountable team':'Evidence note');label.htmlFor=g.id+'-'+key;
      const input=el(key==='status'?'select':key==='evidence'?'textarea':'input');input.id=label.htmlFor;
      if(key==='status')for(const val of ['pass','fail','unknown']){const option=el('option',val);option.value=val;input.append(option);}
      input.value=g[key];input.addEventListener(key==='status'?'change':'input',()=>{g[key]=input.value;update();});
      box.append(label,input);if(key==='evidence')box.style.gridColumn='1 / -1';fields.append(box);
    }
    card.append(fields,el('p','','reason'));$('gates').append(card);
  }
}
function update(){
  current=null;$('export').disabled=true;
  try{
    if($('threshold').value.trim()==='')throw new Error('Enter a readiness threshold from 0 to 100.');
    current=api.evaluate(gates,Number($('threshold').value));
    $('result').replaceChildren(el('span',current.score.toFixed(0)+'%','score'),el('p','RELEASE RECOMMENDATION','eyebrow'),el('h2',current.decision),el('p',current.explanation));
    for(const row of current.rows){const n=$('gate-'+row.id).querySelector('.reason');n.textContent=row.passed?'✓ Gate clear':row.reasons.join(' · ');n.className='reason'+(row.passed?' clear':'');}
    $('export').disabled=false;
  }catch(e){$('result').replaceChildren(el('h2','Check your inputs'),el('p',e.message));}
}
$('scenario').addEventListener('change',()=>{gates=api.sample($('scenario').value);renderGates();update();});
$('threshold').addEventListener('input',update);
$('export').addEventListener('click',()=>{if(!current)return;const url=URL.createObjectURL(new Blob([api.toCSV(current)],{type:'text/csv;charset=utf-8'}));const a=el('a');a.href=url;a.download='api-launch-decision.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
renderGates();update();
