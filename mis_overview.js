'use strict';

// Existing OHLC and Fear loaders report progress through this callback.
function status(message) {
  document.getElementById('overview-status').textContent = message;
}

const MISOverview = (() => {
  const at = id => document.getElementById('overview-' + id);
  const dayMs = 86400000;
  const boundaries = [40, 45, 50, 55, 60, 70];
  const format = value => Number.isFinite(value)
    ? value.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) : '—';
  const date = value => Number.isFinite(value) ? new Date(value).toISOString().slice(0, 10) : '—';
  const utc = value => Number.isFinite(value) ? new Date(value).toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : '—';
  let asset;
  let pendingAsset;
  let series = [];
  let zoneIndex = null;
  let emaLine = null;
  let zoneBand = null;

  function draw() {
    const canvas = at('chart');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    if (series.length < 2) return;
    const pad = 16;
    const right = 58;
    const values = series.map(row => row.c);
    if (Number.isFinite(emaLine)) values.push(emaLine);
    const low = Math.min(...values);
    const range = Math.max(...values) - low || 1;
    const x = i => pad + i * (width - pad - right) / (series.length - 1);
    const y = value => height - pad - (value - low) * (height - 2 * pad) / range;
    if (zoneBand) {
      const top = Math.max(pad, y(zoneBand.high));
      const bottom = Math.min(height - pad, y(zoneBand.low));
      if (bottom > top) {
        ctx.fillStyle = '#e3f1ed';
        ctx.fillRect(pad, top, width - pad - right, bottom - top);
      }
    }
    ctx.strokeStyle = '#dfe8ea';
    for (const fraction of [0.25, 0.5, 0.75]) {
      ctx.beginPath();
      ctx.moveTo(pad, height * fraction);
      ctx.lineTo(width - right, height * fraction);
      ctx.fillStyle = '#475e68';
      ctx.font = '11px system-ui';
      ctx.fillText(format(low + (height - pad - height * fraction) * range / (height - 2 * pad)), width - right + 4, height * fraction);
      ctx.stroke();
    }
    ctx.beginPath();
    series.forEach(({c}, i) => i ? ctx.lineTo(x(i), y(c)) : ctx.moveTo(x(i), y(c)));
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#11705b';
    ctx.stroke();
    if (Number.isFinite(emaLine)) {
      ctx.beginPath();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#996016';
      ctx.moveTo(pad, y(emaLine));
      ctx.lineTo(width - right, y(emaLine));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#75470d';
      ctx.fillText('EMA200W', pad, Math.max(12, y(emaLine) - 4));
    }
  }

  function showChart(bars) {
    series = bars.slice(-180);
    at('chart-empty').hidden = series.length >= 2;
    at('chart-range').textContent = series.length >= 2
      ? date(series[0].t) + ' → ' + date(series.at(-1).t) + ' · UTC · ' + format(series.at(-1).c)
      : 'Chưa đủ nến ngày đã đóng.';
    draw();
  }

  function zoneFor(bars) {
    const peak = bars.reduce((max, row) => Math.max(max, row.h), 0);
    if (!peak || !bars.length) return;
    const dd = 100 * (1 - bars.at(-1).c / peak);
    const index = boundaries.filter(boundary => dd >= boundary).length;
    zoneIndex = index;
    zoneBand = { low: peak * .45, high: peak * .50 };
    draw();
    document.querySelectorAll('.overview-zones li').forEach((item, i) => {
      if (i === index) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });
    at('zone').textContent = asset + ' giảm ' + format(dd) + '% · Z' + index +
      ' · Giá đóng ngày ' + date(bars.at(-1).t) + ' so với đỉnh giá cao trong chuỗi tài sản; khác BTC gate theo tuần.';
  }

  function renderSignal(time, signal, flex, end, adjusted) {
    const dd = Number.isFinite(signal.btcDD);
    const ema = Number.isFinite(signal.ema200) && signal.ema200 > 0 && Number.isFinite(signal.close);
    const score = Number.isFinite(signal.score);
    const stale = Date.now() - end > 3 * dayMs || Date.now() - time > 8 * dayMs;
    at('asof').textContent = 'As-of dữ liệu: ' + utc(end + dayMs) + ' · Nến tuần xác nhận: ' + utc(time);
    at('approval').textContent = 'Chiến lược: Chưa có hồ sơ kích hoạt được phê duyệt' +
      (adjusted ? ' · Cấu hình lưu khác khóa nghiên cứu Auto.' : '');
    emaLine = ema ? signal.ema200 : null;
    draw();
    at('dd').textContent = dd ? format(signal.btcDD) + '%' : '—';
    at('ema').textContent = ema ? format(100 * (signal.close / signal.ema200 - 1)) + '%' : '—';
    at('score').textContent = format(signal.score) + ' / 100';
    at('gap').textContent = 'Còn thiếu điểm: ' + (score ? format(Math.max(0, flex.threshold - signal.score)) : '—');
    const gate = (known, passes) => known ? (passes ? 'Đạt' : 'Chưa đạt') : 'Thiếu dữ liệu';
    at('gate-dd').textContent = gate(dd, signal.btcDD <= -flex.btcDrawdown) + ' · ≥ ' + flex.btcDrawdown + '%';
    at('gate-ema').textContent = flex.belowEMA200 ? gate(ema, signal.close < signal.ema200) : 'Bộ lọc tắt';
    at('gate-score').textContent = gate(score, signal.score >= flex.threshold) + ' · ≥ ' + flex.threshold;
    status(stale ? 'Dữ liệu nến đã cũ.' : score ? 'Đã cập nhật dữ liệu xác nhận.' : 'Thiếu dữ liệu chỉ báo.');
    const hardPass = signal.btcDD <= -flex.btcDrawdown && signal.close < signal.ema200 &&
      signal.details.every(item => !item.enabled || !item.hard || item.pass);
    at('eligibility').textContent = stale || !score || !dd || !ema ? 'Chưa đủ dữ liệu mới'
      : signal.valid ? 'Điều kiện nghiên cứu đạt' : 'Điều kiện nghiên cứu chưa đạt';
    at('decision').textContent = stale ? 'RISK ALERT · Dữ liệu nến đã cũ.'
      : !score || !dd || !ema ? 'RISK ALERT · Thiếu dữ liệu xác nhận.'
      : signal.valid ? 'WATCH · Điều kiện nghiên cứu đạt, chờ cấu hình được phê duyệt.'
      : hardPass && zoneIndex >= 1 ? 'WATCH · Vùng giả thuyết, điểm CES chưa đạt.'
      : 'WAIT · Điều kiện CES chưa đạt.';
  }

  async function loadPrice(coin) {
    try {
      const query = new URLSearchParams({ instId: coin + '-USDT' });
      const response = await fetch('https://www.okx.com/api/v5/market/ticker?' + query,
        { signal: AbortSignal.timeout(10000), cache: 'no-store' });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload.code !== '0') return;
      const row = payload.data?.[0];
      const price = Number(row?.last);
      const time = Number(row?.ts);
      if (coin === asset && price > 0 && Number.isFinite(time) && time > 0 && time <= Date.now() &&
          Date.now() - time <= 15 * 60000) {
        at('price').textContent = format(price) + ' USDT';
        at('price-time').textContent = 'OKX · ' + utc(time);
      }
    } catch {}
  }

  async function refresh() {
    if (pendingAsset) return;
    const coin = asset;
    if (!coin) return;
    pendingAsset = coin;
    at('refresh').disabled = true;
    reset();
    status('Đang kiểm tra dữ liệu.');
    await Promise.allSettled([loadPrice(coin), (async () => {
      try {
        const bars = await fullDaily(coin);
        if (asset !== coin) return;
        const btc = coin === 'BTC' ? bars : await fullDaily('BTC');
        const observations = await fearDaily().catch(() => new Map());
        if (asset !== coin) return;
        const { a, b, end, fear, snapshotId } = await researchSnapshot(coin, bars, btc, observations);
        const saved = CESShared.load();
        const flex = CESAuto.lock(saved);
        const adjusted = saved.btcDrawdown !== flex.btcDrawdown || saved.belowEMA200 !== flex.belowEMA200;
        const signals = CESDynamic.signals(a, b, fear, { flex, threshold: flex.threshold }).signals;
        const entry = [...signals].filter(([time]) => time <= end + dayMs && time <= Date.now()).at(-1);
        if (!entry) throw Error('Chưa có tuần xác nhận');
        const strategyId = await researchHash(flex);
        if (asset !== coin) return;
        showChart(a);
        zoneFor(a);
        renderSignal(...entry, flex, end, adjusted);
        at('identity').textContent = 'Cấu hình ' + strategyId.slice(0, 12) + ' · Snapshot ' + snapshotId.slice(0, 12);
        at('identity').title = strategyId + ' / ' + snapshotId;
      } catch (error) {
        if (asset !== coin) return;
        reset();
        status('Không thể xác nhận: ' + error.message);
        at('decision').textContent = 'RISK ALERT · Chờ dữ liệu hoặc cấu hình hợp lệ.';
      }
    })()]);
    pendingAsset = null;
    at('refresh').disabled = false;
    if (asset !== coin) refresh();
  }

  function reset() {
    at('identity').textContent = 'Cấu hình và snapshot: chờ dữ liệu';
    at('identity').removeAttribute('title');
    emaLine = null;
    zoneIndex = null;
    zoneBand = null;
    at('eligibility').textContent = 'Chờ dữ liệu';
    at('approval').textContent = 'Chiến lược: Chưa có hồ sơ kích hoạt được phê duyệt';
    at('ema-label').textContent = 'Khoảng cách ' + asset + ' / EMA200W';
    for (const field of ['dd', 'ema']) at(field).textContent = '—';
    for (const field of ['gate-dd', 'gate-ema', 'gate-score']) at(field).textContent = 'Chờ dữ liệu';
    at('price').textContent = 'Chưa có dữ liệu';
    at('price-time').textContent = '—';
    at('score').textContent = '— / 100';
    at('gap').textContent = 'Còn thiếu điểm: —';
    at('asof').textContent = 'As-of: — · Nến xác nhận: —';
    at('zone').textContent = 'Chưa có drawdown của tài sản.';
    document.querySelectorAll('.overview-zones li').forEach(item => item.removeAttribute('aria-current'));
    at('decision').textContent = 'WAIT · Chờ dữ liệu đã xác nhận.';
    showChart([]);
  }

  function select(coin) {
    if (asset === coin) { draw(); return; }
    asset = coin;
    reset();
    refresh();
  }

  new ResizeObserver(draw).observe(at('chart'));
  at('refresh').addEventListener('click', refresh);
  return { select };
})();
