const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const fixture = process.argv[2];
assert.ok(fixture, 'Usage: node tests/market-warmup-audit.cjs <btcusd-bitstamp.json>');
const bytes = readFileSync(fixture);
const sha256 = createHash('sha256').update(bytes).digest('hex');
assert.equal(sha256, '89168eb95d1094f6224d131e64cc30c1548c94c946f214c5f4755a3932625b74');
const { bars } = JSON.parse(bytes);
assert.equal(bars.length, 5578);

function load(engineFile) {
const context = vm.createContext({ setTimeout });
context.window = context;
for (const file of ['ces_engine.js', 'ces_dynamic.js', 'ces_auto_core.js', 'ces_library.js',
  'ces_research164.js', 'ces_robust165.js', 'ces_history166.js']) {
  vm.runInContext(readFileSync(file === 'ces_engine.js' && engineFile ? engineFile : join(__dirname, '..', file), 'utf8'), context, { filename: file });
}
return context;
}
const { MISCES, CESAuto, CESDynamic, CESHistory, CESLibrary } = load();
const day = 86400000;
const monday = bars.findIndex(bar => new Date(bar.t).getUTCDay() === 1);
const withoutPartialWeek = bars.slice(monday);
const firstCompleteClose = MISCES.aggregate(bars, 'week').filter(week => week.n === 7)[199].t + 7 * day;
const date = time => MISCES.iso(time);
const opts = { to: '2026-11-24', capital: 10000, fee: .1, slippage: .05, mdd: 30, mae: 25 };
const normalize = value => JSON.stringify(value);

async function run() {
  const current = await CESHistory.run(bars, opts);
  const counterfactual = await CESHistory.run(withoutPartialWeek, opts);
  let baseline;
  if (process.argv[3]) {
    const old = await load(process.argv[3]).CESHistory.run(bars, opts);
    const fillFields = ['date', 'action', 'price', 'qty', 'cash'];
    const comparable = report => report.rows.map(({ name, period, status, metrics, trades }) =>
      ({ name, period, status, metrics, fills: trades?.map(trade => fillFields.map(field => trade[field])) }));
    assert.deepEqual(JSON.parse(normalize(comparable(current))), JSON.parse(normalize(comparable(old))));
    baseline = { matchedRows: old.rows.length, metricsAndFillsIdentical: true };
  }
  assert.equal(current.rows.length, 20);
  assert.equal(counterfactual.rows.length, 20);
  const perStrategy = CESHistory.names.map(name => {
    const flex = CESAuto.lock(CESLibrary[name].flex);
    const first = CESDynamic.signals(bars, bars, new Map(), { flex }).signals;
    const second = CESDynamic.signals(withoutPartialWeek, withoutPartialWeek, new Map(), { flex }).signals;
    const sharedDates = [...first.keys()].filter(t => second.has(t));
    const emaDifference = [];
    const gateFlips = [];
    const validFlips = [];
    const scoreFlips = [];
    for (const t of sharedDates) {
      const a = first.get(t);
      const b = second.get(t);
      const ready = s => Number.isFinite(s.ema200);
      if (ready(a) && ready(b)) emaDifference.push(Math.abs(a.ema200 - b.ema200));
      if ((ready(a) && a.close < a.ema200) !== (ready(b) && b.close < b.ema200)) gateFlips.push(date(t));
      if (a.valid !== b.valid) validFlips.push(date(t));
      if (a.score !== b.score) scoreFlips.push(date(t));
    }
    return { name, comparedWeeks: sharedDates.length,
      firstCurrentEMA200: date([...first].find(([, s]) => Number.isFinite(s.ema200))[0]),
      firstCounterfactualEMA200: date([...second].find(([, s]) => Number.isFinite(s.ema200))[0]),
      maxAbsoluteEMA200DifferenceUsd: Math.max(...emaDifference),
      latestAbsoluteEMA200DifferenceUsd: emaDifference.at(-1), gateFlips, validFlips, scoreFlips };
  });
  const changes = current.rows.flatMap((a, index) => {
    const b = counterfactual.rows[index];
    assert.equal(a.name, b.name);
    assert.equal(a.period, b.period);
    const differences = ['status', 'metrics', 'trades', 'funnel'].filter(key => normalize(a[key]) !== normalize(b[key]));
    const tradeFields = [...new Set((a.trades ?? []).flatMap((trade, i) =>
      Object.keys(trade).filter(key => normalize(trade[key]) !== normalize(b.trades?.[i]?.[key]))))].sort();
    return differences.length ? [{ name: a.name, period: a.period, differences, tradeFields,
      current: { status: a.status, metrics: a.metrics, trades: a.trades?.length },
      counterfactual: { status: b.status, metrics: b.metrics, trades: b.trades?.length } }] : [];
  });
  console.log(JSON.stringify({ sha256, candles: bars.length, first: date(bars[0].t),
    last: date(bars.at(-1).t), removedDays: monday, firstCompleteEMA200Close: date(firstCompleteClose),
    perStrategy, baseline, historicalRows: current.rows.length, changes }, null, 2));
}
run().catch(error => { console.error(error); process.exitCode = 1; });
