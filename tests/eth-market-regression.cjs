const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createHash, webcrypto } = require('node:crypto');
const { join } = require('node:path');
const vm = require('node:vm');

const [ethPath, btcPath] = process.argv.slice(2);
assert.ok(ethPath && btcPath, 'Pass archived ETH and BTC daily JSON inputs');
const readMarket = path => {
  const data = readFileSync(path);
  return { bars: JSON.parse(data).bars, sha256: createHash('sha256').update(data).digest('hex') };
};
const eth = readMarket(ethPath);
const btc = readMarket(btcPath);
const setup = vm.createContext({ setTimeout, TextEncoder, crypto: webcrypto });
setup.window = setup;
for (const file of ['ces_engine.js','ces_dynamic.js','ces_auto_core.js','ces_library.js',
  'ces_research164.js','ces_robust165.js','ces_history166.js','ces_optimizer_data.js']) {
  vm.runInContext(readFileSync(join(__dirname,'..',file),'utf8'),setup,{ filename:file });
}

(async () => {
  const end = Date.parse('2026-11-24');
  const snapshot = await setup.researchSnapshot('ETH', eth.bars, btc.bars, new Map(), end);
  assert.equal(snapshot.a.length, 2000);
  assert.equal(snapshot.end, end);
  assert.equal(snapshot.b[0].t, btc.bars[0].t);
  const opts = { to: '2026-11-24', capital: 10000, fee: .1, slippage: .05, mdd: 30, mae: 25 };
  const report = await setup.CESHistory.run(snapshot.a, opts, undefined, undefined, snapshot.b);
  assert.equal(report.rows.length, 20);
  assert.ok(report.rows.some(row => row.metrics));
  const restored = await setup.researchSnapshot('ETH', snapshot.a, snapshot.b, snapshot.fear, end);
  assert.equal(restored.snapshotId, snapshot.snapshotId);
  const replay = await setup.CESHistory.run(restored.a, opts, undefined, undefined, restored.b);
  assert.equal(JSON.stringify(replay.rows), JSON.stringify(report.rows));
  console.log(JSON.stringify({ ethSha256:eth.sha256,btcSha256:btc.sha256,snapshotId:snapshot.snapshotId,
    from:setup.MISCES.iso(snapshot.start),to:opts.to,rows:report.rows.length,replayEqual:true,
    rowsWithMetrics:report.rows.filter(row=>row.metrics).length,
    noTrade:report.rows.filter(row=>row.status==='No Trade').length,
    statusCounts:report.rows.reduce((counts,row)=>(counts[row.status]=(counts[row.status]||0)+1,counts),{}) },null,2));
})().catch(error => { console.error(error); process.exitCode=1; });
