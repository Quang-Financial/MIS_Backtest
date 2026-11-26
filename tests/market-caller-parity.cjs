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
const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 414, height: 896 } };
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

async function marketRoutes(context) {
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
}

async function runAuto(page, coin, inputMode) {
  await page.goto(origin + '/ces_auto.html');
  await hookSignals(page);
  await page.selectOption('#coin', coin);
  await page.selectOption('#research', 'ablation');
  await page.fill('#from', new Date(markets[coin][0].t).toISOString().slice(0, 10));
  await page.fill('#to', closedThrough);
  await page.fill('#split', '2025-07-01');
  await page.locator('#usePinned').setChecked(inputMode === 'pinned');
  await page.click('#run');
  await page.waitForFunction(() => !document.querySelector('#run').disabled);
  assert.match(await page.locator('#status').textContent(), /Hoàn tất/);
  const provenance = await page.evaluate(() => report.provenance);
  assert.equal(provenance.closedThrough, closedThrough);
  assert.equal(provenance.inputMode, inputMode);
  const signals = await page.evaluate(() => globalThis.baselineSignals);
  const fearDays = await page.evaluate(() => globalThis.baselineFearDays);
  return { provenance, signals, fearDays };
}

async function parity(browser, coin, layout, viewport) {
  const context = await browser.newContext({ viewport });
  try {
    await marketRoutes(context);
    const overview = await context.newPage();
    await overview.goto(origin + '/index.html');
    await overview.waitForFunction(() => !document.querySelector('#overview-refresh').disabled);
    await hookSignals(overview);
    await overview.selectOption('#workspace-asset', coin);
    await overview.locator('#overview-pin').click({ timeout: 20000 });
    await overview.getByText(new RegExp('Đã ghim ' + coin + ' đến')).waitFor();

    const auto = await context.newPage();
    await auto.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const { provenance, signals: autoSignals, fearDays } = await runAuto(auto, coin, 'pinned');
    assert.equal(await overview.locator('#overview-identity').getAttribute('title'),
      provenance.effectiveStrategyId + ' / ' + provenance.snapshotId);
    const overviewSignals = await overview.evaluate(() => globalThis.baselineSignals);
    assert.ok(overviewSignals.length >= 200);
    assert.deepEqual(autoSignals, overviewSignals);

    const freshContext = await browser.newContext({ viewport });
    try {
      await marketRoutes(freshContext);
      const independent = await runAuto(await freshContext.newPage(), coin, 'network');
      assert.equal(independent.provenance.snapshotId, provenance.snapshotId);
      assert.equal(independent.provenance.effectiveStrategyId, provenance.effectiveStrategyId);
      assert.deepEqual(independent.signals, overviewSignals);
      assert.deepEqual(independent.fearDays, fearDays);
    } finally {
      await freshContext.close();
    }
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
    assert.ok(fearDays.length > 0 && fearDays.every(date => date <= closedThrough));
    assert.deepEqual(await overview.evaluate(() => globalThis.baselineFearDays), fearDays);
    return { coin, layout, comparedWeeklyRows: overviewSignals.length, inputModes: ['pinned', 'network'], fearDays: fearDays.length, prefixDates: anchors.map(([time]) => new Date(time).toISOString()), closedThrough, timestamp, signal, gates,
      snapshotId: provenance.snapshotId, effectiveStrategyId: provenance.effectiveStrategyId };
  } finally {
    await context.close();
  }
}

async function legacyBookmark(browser, layout, viewport) {
  const context = await browser.newContext({ viewport });
  try {
    await marketRoutes(context);
    const setup = await context.newPage();
    await setup.goto(origin + '/index.html#indicators');
    const stored = await setup.evaluate(() => {
      const config = CESShared.load();
      CESShared.saveCommon({ ...config, btcDrawdown: 0, belowEMA200: false, threshold: 0 });
      localStorage.setItem('mis-ces-dynamic-v150', JSON.stringify([
        { id: 'test-fear', type: 'Fear', tf: '1D', enabled: true, hard: false,
          p: 14, q: 20, s: 5, window: 1, op: 'le', limit: 100, weight: 100 }
      ]));
      return CESShared.load();
    });

    const page = await context.newPage();
    const oldURL = origin + '/ces_monitor.html?v=1661&coin=okb&belowEMA200=false&btcDrawdown=0';
    await page.goto(oldURL);
    await page.waitForURL(origin + '/index.html?asset=okb#overview');
    async function checkOverview() {
      await page.getByText('Đã cập nhật dữ liệu xác nhận.', { exact: true }).waitFor();
      assert.equal(await page.locator('#workspace-asset').inputValue(), 'OKB');
      assert.match(await page.locator('#overview-asof').textContent(), /2026-11-23/);
      assert.equal(await page.locator('#overview-score').textContent(), '100 / 100');
      assert.equal(await page.locator('#overview-gate-ema').textContent(), 'Chưa đạt');
      assert.equal(await page.locator('#overview-gate-dd').textContent(), 'Đạt · ≥ 40%');
      assert.equal(await page.locator('#overview-eligibility').textContent(), 'Điều kiện nghiên cứu chưa đạt');
      assert.doesNotMatch(await page.locator('#overview-decision').textContent(), /BUY READY/);
      assert.deepEqual(await page.evaluate(() => CESShared.load()), stored);
    }
    await checkOverview();
    const actualSnapshot = await page.locator('#overview-identity').getAttribute('title');
    await page.reload();
    await checkOverview();
    assert.equal(await page.locator('#overview-identity').getAttribute('title'), actualSnapshot);

    await page.goto(origin + '/ces_monitor.html?asset=not-supported');
    await page.waitForURL(origin + '/index.html?asset=not-supported#overview');
    assert.equal(await page.locator('#workspace-asset').inputValue(), 'BTC');
    return { layout, coin: 'OKB', date: '2026-11-23', score: 100, emaGate: 'Chưa đạt',
      eligible: false, bookmarkAndReload: 'PASS', unsupportedAsset: 'BTC', storedConfigPreserved: true };
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch();
  try {
    const results = [];
    const legacyBookmarks = [];
    for (const [layout, viewport] of Object.entries(viewports)) {
      for (const coin of coins) results.push(await parity(browser, coin, layout, viewport));
      legacyBookmarks.push(await legacyBookmark(browser, layout, viewport));
    }
    console.log(JSON.stringify({ hashes, results, legacyBookmarks }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
