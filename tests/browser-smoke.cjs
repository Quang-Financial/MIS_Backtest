const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const pages = ['index.html','mis_market.html','ces_optimizer.html','ces_auto.html','ces_history.html','ces_monitor.html','mis_datahub.html','ces_compare.html'];
(async()=>{
 for(const [name,engine,viewport] of [['desktop',chromium,{width:1440,height:900}],['mobile-webkit',webkit,{width:414,height:896}]]){
  const browser=await engine.launch();
  try{
   const context=await browser.newContext({viewport});
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
   for(const file of pages){
    const response=await page.goto('http://127.0.0.1:8765/'+file);
    assert.equal(response.status(),200,file);
    await page.waitForTimeout(300);
    assert.equal(await page.locator('body').count(),1);
    if(file==='index.html'){
     const links=page.getByRole('navigation',{name:'Điều hướng chính'}).getByRole('link');
     assert.deepEqual(await links.allTextContents(),['Tổng quan','Bộ chỉ báo','Research','Backtest','Data Hub']);
     await page.locator('#workspace-asset').selectOption('ETH');
     await page.frameLocator('iframe[title="Live Monitor"]').locator('#coin').waitFor();
     await page.waitForFunction(()=>document.querySelector('iframe[title="Live Monitor"]').contentDocument.querySelector('#coin').value==='ETH');
     await page.getByRole('navigation',{name:'Điều hướng chính'}).getByRole('link',{name:'Bộ chỉ báo',exact:true}).click();
     assert.equal(await page.locator('#workspace-candidates article').count(),4);
     await page.getByRole('navigation',{name:'Điều hướng chính'}).getByRole('link',{name:'Research',exact:true}).click();
     await page.frameLocator('iframe[title="Historical Research"]').locator('#run').waitFor();
     await page.getByRole('navigation',{name:'Điều hướng chính'}).getByRole('link',{name:'Backtest',exact:true}).click();
     await page.getByRole('button',{name:'Auto Backtest',exact:true}).click();
     await page.frameLocator('iframe[title="Auto Backtest"]').locator('#run').waitFor();
     await page.waitForFunction(()=>document.querySelector('iframe[title="Auto Backtest"]').contentDocument.querySelector('#coin').value==='ETH');
     await page.getByRole('navigation',{name:'Điều hướng chính'}).getByRole('link',{name:'Data Hub',exact:true}).click();
     await page.frameLocator('iframe[title="Data Hub"]').locator('#import').waitFor();
     await page.goBack();
     await page.frameLocator('iframe[title="Auto Backtest"]').locator('#run').waitFor();
     console.log(name,'MIS five-screen navigation and asset context passed');
    }
    if(file==='mis_market.html'){
     for(const tab of await page.locator('[data-tab]').all()) await tab.click();
     await page.evaluate(()=>localStorage.setItem('mis-test-preserve','ok'));
     await page.reload();
     assert.equal(await page.evaluate(()=>localStorage.getItem('mis-test-preserve')),'ok');
    }
    if(file==='ces_history.html'){
     const result=await page.evaluate(()=>{
      const dayMs=86400000;
      const start=Date.UTC(2022,11,21);
      const makeBars=count=>Array.from({length:count},(_,index)=>({
       t:start+index*dayMs,o:100,h:100,l:100,c:100
      }));
      validate(makeBars(1435),'BNB');
      try{validate(makeBars(1302),'SUI');}
      catch(error){return error.message;}
      throw Error('SUI warmup should be rejected');
     });
     assert.match(result,/cần 200 tuần/);
     console.log(name,'EMA200 validation uses complete weeks');
    }
    if(file==='mis_datahub.html'){
     const fixture=[{t:Date.UTC(2020,0,1),o:100,h:110,l:90,c:105},{t:Date.UTC(2020,0,2),o:105,h:120,l:100,c:115}];
     await page.locator('#file').setInputFiles({name:'synthetic.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});
     await page.locator('#import').click();
     await page.waitForFunction(()=>document.querySelector('#status').textContent==='Hoàn thành');
     await page.reload();
     await page.locator('#source').selectOption('imported');
     await page.locator('#audit').click();
     await page.waitForFunction(()=>document.querySelector('#status').textContent==='Hoàn thành');
     const report=JSON.parse(await page.locator('#summary').textContent());
     assert.equal(report.audit.days,2);
     assert.deepEqual(report.audit.gaps,[]);
     assert.deepEqual(report.audit.bad,[]);
     const persisted=await page.evaluate(()=>MISDataHub.store('imported'));
     assert.deepEqual(persisted.bars,fixture);
     console.log(name,'Data Hub synthetic import, IndexedDB reload and audit passed');
    }
    console.log(name,file,'loaded');
   }
   assert.deepEqual(errors,[],name+' uncaught page errors');
  }finally{await browser.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=1});
