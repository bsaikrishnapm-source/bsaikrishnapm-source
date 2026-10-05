#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const {evaluate,memo}=require('./engine');
try{
 const [input,policyPath]=process.argv.slice(2);
 if(!input)throw new Error('Usage: node cli.js dataset.json [policy.json]');
 const data=JSON.parse(fs.readFileSync(input,'utf8'));
 const settings=policyPath?JSON.parse(fs.readFileSync(policyPath,'utf8')):{};
 const result=evaluate(data,settings);process.stdout.write(memo(result)+'\n');
 process.exitCode=result.verdict==='READY FOR HUMAN REVIEW'?0:2;
}catch(e){process.stderr.write(e.message+'\n');process.exitCode=1;}
