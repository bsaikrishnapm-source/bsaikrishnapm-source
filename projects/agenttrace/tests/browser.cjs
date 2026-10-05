// Optional integration test: requires Playwright and its Chromium browser.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const sample=require('../sample');
(async()=>{
 require('node:fs').mkdirSync(path.resolve(__dirname,'../assets'),{recursive:true});
 const browser=await chromium.launch({headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
 assert.equal(await page.locator('#verdict').innerText(),'HOLD');
 await page.selectOption('#filter','attention');assert.equal(await page.locator('#traces details').count(),3);
 await page.locator('#traces summary').first().click();assert.ok((await page.locator('#traces pre').first().innerText()).includes('Required approval missing'));
 await page.screenshot({path:path.resolve(__dirname,'../assets/dashboard.png'),fullPage:true});
 await page.selectOption('#scenario','clean');assert.equal(await page.locator('#verdict').innerText(),'READY FOR HUMAN REVIEW');
 await page.locator('[name=maxMeanCost]').fill('0.001');await page.getByRole('button',{name:'Apply review policy'}).click();assert.equal(await page.locator('#verdict').innerText(),'HOLD');
 await page.locator('[name=maxMeanCost]').fill('0.030');await page.getByRole('button',{name:'Apply review policy'}).click();
 await page.selectOption('#scenario','sparse');assert.equal(await page.locator('#verdict').innerText(),'INSUFFICIENT EVIDENCE');
 await page.locator('#import').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{}')});await page.locator('#error:not([hidden])').waitFor();assert.equal(await page.locator('#verdict').innerText(),'INSUFFICIENT EVIDENCE');
 const d=sample('clean');d.name='<img src=x onerror="window.injected=true">';
 await page.locator('#import').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(d))});await page.waitForFunction(()=>document.getElementById('verdict').textContent==='READY FOR HUMAN REVIEW');assert.equal(await page.locator('#dataset img').count(),0);assert.equal(await page.evaluate(()=>window.injected),undefined);
 const download=page.waitForEvent('download');await page.click('#export');const memo=await download;assert.equal(memo.suggestedFilename(),'agenttrace-review.md');const fs=require('node:fs');assert.ok(fs.readFileSync(await memo.path(),'utf8').includes('READY FOR HUMAN REVIEW'));
 const exportData=page.waitForEvent('download');await page.click('#template');assert.deepEqual(JSON.parse(fs.readFileSync(await (await exportData).path(),'utf8')),d);
 await page.setViewportSize({width:390,height:844});await page.selectOption('#scenario','risky');await page.screenshot({path:path.resolve(__dirname,'../assets/mobile.png'),fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);console.log('PASS: 11 browser workflow checks; desktop and mobile screenshots captured.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
