(function (root) {
  'use strict';
  const seed = [
    {id:'contract',name:'API contract compatibility',owner:'Platform',weight:15,critical:true,status:'pass',evidence:'Synthetic contract suite passes',depends:[]},
    {id:'auth',name:'Tenant isolation and access checks',owner:'Security',weight:20,critical:true,status:'fail',evidence:'Synthetic cross-tenant case fails',depends:['contract']},
    {id:'retry',name:'Retry and idempotency behavior',owner:'Integrations',weight:15,critical:true,status:'pass',evidence:'Synthetic duplicate event test passes',depends:['contract']},
    {id:'monitor',name:'Error budget and alert coverage',owner:'Operations',weight:10,critical:true,status:'pass',evidence:'Synthetic alert drill recorded',depends:[]},
    {id:'rollback',name:'Rollback rehearsal',owner:'Operations',weight:15,critical:true,status:'unknown',evidence:'',depends:['monitor']},
    {id:'docs',name:'Partner quickstart and support handoff',owner:'Developer Experience',weight:10,critical:false,status:'fail',evidence:'Synthetic quickstart review pending',depends:['contract']},
    {id:'pilot',name:'Pilot acceptance and escalation owner',owner:'Product',weight:15,critical:true,status:'pass',evidence:'Fictional pilot sign-off',depends:['auth','retry']}
  ];
  function sample(mode='blocked') {
    if (!['blocked','pilot','ready'].includes(mode)) throw new Error('Unknown scenario');
    return seed.map(g=>({...g,depends:[...g.depends],...(mode!=='blocked' && (g.critical||mode==='ready')?{status:'pass',evidence:'Synthetic scenario evidence — not a real sign-off'}:{})}));
  }
  function evaluate(gates,threshold=85) {
    if(!Number.isFinite(threshold)||threshold<0||threshold>100) throw new Error('Threshold must be 0–100');
    if(!Array.isArray(gates)||!gates.length) throw new Error('At least one gate required');
    const ids=new Set();
    for(const g of gates){
      if(!g||typeof g.id!=='string'||!g.id.trim()||ids.has(g.id)) throw new Error('Gate IDs must be unique');
      ids.add(g.id);
      if(!['pass','fail','unknown'].includes(g.status)||!Number.isFinite(g.weight)||g.weight<=0||typeof g.critical!=='boolean'||typeof g.owner!=='string'||typeof g.evidence!=='string'||!Array.isArray(g.depends)) throw new Error('Invalid gate');
    }
    for(const g of gates) if(g.depends.some(id=>!ids.has(id))) throw new Error('Missing dependency');
    const byId=new Map(gates.map(g=>[g.id,g])), memo=new Map(), visiting=new Set();
    function check(id){
      if(memo.has(id)) return memo.get(id);
      if(visiting.has(id)) throw new Error('Dependency cycle');
      visiting.add(id);
      const g=byId.get(id), reasons=[];
      if(g.status!=='pass') reasons.push('Status: '+g.status);
      if(!g.owner.trim()) reasons.push('Owner missing');
      if(!g.evidence.trim()) reasons.push('Evidence note missing');
      for(const dep of g.depends) if(!check(dep).passed) reasons.push('Dependency unresolved: '+dep);
      visiting.delete(id);
      const result={...g,passed:reasons.length===0,reasons};memo.set(id,result);return result;
    }
    const rows=gates.map(g=>check(g.id));
    const total=rows.reduce((s,g)=>s+g.weight,0), earned=rows.reduce((s,g)=>s+(g.passed?g.weight:0),0);
    const score=earned/total*100, blockers=rows.filter(g=>g.critical&&!g.passed), followups=rows.filter(g=>!g.passed);
    const decision=blockers.length?'HOLD':score<threshold?'HOLD':followups.length?'PILOT ONLY':'READY FOR REVIEW';
    return {decision,score,threshold,blockers: blockers.map(g=>g.id),rows,explanation:blockers.length?'Critical gates override the score.':score<threshold?'Readiness is below the selected threshold.':followups.length?'Critical gates clear; resolve remaining gaps before broad rollout.':'All configured gates clear; an accountable human must authorize release.'};
  }
  function toCSV(result){
    const cell=v=>'"'+String(v).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
    return [['id','gate','owner','critical','status','effective_pass','evidence','reasons','decision','readiness_percent'],...result.rows.map(g=>[g.id,g.name,g.owner,g.critical,g.status,g.passed,g.evidence,g.reasons.join('; '),result.decision,result.score.toFixed(1)])].map(r=>r.map(cell).join(',')).join('\r\n');
  }
  const api={sample,evaluate,toCSV};
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  else root.LaunchReadiness=api;
})(typeof globalThis!=='undefined'?globalThis:this);
