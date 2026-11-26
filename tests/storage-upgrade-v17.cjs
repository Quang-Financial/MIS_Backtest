const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { createServer } = require('node:http');
const { resolve, extname, sep } = require('node:path');
const { chromium } = require('playwright');

const [previousDirectory, nextDirectory] = process.argv.slice(2);
assert.ok(previousDirectory && nextDirectory, 'Pass the V1.6.7 and V1.7 checkout directories');
const previous = resolve(previousDirectory);
const next = resolve(nextDirectory);
const oldCache = 'mis-shell-ces13-optimizer-v1670';
const newCache = 'mis-shell-workspace-v170-overview-bookmarks';
const contentTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

async function audit(browser, viewport) {
  let root = previous;
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    try {
      if (!file.startsWith(root + sep)) throw Error('Path outside test checkout');
      const body = await readFile(file);
      response.writeHead(200, { 'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store' });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(0, '127.0.0.1', ok);
  });
  const origin = 'http://127.0.0.1:' + server.address().port;
  const context = await browser.newContext({ viewport });
  const fixtures = {
    auto: { coin: 'OKB', selected: [], all: [], provenance: { schema: 2, runId: 'v167-synthetic-auto' } },
    historical: { coin: 'OKB', rows: [], runId: 'v167-synthetic-historical' },
    source: { source: 'fixture', bars: [{ t: Date.UTC(2025, 0, 1), o: 10, h: 11, l: 9, c: 10 }] },
    config: { btcDrawdown: 41, threshold: 66, belowEMA200: true }
  };
  try {
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto(origin + '/index.html');
    await page.waitForFunction(async cache => {
      const registration = await navigator.serviceWorker.getRegistration();
      return Boolean(registration?.active) && (await caches.keys()).includes(cache);
    }, oldCache);

    await page.goto(origin + '/ces_auto.html');
    await page.evaluate(async ({ auto, config }) => {
      await autoStore(auto);
      CESShared.saveCommon(config);
    }, fixtures);
    await page.goto(origin + '/ces_history.html');
    await page.evaluate(value => historyStore(value), fixtures.historical);
    await page.goto(origin + '/mis_datahub.html');
    await page.evaluate(value => MISDataHub.store('imported', value), fixtures.source);

    root = next;
    await page.goto(origin + '/index.html#indicators');
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration.update();
    });
    await page.waitForFunction(async cache => {
      const registration = await navigator.serviceWorker.getRegistration();
      return Boolean(registration?.waiting) || !(await caches.keys()).includes(cache);
    }, oldCache);
    await page.evaluate(async () => {
      (await navigator.serviceWorker.getRegistration()).waiting?.postMessage('MIS_ACTIVATE');
    });
    await page.waitForFunction(async ({ oldCache, newCache }) => {
      const keys = await caches.keys();
      return keys.includes(newCache) && !keys.includes(oldCache);
    }, { oldCache, newCache });

    await page.goto(origin + '/ces_auto.html');
    assert.deepEqual(await page.evaluate(() => autoStore()), fixtures.auto);
    assert.deepEqual(await page.evaluate(() => CESShared.common()), fixtures.config);
    await page.goto(origin + '/ces_history.html');
    assert.deepEqual(await page.evaluate(() => historyStore()), fixtures.historical);
    await page.goto(origin + '/mis_datahub.html');
    assert.deepEqual(await page.evaluate(() => MISDataHub.store('imported')), fixtures.source);

    await context.setOffline(true);
    await page.goto(origin + '/ces_monitor.html?coin=OKB');
    await page.waitForURL(origin + '/index.html?asset=OKB#overview');
    assert.equal(await page.locator('#workspace-asset').inputValue(), 'OKB');
    assert.equal(await page.locator('#workspace-title').textContent(), 'Tổng quan OKB');
    assert.deepEqual(await page.evaluate(() => CESShared.common()), fixtures.config);
    return { viewport, cacheTransition: 'PASS', storedConfig: 'PASS', autoReport: 'PASS',
      historicalReport: 'PASS', dataHubImport: 'PASS', offlineLegacyBookmark: 'PASS' };
  } finally {
    await context.close();
    await new Promise(ok => server.close(ok));
  }
}

(async () => {
  const browser = await chromium.launch();
  try {
    const results = [];
    for (const viewport of [{ width: 1440, height: 900 }, { width: 414, height: 896 }]) {
      results.push(await audit(browser, viewport));
    }
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
