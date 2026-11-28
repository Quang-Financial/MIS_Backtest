const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const day = 86400000;
const start = Date.UTC(2021, 0, 4);
const end = start + 7 * 211 * day;
const iso = time => new Date(time).toISOString().slice(0, 10);
const normalize = value => JSON.parse(JSON.stringify(value));
const files = ['ces_engine.js', 'ces_dynamic.js', 'ces_auto_core.js', 'ces_library.js',
  'ces_optimizer_data.js'];
const read = file => readFileSync(join(__dirname, '..', file), 'utf8');
const makeBars = (from, to) => Array.from({ length: (to - from) / day }, (_, i) => {
  const t = from + i * day;
  const index = (t - start) / day;
  const c = 250 - index * .1 + 22 * Math.sin(index / 32);
  return { t, o: c + 1, h: c + 3, l: c - 2, c };
});

function load() {
  const nodes = new Map();
  const document = { getElementById(id) {
    if (!nodes.has(id)) nodes.set(id, { nextElementSibling: {} });
    return nodes.get(id);
  } };
  const runtime = vm.createContext({ document, nodes });
  runtime.window = runtime;
  for (const file of files) vm.runInContext(read(file), runtime, { filename: file });
  return runtime;
}

const bars = makeBars(start, end);
const extended = makeBars(start, end + 48 * day).map(bar => bar.t < end ? bar :
  { ...bar, o: 8000, h: 9000, l: 7000, c: 8000 });
const fear = new Map(extended.map(bar => [iso(bar.t), bar.t < end ? 19 : 99]));
const runtime = load();
const common = runtime.CESDynamic.signals;
const library = runtime.CESLibrary;
const cfgFor = flex => ({ flex, threshold: flex.threshold, capital: 10000, fee: .1,
  slippage: .05, rules: library.RA01.rules });

async function compare(name, flex, sentiment) {
  let capture;
  runtime.CESDynamic.signals = (daily, btc, observations, cfg) => {
    const output = common(daily, btc, observations, cfg);
    capture = output.signals;
    return output;
  };
  const opts = cfgFor(flex);
  const simulation = runtime.CESAuto.evaluate(extended, extended, sentiment, bars.slice(-70), opts, 'A');
  const historical = capture;
  runtime.CESShared = { load: () => flex };
  vm.runInContext(`fullDaily = async () => closedBars; fearDaily = async () => fearByDay;`, runtime);
  runtime.closedBars = bars;
  runtime.fearByDay = sentiment;
  if (!runtime.nodes.has('update')) vm.runInContext(read('ces_monitor153.js'), runtime);
  runtime.nodes.get('coin').value = 'BTC';
  await runtime.nodes.get('update').onclick();
  assert.equal(runtime.nodes.get('status').textContent, 'Đã cập nhật dữ liệu xác nhận.');
  assert.equal(runtime.nodes.get('asof').textContent, 'Ngày xác nhận UTC: ' + iso(end));
  const live = capture;
  let count = 0;
  for (const [time, actual] of live) {
    assert.deepEqual(normalize(actual), normalize(historical.get(time)), name + ' @ ' + iso(time));
    count++;
  }
  const current = live.get(end);
  assert.ok(current);
  assert.equal(current.valid, Number.isFinite(current.ema200) &&
    Number.isFinite(current.btcDD) && current.btcDD <= -flex.btcDrawdown &&
    (!flex.belowEMA200 || current.close < current.ema200) &&
    Number.isFinite(current.score) && current.score >= flex.threshold &&
    current.details.every(item => !item.enabled || (item.pass != null && (!item.hard || item.pass))));
  const display = value => Number.isFinite(value) ?
    value.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : '—';
  assert.equal(runtime.nodes.get('score').textContent, display(current.score));
  assert.equal(runtime.nodes.get('decision').textContent, current.valid ?
    'Điều kiện CES đạt trong nghiên cứu · cấu hình chưa có hồ sơ kích hoạt' : 'Chưa đạt điều kiện mua CES');
  console.log(JSON.stringify({ test: name, result: 'PASS', comparedWeeks: count,
    missingWeeks: [...live.values()].filter(signal => signal.score === null).length, latestScore: current.score,
    latestSignal: current.valid, autoEvaluated: simulation !== null }));
  return current;
}

function row(type, tf, p, q, weight = 20) {
  return { id: type + tf, type, tf, p, q, s: 5, limit: 25, window: 4, op: 'le',
    band: 'lower', weight, enabled: true, hard: true };
}

