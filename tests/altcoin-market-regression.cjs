const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createHash, webcrypto } = require('node:crypto');
const { join } = require('node:path');
const vm = require('node:vm');

const [directory, btcPath, baseline] = process.argv.slice(2);
assert.ok(directory && btcPath && baseline, 'Pass market directory, BTC fixture and baseline checkout');
const coins = ['SOL', 'AVAX', 'LINK', 'BNB', 'OKB', 'SUI'];
const end = Date.parse('2026-11-24');
const readMarket = path => {
  const data = readFileSync(path);
  return { ...JSON.parse(data), sha256: createHash('sha256').update(data).digest('hex') };
};
const btc = readMarket(btcPath);
function load(root) {
  const context = vm.createContext({ setTimeout, TextEncoder, crypto: webcrypto });
  context.window = context;
  for (const file of ['ces_engine.js','ces_dynamic.js','ces_auto_core.js','ces_library.js',
    'ces_research164.js','ces_robust165.js','ces_history166.js','ces_optimizer_data.js']) {
    vm.runInContext(readFileSync(join(root, file), 'utf8'), context, { filename:file });
  }
  return context;
}

(async () => {
  const current = load(join(__dirname, '..'));
  const prior = load(baseline);
  const opts = { to:'2026-11-24', capital:10000, fee:.1, slippage:.05, mdd:30, mae:25 };
  const rows = [];
  const canonicalBTC = current.CESDynamic.signals(btc.bars, btc.bars, new Map(),
    {flex:current.CESLibrary.RA01.flex}).signals;
  for (const coin of coins) {
    const barset = readMarket(join(directory, coin + '.json'));
    const summary = { coin, sha256:barset.sha256, candles:barset.bars.length, failedPages:barset.failedPages };
    try {
      assert.equal(barset.failedPages.length, 0, 'API pages missing');
      const snapshot = await current.researchSnapshot(coin, barset.bars, btc.bars, new Map(), end);
      assert.equal(snapshot.end, end);
      assert.equal(snapshot.b[0].t, btc.bars[0].t);
      const oldInput = prior.alignSignalData(coin, barset.bars, btc.bars);
      const actual = await current.CESHistory.run(snapshot.a,opts,undefined,undefined,snapshot.b);
      const expected = await prior.CESHistory.run(oldInput.a,opts,undefined,undefined,oldInput.b);
      assert.equal(actual.rows.length,20);
      assert.equal(JSON.stringify(actual.rows),JSON.stringify(expected.rows),coin + ' Historical rows differ');
      const signals = current.CESDynamic.signals(snapshot.a,snapshot.b,new Map(),
        { flex:current.CESLibrary.RA01.flex }).signals;
      for(const [time, signal] of signals) assert.equal(signal.btcDD,canonicalBTC.get(time)?.btcDD);
      rows.push({...summary,result:'PASS',snapshotId:snapshot.snapshotId,
        from:current.MISCES.iso(snapshot.start),to:opts.to,historicalRows:actual.rows.length,
        matchedGateWeeks:signals.size,statusCounts:actual.rows.reduce((c,r)=>(c[r.status]=(c[r.status]||0)+1,c),{})});
    } catch (error) {
      if (/chỉ có|API pages missing/.test(error.message)) rows.push({...summary,result:'BLOCKED',reason:error.message});
      else throw error;
    }
  }
  console.log(JSON.stringify({btcSha256:btc.sha256,rows},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
