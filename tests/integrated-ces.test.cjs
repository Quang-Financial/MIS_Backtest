const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const { gunzipSync } = require('node:zlib');
const { join } = require('node:path');
const { zone, zoneEvidence, frames, robustness, paperFill } = require('../mis_research_workspace.js');
globalThis.MISCES = require('../ces_engine.js');
for (const file of ['ces_dynamic', 'ces_auto_core', 'ces_library']) require('../' + file + '.js');
const day = 86400000;
const t = Date.UTC(2020, 0, 6);
const rules = mode => ({ buy: mode === 'A' ? [{ drop: 0, pct: 100 }] :
  [{ drop: 0, pct: 30 }, { drop: 10, pct: 30 }, { drop: 20, pct: 40 }],
  sell: [{ gain: 100, pct: 25 }, { gain: 200, pct: 40 }], trail: 15 });

test('zone boundaries and forward horizons use no hold crossing IS/OOS', () => {
  assert.equal(zone(100, 60).index, 1);
  assert.equal(zone(100, 50).index, 3);
  const bars = Array.from({ length: 350 }, (_, i) => {
    const c = [20, 240, 260].includes(i) ? 59 : 100;
    return { t: t + day * i, o: c, h: c, l: c, c };
  });
  const result = zoneEvidence(bars);
  const is = result.rows.find(row => row.label === 'IS' && row.index === 1);
  const oos = result.rows.find(row => row.label === 'OOS' && row.index === 1);
  assert.equal(result.split, t + day * 245);
  assert.equal(is.candidates, 2);
  assert.equal(is.metrics[1].samples, 1);
  assert.equal(oos.candidates, 1);
  assert.equal(oos.metrics[1].samples, 0);
  assert.equal(oos.metrics[1].roi, null);
  assert.deepEqual(frames(bars), { days: 350, weeks: 50, months: 10 });
});

test('real frozen data produces A/B partitions; historical Fear blocks causal evaluation', () => {
  function load(name) {
    return JSON.parse(gunzipSync(readFileSync(join(__dirname, 'fixtures', name + '.json.gz')))).bars;
  }
  const a = load('sol-okx-2026-11-24');
  const b = load('btcusd-bitstamp').filter(bar => bar.t <= a.at(-1).t);
  const snapshot = { a, b, fear: new Map() };
  const options = { fee: 0.1, slippage: 0.05, capital: 10000 };
  assert.equal(robustness(snapshot, CESAuto.lock(CESLibrary.A05.flex), options, rules).blocked, true);
  const flex = CESAuto.lock(CESLibrary.RA01.flex);
  const original = JSON.stringify(flex);
  const result = robustness(snapshot, flex, options, rules);
  assert.equal(JSON.stringify(flex), original);
  assert.deepEqual(result.rows.slice(0, 4).map(row => row.label + row.mode), ['ISA', 'ISB', 'OOSA', 'OOSB']);
  const years = result.rows.slice(4).filter(row => row.mode === 'A');
  assert.ok(years.length >= 2);
  assert.ok(years.every((row, i) => i === 0 || years[i - 1].through + day === row.from));
  assert.ok(result.rows.some(row => Number.isFinite(row.benchmark)));
  assert.ok(result.stability.length > 0);
});

test('paper debits costs, rejects overselling and duplicate dates, preserves account on error', () => {
  const account = { initial: 1000, cash: 1000, realized: 0, positions: {}, fills: [] };
  const order = { coin: 'BTC', snapshotId: 'a'.repeat(64), side: 'BUY', amount: 200, date: t, price: 100, fee: 1, slippage: 1 };
  const bought = paperFill(account, order);
  assert.equal(bought.cash, 800);
  assert.equal(account.cash, 1000);
  assert.equal(bought.positions.BTC.cost, 200);
  assert.equal(bought.fills[0].fill, 101);
  assert.throws(() => paperFill(bought, order), /mỗi mã một lượt/);
  assert.throws(() => paperFill(bought, { ...order, date: t - day }), /theo ngày/);
  assert.throws(() => paperFill(bought, { ...order, date: t + day, side: 'SELL', amount: 20 }), /vượt vị thế/);
  assert.throws(() => paperFill(bought, { ...order, date: t + day, amount: 801 }), /vượt tiền mặt/);
  const sold = paperFill(bought, { ...order, date: t + day, side: 'SELL', amount: bought.positions.BTC.units, price: 120 });
  assert.equal(sold.positions.BTC.units, 0);
  assert.equal(sold.positions.BTC.cost, 0);
  assert.ok(sold.realized > 0);
});

test('a common paper account refuses USD and unidentified quotes', () => {
  const { paperPrice } = require('../mis_research_workspace.js');
  assert.equal(paperPrice({ a: [{ c: 100, source: 'OKX BTC/USDT' }] }, 'BTC'), 100);
  assert.throws(() => paperPrice({ a: [{ c: 100, source: 'Bitstamp BTC/USD' }] }, 'BTC'), /cùng đơn vị/);
  assert.throws(() => paperPrice({ a: [{ c: 100 }] }, 'BTC'), /cùng đơn vị/);
});

test('UTC date contract rejects gaps, duplicates, reverse order and off-midnight records', () => {
  const bar = index => ({ t: t + index * day, o: 100, h: 100, l: 100, c: 100 });
  for (const broken of [[bar(0), bar(11)], [bar(0), bar(0)], [bar(1), bar(0)]]) {
    assert.throws(() => zoneEvidence(broken), /thiếu ngày, trùng hoặc sai thứ tự/);
  }
  assert.throws(() => zoneEvidence([{ ...bar(0), t: t + 60000 }]), /00:00 UTC/);
  assert.doesNotThrow(() => zoneEvidence([bar(0), bar(1)]));
});
