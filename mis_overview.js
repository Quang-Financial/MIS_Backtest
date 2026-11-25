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
    const values = series.map(row => row.c);
    const low = Math.min(...values);
    const range = Math.max(...values) - low || 1;
    const x = i => pad + i * (width - 2 * pad) / (values.length - 1);
    const y = value => height - pad - (value - low) * (height - 2 * pad) / range;
    ctx.strokeStyle = '#dfe8ea';
    for (const fraction of [0.25, 0.5, 0.75]) {
      ctx.beginPath();
      ctx.moveTo(pad, height * fraction);
      ctx.lineTo(width - pad, height * fraction);
      ctx.stroke();
    }
    ctx.beginPath();
    values.forEach((value, i) => i ? ctx.lineTo(x(i), y(value)) : ctx.moveTo(x(i), y(value)));
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#11705b';
    ctx.stroke();
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
    document.querySelectorAll('.overview-zones li').forEach((item, i) => {
      if (i === index) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });
    at('zone').textContent = asset + ' giảm ' + format(dd) + '% từ đỉnh trong dữ liệu · Z' + index;
  }

  function renderSignal(time, signal, flex, end) {
    const dd = Number.isFinite(signal.btcDD);
    const ema = Number.isFinite(signal.ema200) && signal.ema200 > 0 && Number.isFinite(signal.close);
    const score = Number.isFinite(signal.score);
    const stale = Date.now() - end > 3 * dayMs || Date.now() - time > 8 * dayMs;
    at('asof').textContent = 'As-of dữ liệu: ' + utc(end + dayMs) + ' · Nến tuần xác nhận: ' + utc(time);
    at('dd').textContent = dd ? format(signal.btcDD) + '%' : '—';
    at('ema').textContent = ema ? format(100 * (signal.close / signal.ema200 - 1)) + '%' : '—';
    at('score').textContent = format(signal.score) + ' / 100';
    at('gap').textContent = 'Còn thiếu điểm: ' + (score ? format(Math.max(0, flex.threshold - signal.score)) : '—');
    const gate = (known, passes) => known ? (passes ? 'Đạt' : 'Chưa đạt') : 'Thiếu dữ liệu';
    at('gate-dd').textContent = gate(dd, signal.btcDD <= -flex.btcDrawdown) + ' · ≥ ' + flex.btcDrawdown + '%';
    at('gate-ema').textContent = flex.belowEMA200 ? gate(ema, signal.close < signal.ema200) : 'Bộ lọc tắt';
    at('gate-score').textContent = gate(score, signal.score >= flex.threshold) + ' · ≥ ' + flex.threshold;
    status(stale ? 'Dữ liệu nến đã cũ.' : score ? 'Đã cập nhật dữ liệu xác nhận.' : 'Thiếu dữ liệu chỉ báo.');
    at('decision').textContent = stale ? 'RISK ALERT · Dữ liệu nến đã cũ.'
      : !score || !dd || !ema ? 'RISK ALERT · Thiếu dữ liệu xác nhận.'
      : signal.valid ? 'WATCH · Điều kiện nghiên cứu đạt, chờ cấu hình được phê duyệt.'
      : 'WAIT · Điều kiện CES chưa đạt hoặc cấu hình chưa đủ điều kiện.';
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
    at('price').textContent = 'Chưa có dữ liệu';
    at('price-time').textContent = '—';
    at('decision').textContent = 'WAIT · Đang kiểm tra dữ liệu.';
    await Promise.allSettled([loadPrice(coin), (async () => {
      try {
        const bars = await fullDaily(coin);
        if (asset !== coin) return;
        showChart(bars);
        zoneFor(bars);
        const btc = coin === 'BTC' ? bars : await fullDaily('BTC');
        const fear = await fearDaily().catch(() => new Map());
        if (asset !== coin) return;
        const { a, b, end } = alignSignalData(coin, bars, btc);
        const flex = CESShared.load();
        const signals = CESDynamic.signals(a, b, fear, { flex, threshold: flex.threshold }).signals;
        const entry = [...signals].filter(([time]) => time <= end + dayMs && time <= Date.now()).at(-1);
        if (!entry) throw Error('Chưa có tuần xác nhận');
        renderSignal(...entry, flex, end);
      } catch (error) {
        if (asset !== coin) return;
        status('Không thể xác nhận: ' + error.message);
        at('decision').textContent = 'RISK ALERT · Chờ dữ liệu hoặc cấu hình hợp lệ.';
      }
    })()]);
    pendingAsset = null;
    at('refresh').disabled = false;
    if (asset !== coin) refresh();
  }

  function select(coin) {
    if (asset === coin) { draw(); return; }
    asset = coin;
    at('ema-label').textContent = 'Khoảng cách ' + coin + ' / EMA200W';
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
    refresh();
  }

  new ResizeObserver(draw).observe(at('chart'));
  at('refresh').addEventListener('click', refresh);
  return { select };
})();
