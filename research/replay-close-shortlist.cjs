const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const engine = require('../ces_engine.js');
const archive = require('./exit-grid/manifest.json');
const index = require('./mis-research-index.json');
const data = fs.readFileSync(process.argv[2]);
const marketBlob = createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex');
assert.equal(marketBlob, archive.marketBlob, 'Use the pinned Bitstamp blob');
const { bars } = JSON.parse(data);
engine.validateDailyDates(bars, 'Bitstamp');
const day = 86400000;
const week = 7 * day;
const capital = 10000;
const weeks = engine.aggregate(bars, 'week').filter(bar => bar.n === 7);
const averages = engine.ema(weeks.map(bar => bar.c), 200);
const drawdowns = new Map();
let high = 0;
let weekIndex = 0;
for (const bar of bars) {
  high = Math.max(high, bar.h);
  const weekly = weeks[weekIndex];
  if (weekly && bar.t === weekly.t + 6 * day) {
    const ema200 = averages[weekIndex++];
    if (ema200 !== null && weekly.c < ema200) {
      drawdowns.set(weekly.t + week, { ema200, btcDD: 100 * (1 - weekly.c / high) });
    }
  }
}

const windows = {
  base: ['2018-01-01', '2026-11-25', 0.1, 0.05],
  skip: ['2018-01-01', '2026-11-25', 0.1, 0.05],
  stress: ['2018-01-01', '2026-11-25', 0.3, 0.2],
  early: ['2018-01-01', '2021-12-31', 0.1, 0.05],
  mid: ['2022-01-01', '2024-12-31', 0.1, 0.05],
  recent: ['2025-01-01', '2026-11-25', 0.1, 0.05],
};
function replay(row, window) {
  const [from, to, fee, slippage] = windows[window];
  const daily = bars.filter(bar => engine.iso(bar.t) >= from && engine.iso(bar.t) <= to);
  const signals = new Map([...drawdowns].filter(([time, signal]) =>
    signal.btcDD >= 100 * row.d && (window !== 'skip' || new Date(time).getUTCFullYear() !== 2020))
    .map(([time, signal]) => [time, { ...signal, score: 0, valid: true }]));
  const rules = {
    buy: [{ pct: 100, drop: 0 }],
    sell: [{ pct: row.f1 * 100, gain: (row.t1 - 1) * 100 }, { pct: row.f2 * 100, gain: (row.t2 - 1) * 100 }],
    trail: row.tr * 100,
  };
  const allocated = capital * row.a;
  const result = engine.simulateCustom(daily, signals, { capital: allocated, fee, slippage, rules }, 'A');
  let peak = capital;
  let mdd = 0;
  const reserve = capital - allocated;
  for (const point of result.equity) {
    const equity = point.value + reserve;
    peak = Math.max(peak, equity);
    mdd = Math.min(mdd, 100 * (equity / peak - 1));
  }
  const ratio = (result.final + reserve) / capital;
  const cagr = 100 * (ratio ** (365.25 * day / (daily.at(-1).t - daily[0].t)) - 1);
  const closed = new Map();
  for (const trade of result.trades) {
    if (trade.pnl !== undefined && trade.cycle <= result.cycles) {
      closed.set(trade.cycle, (closed.get(trade.cycle) ?? 0) + trade.pnl);
    }
  }
  const losses = [...closed.values()].reduce((sum, pnl) => sum + Math.max(0, -pnl), 0);
  const gains = [...closed.values()].reduce((sum, pnl) => sum + Math.max(0, pnl), 0);
  return { cagr, mdd, calmar: mdd < 0 ? cagr / -mdd : null, buys: result.buyCount, closed: result.cycles,
    pf: losses > 0 ? gains / losses : null, roi: 100 * (ratio - 1), trades: result.trades };
}
const earlyWinner = archive.shards.flatMap(shard => require('./exit-grid/' + shard.path))
  .filter(row => row.early[2] !== null).sort((a, b) => b.early[2] - a.early[2] || a.id.localeCompare(b.id))[0];
const rows = new Map([...index.rankings.robust, earlyWinner].map(row => [row.id, row]));
const results = Array.from(rows.values(), row => ({
  id: row.id,
  windows: Object.fromEntries(Object.keys(windows).map(window => {
    const output = replay(row, window);
    const actual = [output.cagr, output.mdd, output.calmar, null, output.buys, output.roi, output.closed, output.pf];
    return [window, { archived: row[window], officialExecution: output,
      delta: actual.map((value, i) => value === null || row[window][i] === null ? null : value - row[window][i]) }];
  })),
}));
console.log(JSON.stringify({ marketBlob, engine: 'MISCES.simulateCustom with external research entry gate',
  windows, earlyWinner: earlyWinner.id, status: 'retrospective, exploratory; no unseen OOS', results }));
