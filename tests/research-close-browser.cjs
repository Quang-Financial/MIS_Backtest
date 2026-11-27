const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const baseUrl = process.env.MIS_TEST_URL || 'http://127.0.0.1:18735/';
(async () => {
  const binary = process.env.MIS_PACKAGED_CHROMIUM ? require('@sparticuz/chromium') : null;
  const browser = await chromium.launch(binary ? {
    executablePath: await binary.executablePath(), args: binary.args,
  } : {});
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(baseUrl).origin
    ? route.continue() : route.abort());
  try {
    await page.goto(baseUrl + '#research');
    const glossary = page.locator('#research-glossary');
    const summary = glossary.locator('summary');
    assert.equal(await summary.locator('.disclosure-mark').textContent(), '*');
    await summary.focus();
    await page.keyboard.press('Enter');
    assert.equal(await glossary.getAttribute('open'), '');
    await page.locator('#glossary-search').fill('do lech chuan');
    assert.deepEqual(await glossary.locator('dt:visible').allTextContents(), ['Sharpe']);
    await page.locator('#glossary-search').fill('abcdef');
    assert.match(await page.locator('#glossary-count').textContent(), /Không tìm thấy/);
    await page.locator('#glossary-search').fill('');
    assert.equal(await glossary.locator('dt:visible').count(), 18);
    await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    for (const size of [192, 512]) {
      assert.deepEqual(await page.evaluate(async size => {
        const image = new Image();
        image.src = './icon-' + size + '.png';
        await image.decode();
        return [image.naturalWidth, image.naturalHeight];
      }, size), [size, size]);
    }
    const cdp = await context.newCDPSession(page);
    const manifest = await cdp.send('Page.getAppManifest');
    assert.equal(manifest.errors.filter(error => error.critical).length, 0);
    const installability = await cdp.send('Page.getInstallabilityErrors');
    assert.deepEqual(installability.installabilityErrors, []);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await summary.click();
    assert.equal(await glossary.locator('dt:visible').count(), 18);
    await page.goto(baseUrl + '#overview', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => /^(WAIT|RISK ALERT)/.test(
      document.querySelector('#overview-decision')?.textContent ?? ''));
    assert.equal(await page.locator('#overview-pin').isDisabled(), true);
    assert.deepEqual(errors, []);
    console.log('PASS Chromium: glossary keyboard, accent-insensitive search, empty state, manifest, installability checks, SW and offline glossary');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
