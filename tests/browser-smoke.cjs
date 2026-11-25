const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const pages = ['index.html','ces_optimizer.html','ces_auto.html','ces_history.html','ces_monitor.html','mis_datahub.html','ces_compare.html'];
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
     for(const tab of await page.locator('[data-tab]').all()) await tab.click();
     await page.evaluate(()=>localStorage.setItem('mis-test-preserve','ok'));
     await page.reload();
     assert.equal(await page.evaluate(()=>localStorage.getItem('mis-test-preserve')),'ok');
    }
    console.log(name,file,'loaded');
   }
   assert.deepEqual(errors,[],name+' uncaught page errors');
  }finally{await browser.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=1});
