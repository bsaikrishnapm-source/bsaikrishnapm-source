const {test}=require('node:test');
const assert=require('node:assert/strict');
const {sample,evaluate,toCSV}=require('./demo/engine.js');
test('critical failures override a zero threshold',()=>assert.equal(evaluate(sample(),0).decision,'HOLD'));
test('unresolved dependencies invalidate claimed pilot sign-off',()=>assert.ok(evaluate(sample()).rows.find(g=>g.id==='pilot').reasons.includes('Dependency unresolved: auth')));
test('pilot clears critical gates but retains documentation follow-up',()=>{const r=evaluate(sample('pilot'));assert.equal(r.decision,'PILOT ONLY');assert.equal(r.score,90)});
test('higher threshold can hold a pilot',()=>assert.equal(evaluate(sample('pilot'),95).decision,'HOLD'));
test('all gates clear permits human release review',()=>{const r=evaluate(sample('ready'));assert.equal(r.decision,'READY FOR REVIEW');assert.equal(r.score,100)});
test('pass without evidence is not a pass',()=>{const s=sample('ready');s[0].evidence=' ';assert.equal(evaluate(s).decision,'HOLD')});
test('owner is required',()=>{const s=sample('ready');s[0].owner='';assert.ok(evaluate(s).blockers.includes('contract'))});
test('cycle fails explicitly',()=>{const s=sample();s[0].depends=['pilot'];assert.throws(()=>evaluate(s),/cycle/)});
test('missing dependency fails explicitly',()=>{const s=sample();s[0].depends=['absent'];assert.throws(()=>evaluate(s),/Missing dependency/)});
test('reject empty gates, duplicates, invalid weights, status and threshold',()=>{
assert.throws(()=>evaluate([]));assert.throws(()=>evaluate([...sample(),sample()[0]]));
for(const v of [-1,101,NaN,Infinity]) assert.throws(()=>evaluate(sample(),v));
for(const patch of [{weight:0},{weight:NaN},{status:'approved'}]){const s=sample();Object.assign(s[0],patch);assert.throws(()=>evaluate(s))}
});
test('CSV quotes multiline evidence and neutralizes formula prefixes',()=>{const s=sample('ready');s[0].evidence='Line "one"\nnext';s[0].owner='=1+1';const csv=toCSV(evaluate(s));assert.ok(csv.includes('"Line ""one""\nnext"'));assert.ok(csv.includes("\"'=1+1\""))});
test('evaluation is deterministic and does not mutate inputs',()=>{const s=sample(),before=JSON.stringify(s);assert.deepEqual(evaluate(s),evaluate(s));assert.equal(JSON.stringify(s),before)});
