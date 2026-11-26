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
     assert.equal(await page.locator('iframe:visible').count(),0);
     assert.equal(await page.locator('#workspace-tools button').count(),0);
     assert.equal(await page.locator('select:visible').count(),1);
     await page.locator('#overview-chart').waitFor();
     for(const id of ['source','asof','approval','price','dd','ema','zone','score','gap','decision']){
      assert.ok(await page.locator('#overview-'+id).isVisible(),id);
     }
     assert.equal(await page.locator('.overview-metrics article').count(),4);
     assert.equal(await page.locator('.overview-zones li').count(),7);
     assert.equal(await page.locator('.overview-frames article').count(),3);
     assert.equal(await page.locator('#overview-gates li').count(),3);
     assert.deepEqual(await page.locator('.overview-evidence a').evaluateAll(links=>links.map(link=>link.hash)),['#indicators','#research','#backtest','#data']);
     const columns=await page.locator('.overview-column').evaluateAll(cols=>cols.map(col=>({x:col.offsetLeft,y:col.offsetTop})));
     assert.ok(viewport.width>720?columns[1].x>columns[0].x:columns[1].y>columns[0].y);
     await page.waitForFunction(()=>document.querySelector('#overview-decision').textContent.startsWith('RISK ALERT'));
     assert.match(await page.locator('#overview-price').textContent(),/Chưa có dữ liệu/);

     const dailyMs=86400000;
     const fixtureStart=Date.UTC(2018,0,11);
     const today=Math.floor(Date.now()/dailyMs)*dailyMs;
     const fixture=Array.from({length:(today-fixtureStart)/dailyMs},(_,index)=>{
      const close=250-index/23+8*Math.sin(index/14);
      return [fixtureStart+index*dailyMs,close,close+1,close-1,close,0,0,0,1].map(String);
     });
     const market='https://www.okx.com/api/v5/market/history-candles?*';
     const sentiment='https://api.alternative.me/fng/?*';
     const ticker='https://www.okx.com/api/v5/market/ticker?*';
     await page.route(market,route=>{
      const cursor=Number(new URL(route.request().url()).searchParams.get('after'))||Infinity;
      return route.fulfill({json:{code:'0',data:fixture.filter(row=>Number(row[0])<cursor).slice(-100).reverse()}});
     });
     await page.route(sentiment,route=>route.fulfill({json:{data:fixture.map(row=>({timestamp:String(Number(row[0])/1000),value:'20'}))}}));
     await page.route(ticker,route=>route.fulfill({json:{code:'0',data:[{last:'125.50',ts:String(Date.now()-1000)}]}}));
     await page.locator('#workspace-asset').selectOption('ETH');
     await page.getByText('Đã cập nhật dữ liệu xác nhận.',{exact:true}).waitFor();
     assert.equal(await page.locator('h1').textContent(),'Tổng quan ETH');
     assert.match(await page.locator('#overview-ema-label').textContent(),/ETH/);
     assert.match(await page.locator('#overview-price').textContent(),/USDT/);
     assert.ok(await page.locator('#overview-chart-empty').isHidden());
     assert.match(await page.locator('#overview-score').textContent(),/\d.*\/ 100/);
     assert.match(await page.locator('#overview-approval').textContent(),/Chưa có hồ sơ kích hoạt/);
     assert.match(await page.locator('.overview-decision').textContent(),/Chưa kích hoạt/);
     assert.doesNotMatch(await page.locator('#workspace-overview').textContent(),/BUY READY/);
     if(process.env.MIS_SCREENSHOTS)await page.screenshot({path:process.env.MIS_SCREENSHOTS+'-'+name+'.png'});
     await page.evaluate(()=>{
      const flex=CESShared.load();
      CESShared.saveCommon({...flex,threshold:0});
      const researchRow={id:'fixture-fear',type:'Fear',tf:'1D',enabled:true,hard:false,
       p:14,q:20,s:5,window:1,op:'le',limit:100,weight:100};
      localStorage.setItem('mis-ces-dynamic-v150',JSON.stringify([researchRow]));
     });
     await page.locator('#overview-refresh').click();
     await page.waitForFunction(()=>document.querySelector('#overview-decision').textContent.startsWith('WATCH'));
     assert.match(await page.locator('.overview-decision').textContent(),/Chưa kích hoạt/);
     assert.doesNotMatch(await page.locator('#workspace-overview').textContent(),/BUY READY/);
     await page.evaluate(()=>{
      const now=Date.now();
      Date.now=()=>now+10*86400000;
     });
     await page.locator('#overview-refresh').click();
     await page.waitForFunction(()=>document.querySelector('#overview-decision').textContent.startsWith('RISK ALERT'));
     assert.match(await page.locator('#overview-decision').textContent(),/đã cũ/);

     await page.evaluate(()=>{
      const fixed=performance.timeOrigin+performance.now();
      Date.now=()=>fixed;
      const flex=CESShared.load();
      CESShared.saveCommon({...flex,threshold:65,btcDrawdown:0,belowEMA200:false});
      localStorage.setItem('mis-ces-dynamic-v150',JSON.stringify(flex.dynamic.map(row=>({...row,limit:10}))));
     });
     await page.locator('#overview-refresh').click();
     await page.getByText('WATCH · Vùng giả thuyết, điểm CES chưa đạt.',{exact:true}).waitFor();
     assert.match(await page.locator('#overview-gate-dd').textContent(),/40%/);
     assert.match(await page.locator('#overview-approval').textContent(),/khác khóa/);
     await page.locator('#overview-pin').click();
     await page.getByText(/Đã ghim ETH đến/).waitFor();
     const liveIdentity=await page.locator('#overview-identity').getAttribute('title');
     assert.match(liveIdentity,/^[a-f0-9]{64} \/ [a-f0-9]{64}$/);
     const parityPage=await context.newPage();
     try{
      await parityPage.goto('http://127.0.0.1:8765/ces_auto.html');
      await parityPage.selectOption('#coin','ETH');
      await parityPage.selectOption('#research','ablation');
      await parityPage.locator('#usePinned').check();
      await parityPage.fill('#to',new Date(today-dailyMs).toISOString().slice(0,10));
      await parityPage.evaluate(()=>{
       const original=CESDynamic.signals;
       CESDynamic.signals=(...args)=>{
        const result=original(...args);
        globalThis.firstAutoSignal??=[...result.signals.values()].at(-1);
        return result;
       };
      });
      await parityPage.click('#run');
      await parityPage.waitForFunction(()=>document.querySelector('#status').textContent.includes('đã lưu trên thiết bị')||document.querySelector('#status').textContent.startsWith('Lỗi:'));
      assert.match(await parityPage.locator('#status').textContent(),/Hoàn tất/);
      const provenance=await parityPage.evaluate(()=>report.provenance);
      assert.equal(provenance.effectiveStrategyId+' / '+provenance.snapshotId,liveIdentity);
      assert.equal(provenance.inputMode,'pinned');
      assert.equal(provenance.originalBase.btcDrawdown,0);
      assert.equal(provenance.base.btcDrawdown,40);
      const signal=await parityPage.evaluate(()=>globalThis.firstAutoSignal);
      assert.equal(signal.valid,false);
      assert.equal(signal.score,0);
      assert.equal(await page.locator('#overview-score').textContent(),'0 / 100');
      assert.match(await page.locator('#overview-gate-dd').textContent(),/^Đạt/);
      assert.equal(await page.locator('#overview-gate-ema').textContent(),'Đạt');
      assert.match(await page.locator('#overview-gate-score').textContent(),/^Chưa đạt/);
      console.log(name,'actual Auto/Overview config and closed snapshot hashes match');
     }finally{await parityPage.close();}
     await page.unroute(market);
     await page.unroute(sentiment);
     await page.unroute(ticker);
     await page.locator('#overview-refresh').click();
     await page.waitForFunction(()=>document.querySelector('#overview-status').textContent.startsWith('Không thể xác nhận'));
     assert.equal(await page.locator('#overview-score').textContent(),'— / 100');
     assert.equal(await page.locator('#overview-gate-dd').textContent(),'Chờ dữ liệu');
     assert.match(await page.locator('#overview-asof').textContent(),/As-of: —/);
     assert.match(await page.locator('#overview-zone').textContent(),/Chưa có drawdown/);

     await page.getByRole('navigation',{name:'Bằng chứng'}).getByRole('link',{name:'Cấu hình chiến lược'}).click();
     assert.equal(await page.locator('#workspace-candidates li').count(),4);
     assert.equal(await page.locator('#workspace-indicator-table tbody tr').count(),
       await page.evaluate(()=>CESAuto.lock(CESShared.load()).dynamic.length));
     assert.match(await page.locator('#workspace-weight').textContent(),/Tổng trọng số đang bật/);
     await page.waitForFunction(()=>/Mã cấu hình nghiên cứu: [a-f0-9]{12}/.test(document.querySelector('#workspace-config-id').textContent));
     const fixtureTypes=['RSI','EMA','SMA','Fear','RSI/SMA','MACD','ADX','BB'];
     await page.evaluate(types=>{
      const rows=types.map((type,index)=>({id:'qa-'+index,type,enabled:index!==7,hard:index===0,
        tf:type==='Fear'?'1D':index%2?'1W':'1M',p:7,q:20,s:5,limit:0,weight:index?10:0,
        window:3,op:['EMA','SMA','RSI/SMA','MACD'].includes(type)?'up':'ge',band:'upper'}));
      localStorage.setItem('mis-ces-dynamic-v150',JSON.stringify(rows));
     },fixtureTypes);
     await page.reload();
     await page.waitForFunction(()=>document.querySelectorAll('#workspace-indicator-table tbody tr').length===8);
     const rows=await page.locator('#workspace-indicator-table tbody tr').all();
     for(const [index,row] of rows.entries()){
      const cells=await row.locator('td').allTextContents();
      assert.ok(cells[0].startsWith(fixtureTypes[index]),cells[0]);
      assert.equal(cells[1],fixtureTypes[index]==='Fear'?'1D':index%2?'1W':'1M');
      assert.equal(cells[3],index?'10':'0');
      assert.equal(cells[4],index===7?'Tắt':index===0?'Bật · bắt buộc':'Bật');
      const toggle=row.getByText('Chi tiết',{exact:true});
      await toggle.click();
      assert.match(await row.locator('details dl').textContent(),/Tỷ phần chuẩn hóa/);
      assert.match(await row.locator('details dl').textContent(),index===7?/Không tham gia/:/nhận tỷ phần/);
      assert.match(await row.locator('details dl dd').nth(3).textContent(),index===0||index===7?/^0%$/:/^16,67%$/);
      await row.getByText('JSON kỹ thuật',{exact:true}).click();
      assert.match(await row.locator('pre').textContent(),/qa-/);
      assert.equal(await row.locator('details').first().evaluate(node=>node.open),true);
      await toggle.click();
      assert.equal(await row.locator('details').first().evaluate(node=>node.open),false);
     }
     for(const item of await page.locator('#workspace-candidates li').all()){
      await item.locator('summary').click();
      assert.match(await item.textContent(),/chưa liên kết/);
      await item.locator('summary').click();
     }
     await rows[5].getByText('Chi tiết',{exact:true}).click();
     assert.equal(await page.evaluate(()=>new Set([...document.querySelectorAll('[id]')].map(node=>node.id)).size===document.querySelectorAll('[id]').length),true);
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
     if(process.env.MIS_SCREENSHOTS)await page.locator('#workspace-indicator-table').screenshot({path:process.env.MIS_SCREENSHOTS+'-details-'+name+'.png'});
     await page.locator('#workspace-asset').selectOption('ETH');

     await page.getByRole('link',{name:'Tổng quan',exact:true}).click();
     await page.getByRole('navigation',{name:'Bằng chứng'}).getByRole('link',{name:'Bằng chứng vùng mua'}).click();
     assert.equal(await page.locator('#workspace-history').evaluate(node=>node.open),false);
     assert.match(await page.locator('#workspace-research').textContent(),/Chờ kiểm định vùng mua/);
     if(process.env.MIS_SCREENSHOTS)await page.screenshot({path:process.env.MIS_SCREENSHOTS+'-research-'+name+'.png'});
     await page.getByText('Chi tiết Historical Research',{exact:true}).click();
     await page.frameLocator('iframe[title="Historical Research"]').locator('#run').waitFor();
     await page.getByRole('link',{name:'Tổng quan',exact:true}).click();
     await page.getByRole('navigation',{name:'Bằng chứng'}).getByRole('link',{name:'Kết quả kiểm định'}).click();
     await page.frameLocator('iframe[title="Optimizer"]').locator('#run').waitFor();
     if(process.env.MIS_SCREENSHOTS)await page.screenshot({path:process.env.MIS_SCREENSHOTS+'-backtest-'+name+'.png'});
     await page.getByRole('button',{name:'Auto Backtest',exact:true}).click();
     await page.frameLocator('iframe[title="Auto Backtest"]').locator('#run').waitFor();
     await page.waitForFunction(()=>{
      const frame=document.querySelector('iframe[title="Auto Backtest"]');
      const doc=frame.contentDocument;
      return doc.querySelector('#coin').value==='ETH' &&
        doc.querySelector('#coin').closest('label').hidden && frame.height>0 &&
        doc.documentElement.scrollHeight<=frame.clientHeight+2;
     });
     await page.getByRole('link',{name:'Tổng quan',exact:true}).click();
     await page.getByRole('navigation',{name:'Bằng chứng'}).getByRole('link',{name:'Nguồn và chất lượng dữ liệu'}).click();
     const dataFrame=page.frameLocator('iframe[title="Data Hub"]');
     await dataFrame.getByText('Quản lý nguồn, nhập dữ liệu',{exact:true}).waitFor();
     assert.equal(await page.locator('#data-asset').textContent(),'ETH');
     if(process.env.MIS_SCREENSHOTS)await page.screenshot({path:process.env.MIS_SCREENSHOTS+'-data-'+name+'.png'});
     await dataFrame.getByText('Quản lý nguồn, nhập dữ liệu',{exact:true}).click();
     await page.frameLocator('iframe[title="Data Hub"]').locator('#import').waitFor();
     await page.goBack();
     await page.locator('#overview-chart').waitFor();
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
