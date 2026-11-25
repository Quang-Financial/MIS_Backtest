const assert=require('node:assert/strict');
require('../ces_report.js');
require('../mis_report_sync.js');
const row={phase:'Grid',status:'pass',roi:222.95,mdd:-16.74,mae:-5.55,rules:{dd:55},equity:Array(1000).fill(100)};
const report={locks:{btcDrawdownMin:40,belowEMA200:true},all:[row],results:[row],selected:[row],audit:{robustness:{clusters:[]}}};
const quick=MISReportSync.quick(report);
assert.equal(quick.selected[0].roi,row.roi);
assert.equal(quick.selected[0].mdd,row.mdd);
assert.deepEqual(quick.locks,report.locks);
assert.equal(quick.selected[0].equity,undefined);
assert.equal(quick.all,undefined);
assert.equal(report.selected[0].equity.length,1000);
assert.ok(MISReport.bytes(quick).length<MISReport.bytes(report).length);
const h=MISReportSync.quick({rows:[{roi:1,rows:[{valid:true},{valid:false}]}]});
assert.equal(h.rows[0].signalWeeks,2);
assert.equal(h.rows[0].validSignals.length,1);
console.log('Report smoke tests passed');

async function testPublish(){
 globalThis.crypto=require('node:crypto').webcrypto;
 const files=new Map();let writes=0,privateRepo=true;
 globalThis.fetch=async(url,opts={})=>{
  const u=new URL(url);assert.equal(u.hostname,'api.github.com');
  assert.equal(opts.headers.Authorization,'Bearer test-only');
  if(!u.pathname.includes('/contents/'))return {ok:true,json:async()=>({private:privateRepo,default_branch:'main'})};
  const key=u.pathname;
  if(opts.method==='PUT'){writes++;const body=JSON.parse(opts.body);files.set(key,body.content);return {ok:true,json:async()=>({content:{html_url:key}})}}
  if(!files.has(key))return {ok:false,status:404};
  return {ok:true,json:async()=>({type:'file',encoding:'base64',content:files.get(key),html_url:key})};
 };
 const repo='Quang-Financial/MIS_Reports',a={version:'1.6.6.3',note:'Báo cáo thử'};
 const first=await MISReportSync.publish(a,repo,'test-only');
 assert.match(first,/sha256-[a-f0-9]{64}\.json$/);
 assert.equal(await MISReportSync.publish(a,repo,'test-only'),first);
 assert.equal(writes,1);
 assert.notEqual(await MISReportSync.publish({...a,note:'Khác'},repo,'test-only'),first);
 assert.equal(writes,2);
 files.set(first,'invalid');
 await assert.rejects(MISReportSync.publish(a,repo,'test-only'),/không khớp/);
 privateRepo=false;
 await assert.rejects(MISReportSync.publish(a,repo,'test-only'),/Private/);
 await assert.rejects(MISReportSync.publish(a,'other/repo','test-only'),/MIS_Reports/);
 assert.equal(writes,2);
 console.log('Report deduplication and repository safety tests passed');
}
testPublish().catch(e=>{console.error(e);process.exitCode=1});