(async () => {
  for (const id of ['RA01', 'RA02', 'RA03', 'SMA01']) {
    const flex = normalize(library[id].flex);
    assert.deepEqual(normalize(runtime.CESAuto.lock(flex)), flex, id + ' lock is idempotent');
    await compare(id, flex, fear);
  }
  const flex = normalize(library.RA01.flex);
  flex.dynamic = [row('RSI', '1D', 14, 20), row('EMA', '1W', 5, 20),
    row('SMA', '1M', 3, 12), row('Fear', '1D', 14, 20), row('RSI/SMA', '1W', 7, 14)];
  const validData = await compare('RSI/EMA/SMA/Fear and incomplete month', flex, fear);
  assert.ok(validData.details.every(item => Number.isFinite(item.a) && Number.isFinite(item.b)));
  const missing = new Map(fear);
  missing.delete(iso(end - day));
  const withoutFear = await compare('Missing Fear & Greed', flex, missing);
  assert.equal(withoutFear.score, null);
  assert.equal(withoutFear.valid, false);

  const partial = bars.slice(2, 7 * 200);
  const early = common(partial, partial, fear, cfgFor(flex)).signals.get(start + 7 * 200 * day);
  assert.equal(runtime.MISCES.aggregate(partial, 'week').filter(week => week.n === 7).length, 199);
  assert.ok(early);
  assert.equal(early.ema200, null);
  assert.equal(early.valid, false);
  assert.throws(() => runtime.validate(partial, 'BTC'), /199 tuần/);
  const enough = bars.slice(2, 7 * 201);
  runtime.validate(enough, 'BTC');
  const cutoff = start + 7 * 201 * day;
  const ready = common(enough, enough, fear, cfgFor(flex)).signals.get(cutoff);
  const expected = runtime.MISCES.aggregate(enough, 'week')
    .filter(week => week.n === 7).reduce((sum, week) => sum + week.c, 0) / 200;
  assert.equal(ready.ema200, expected);
  console.log(JSON.stringify({ test: 'EMA200 partial first week', result: 'PASS',
    firstReadyDate: ready.date, completeWeeks: 200, ema200: ready.ema200 }));

  const subset = bars.slice(7, -7);
  const aligned = runtime.alignSignalData('ETH', subset, bars);
  assert.equal(aligned.start, subset[0].t);
  assert.equal(aligned.end, subset.at(-1).t);
  assert.deepEqual(normalize(aligned.a), normalize(subset));
  assert.equal(aligned.b[0].t, bars[0].t);
  assert.equal(aligned.b.at(-1).t, subset.at(-1).t);
  const btcWithEarlyPeak = bars.map((bar, index) =>
    index === 0 ? { ...bar, h: 1000 } : bar);
  const joined = runtime.alignSignalData('ETH', subset, btcWithEarlyPeak);
  const asOf = subset.at(-1).t + day;
  const btcSignal = common(bars, btcWithEarlyPeak, fear, cfgFor(flex)).signals.get(asOf);
  const altSignal = common(joined.a, joined.b, fear, cfgFor(flex)).signals.get(asOf);
  const truncated = common(joined.a, joined.a, fear, cfgFor(flex)).signals.get(asOf);
  assert.equal(altSignal.btcDD, btcSignal.btcDD);
  assert.equal(altSignal.ath, 1000);
  assert.notEqual(altSignal.btcDD, truncated.btcDD);
  assert.throws(() => runtime.alignSignalData('ETH', [], bars), /0 tuần/);
  assert.throws(() => runtime.alignSignalData('ETH', subset.filter((_, i) => i !== 100), bars), /thiếu ngày/);
  console.log(JSON.stringify({ test: 'Common closed-date alignment', result: 'PASS', days: aligned.a.length }));

  const flat = bars.map(bar => ({ t: bar.t, o: 100, h: 101, l: 99, c: 100 }));
  const relaxed = { ...flex, threshold: 0, btcDrawdown: 0, belowEMA200: false,
    dynamic: [row('Fear', '1D', 14, 20, 100)] };
  const locked = runtime.CESAuto.lock(relaxed);
  assert.equal(locked.btcDrawdown, 40);
  assert.equal(locked.belowEMA200, true);
  const liveGate = common(flat, flat, fear, cfgFor(relaxed)).signals.get(end);
  const autoGate = common(flat, flat, fear, cfgFor(locked)).signals.get(end);
  assert.equal(liveGate.valid, true);
  assert.equal(autoGate.valid, false);
  assert.equal(liveGate.score, autoGate.score);
  console.log(JSON.stringify({ test: 'Auto versus Live configuration policy', result: 'KNOWN_DEVIATION',
    date: liveGate.date, score: liveGate.score, marketBtcDrawdown: liveGate.btcDD,
    live: { btcDrawdown: relaxed.btcDrawdown, belowEMA200: relaxed.belowEMA200, valid: liveGate.valid },
    auto: { btcDrawdown: locked.btcDrawdown, belowEMA200: locked.belowEMA200, valid: autoGate.valid } }));
})().catch(error => { console.error(error); process.exitCode = 1; });
