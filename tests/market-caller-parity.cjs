const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { chromium } = require('playwright');

const [directory, btcPath, fearPath] = process.argv.slice(2);
assert.ok(directory && btcPath && fearPath, 'Pass the candle directory, BTC fixture, and Fear & Greed fixture');
const closedThrough = '2026-11-24';
const end = Date.parse(closedThrough);
const day = 86400000;
const now = end + day + 12 * 3600000;
const origin = 'http://127.0.0.1:8765';
const coins = ['SOL', 'AVAX', 'LINK', 'OKB', 'BNB'];
const hashes = {};
function load(path, key) {
  const bytes = readFileSync(path);
  hashes[key] = createHash('sha256').update(bytes).digest('hex');
  return JSON.parse(bytes);
}
const btc = load(btcPath, 'BTC').bars.filter(bar => bar.t <= end);
const markets = Object.fromEntries(coins.map(coin => [coin, load(join(directory, coin + '.json'), coin).bars]));
const fear = load(fearPath, 'fear').data;
assert.ok(fear.some(row => Number(row.timestamp) * 1000 >= end - 7 * day));

async function hookSignals(page) {
  await page.evaluate(() => {
    const original = CESDynamic.signals;
    CESDynamic.signals = (...args) => {
      const result = original(...args);
      globalThis.baselineSignals ??= [...result.signals];
      globalThis.baselineFearDays ??= [...args[2].keys()];
      return result;
    };
  });
}

async function parity(browser, coin) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  try {
    await context.addInitScript(value => { Date.now = () => value; }, now);
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin === origin) {
        if (url.pathname === '/btc_bitstamp_preokx.json') {
          return route.fulfill({ json: { bars: btc.map(({ t, o, h, l, c }) => [t, o, h, l, c]) } });
        }
        return route.continue();
      }
      if (url.hostname === 'api.alternative.me' && url.pathname === '/fng/') {
        return route.fulfill({ json: { data: fear } });
      }
      if (url.hostname === 'www.okx.com' && url.pathname.endsWith('/history-candles')) {
        const ticker = url.searchParams.get('instId')?.split('-')[0];
        const cursor = Number(url.searchParams.get('after')) || Infinity;
        const rows = (markets[ticker] ?? []).filter(bar => bar.t < cursor)
          .slice(-100).reverse().map(bar => [bar.t, bar.o, bar.h, bar.l, bar.c, 0, 0, 0, 1].map(String));
        return route.fulfill({ json: { code: '0', data: rows } });
      }
      return route.abort();
    });
    const overview = await context.newPage();
    await overview.goto(origin + '/index.html');
    await overview.waitForFunction(() => !document.querySelector('#overview-refresh').disabled);
    await hookSignals(overview);
    await overview.selectOption('#workspace-asset', coin);
    await overview.locator('#overview-pin').click({ timeout: 20000 });
    await overview.getByText(new RegExp('Đã ghim ' + coin + ' đến')).waitFor();

    const auto = await context.newPage();
    await auto.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    await auto.goto(origin + '/ces_auto.html');
    await hookSignals(auto);
    await auto.selectOption('#coin', coin);
    await auto.selectOption('#research', 'ablation');
    await auto.fill('#from', new Date(markets[coin][0].t).toISOString().slice(0, 10));
    await auto.fill('#to', closedThrough);
    await auto.fill('#split', '2025-07-01');
    await auto.locator('#usePinned').check();
    await auto.click('#run');
    await auto.waitForFunction(() => !document.querySelector('#run').disabled);
    assert.match(await auto.locator('#status').textContent(), /Hoàn tất/);
    const provenance = await auto.evaluate(() => report.provenance);
    assert.equal(provenance.closedThrough, closedThrough);
    assert.equal(provenance.inputMode, 'pinned');
    assert.equal(await overview.locator('#overview-identity').getAttribute('title'),
      provenance.effectiveStrategyId + ' / ' + provenance.snapshotId);
    const overviewSignals = await overview.evaluate(() => globalThis.baselineSignals);
    const autoSignals = await auto.evaluate(() => globalThis.baselineSignals);
    assert.ok(overviewSignals.length >= 200);
    assert.deepEqual(autoSignals, overviewSignals);
    const [timestamp, signal] = overviewSignals.filter(([t]) => t <= end + day).at(-1);
    const anchoredSignals = overviewSignals.filter(([time, row]) => time <= timestamp && Number.isFinite(row.ema200));
    const anchors = [anchoredSignals[0], anchoredSignals[Math.floor(anchoredSignals.length / 2)], anchoredSignals.at(-1)];
    const prefixSignals = await overview.evaluate(async ({ coin, dates }) => {
      const snapshot = await pinnedResearchSnapshot(coin);
      const flex = CESAuto.lock(CESShared.load());
      return dates.map(date => {
        const earlier = bars => bars.filter(bar => bar.t < date);
        const fear = new Map([...snapshot.fear].filter(([day]) => day < MISCES.iso(date)));
        return CESDynamic.signals(earlier(snapshot.a), earlier(snapshot.b), fear, { flex, threshold: flex.threshold })
          .signals.get(date);
      });
    }, { coin, dates: anchors.map(([time]) => time) });
    assert.deepEqual(prefixSignals, anchors.map(([, row]) => row));
    const display = await overview.locator('#overview-score').textContent();
    assert.ok(Math.abs(Number(display.split('/')[0].trim().replace(',', '.')) - signal.score) < 0.00501);
    const { base } = provenance;
    const gates = {
      drawdown: signal.btcDD <= -base.btcDrawdown,
      ema200: signal.close < signal.ema200,
      score: signal.score >= base.threshold
    };
    const gateLabel = passed => passed ? 'Đạt' : 'Chưa đạt';
    assert.equal(await overview.locator('#overview-gate-dd').textContent(), gateLabel(gates.drawdown) + ' · ≥ ' + base.btcDrawdown + '%');
    assert.equal(await overview.locator('#overview-gate-ema').textContent(), gateLabel(gates.ema200));
    assert.equal(await overview.locator('#overview-gate-score').textContent(), gateLabel(gates.score) + ' · ≥ ' + base.threshold);
    assert.equal(await overview.locator('#overview-eligibility').textContent(),
      signal.valid ? 'Điều kiện nghiên cứu đạt' : 'Điều kiện nghiên cứu chưa đạt');
    const fearDays = await auto.evaluate(() => globalThis.baselineFearDays);
    assert.ok(fearDays.length > 0 && fearDays.every(date => date <= closedThrough));
    assert.deepEqual(await overview.evaluate(() => globalThis.baselineFearDays), fearDays);
    return { coin, comparedWeeklyRows: overviewSignals.length, fearDays: fearDays.length, prefixDates: anchors.map(([time]) => new Date(time).toISOString()), closedThrough, timestamp, signal, gates,
      snapshotId: provenance.snapshotId, effectiveStrategyId: provenance.effectiveStrategyId };
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch();
  try {
    const results = [];
    for (const coin of coins) results.push(await parity(browser, coin));
    console.log(JSON.stringify({ hashes, results }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
