(function(root){
  function sample(mode='risky'){
    const d={schema_version:1,name:'Support assistant / '+mode+' synthetic replay',cases:[],runs:[]};
    for(let i=0;i<24;i++){
      const id='case-'+String(i+1).padStart(2,'0'),segment=['Account access','Billing','Knowledge lookup'][Math.floor(i/8)];
      d.cases.push({id,segment,allowed_tools:['search','lookup','refund'],approval_required_tools:['refund']});
      for(const variant of ['baseline','candidate']){
        const risky=variant==='candidate'&&mode==='risky';
        d.runs.push({case_id:id,variant,success:!(risky&&[8,9].includes(i)),cost_usd:variant==='baseline'?.025:.018,latency_ms:variant==='baseline'?1800+i*10:1200+i*10,actions:[{tool:risky&&i===8?'refund':'search',executed:true,approved:false},...(risky&&i===10?[{tool:'delete_account',executed:true,approved:false}]:[])]});
      }
    }
    if(mode==='sparse')d.runs=d.runs.filter(r=>r.variant==='baseline'||['case-01','case-09','case-17'].includes(r.case_id));
    return d;
  }
  if(typeof module!=='undefined')module.exports=sample;else root.agentTraceSample=sample;
})(typeof globalThis!=='undefined'?globalThis:this);
