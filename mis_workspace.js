'use strict';

const screens = {
  overview: { title: 'Tổng quan', description: 'Thị trường hiện tại, điều kiện vùng mua và tín hiệu theo nến đã đóng.',
    tools: {} },
  indicators: { title: 'Bộ chỉ báo', description: 'Cấu hình đang dùng và các cấu hình đối chứng nghiên cứu.', tools: {} },
  research: { title: 'Research', description: 'Đối chiếu kết quả lịch sử và các giai đoạn thị trường.',
    tools: { 'Historical Research': 'ces_history.html' } },
  backtest: { title: 'Backtest', description: 'Tìm kiếm, so sánh và kiểm thử cấu hình CES.',
    tools: { 'Optimizer': 'ces_optimizer.html', 'Auto Backtest': 'ces_auto.html' } },
  data: { title: 'Data Hub', description: 'Kiểm tra chất lượng, cập nhật và nhập xuất dữ liệu lịch sử.',
    tools: { 'Data Hub': 'mis_datahub.html' } },
};
const routes = Object.entries(screens).flatMap(([screen, config]) =>
  Object.entries(config.tools).map(([label, file]) => ({ screen, label, file })));
const overview = document.querySelector('#workspace-overview');
const nav = document.querySelector('#workspace-nav');
const tools = document.querySelector('#workspace-tools');
const frames = document.querySelector('#workspace-frames');
const library = document.querySelector('#workspace-library');
const asset = document.querySelector('#workspace-asset');
const views = new Map();
const chosenTool = new Map();
let activeScreen = 'overview';

function syncAsset(doc) {
  const select = doc?.getElementById('coin');
  if (!select || select.value === asset.value || !Array.from(select.options).some(option => option.value === asset.value)) return;
  select.value = asset.value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

function renderLibrary() {
  const config = document.querySelector('#workspace-config');
  try {
    const flex = CESShared.load();
    config.textContent = 'CES ≥ ' + flex.threshold + ' · BTC giảm ≥ ' + flex.btcDrawdown + '% · ' +
      (flex.belowEMA200 ? 'Yêu cầu dưới EMA200 tuần' : 'Bộ lọc EMA200 đã tắt') + ' · ' +
      flex.dynamic.filter(row => row.enabled).map(CESDynamic.name).join(', ');
  } catch (error) {
    config.textContent = 'Không đọc được cấu hình: ' + error.message;
  }
  const cards = ['RA01', 'RA02', 'RA03', 'SMA01'].map(id => {
    const candidate = CESLibrary[id];
    const card = document.createElement('article');
    const title = document.createElement('strong');
    title.textContent = id + ' · ' + candidate.coin + ' CES-' + candidate.mode;
    const details = document.createElement('p');
    details.textContent = 'BTC giảm ≥ ' + candidate.flex.btcDrawdown + '% · CES ≥ ' + candidate.flex.threshold +
      ' · ' + candidate.flex.dynamic.filter(row => row.enabled).map(CESDynamic.name).join(', ');
    card.append(title, details);
    return card;
  });
  document.querySelector('#workspace-candidates').replaceChildren(...cards);
}

function openScreen(id, file) {
  if (!Object.hasOwn(screens, id)) id = 'overview';
  if (file && id !== 'overview') chosenTool.set(id, file);
  if (activeScreen !== id || location.hash !== '#' + id) {
    history.pushState(null, '', '#' + id);
  }
  render(id);
}

function frameFor(route, container = frames) {
  if (views.has(route.file)) return views.get(route.file);
  const frame = document.createElement('iframe');
  frame.title = route.label;
  frame.addEventListener('load', () => {
    const doc = frame.contentDocument;
    if (!doc) return;
    const embedStyle = doc.createElement('style');
    embedStyle.textContent = 'html,body { overflow-y:hidden !important; min-height:0 !important; }' +
      'nav, body > header, [hidden] { display:none !important; }';
    const coinControl = doc.getElementById('coin');
    const coinLabel = coinControl?.closest('label') ?? coinControl?.closest('.coin-picker') ?? coinControl;
    if (coinLabel) coinLabel.hidden = true;
    for (const link of doc.querySelectorAll('a[href]')) {
      const url = new URL(link.href);
      const file = url.pathname.split('/').at(-1);
      if (url.origin === location.origin && ['index.html','ces_monitor.html', ...routes.map(item => item.file)].includes(file)) {
        link.hidden = true;
      }
    }
    const resize = () => {
      if (!doc.body || frame.hidden || !frame.getClientRects().length) return;
      const height = Math.ceil(doc.body.getBoundingClientRect().bottom + (parseFloat(doc.defaultView.getComputedStyle(doc.body).marginBottom) || 0));
      if (height && frame.height !== String(height)) frame.height = height;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(doc.body);
    frame.addEventListener('load', () => {
      observer.disconnect();
      frame.removeEventListener('workspace-visible', resize);
    }, { once: true });
    resize();
    frame.addEventListener('workspace-visible', resize);
    doc.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin) return;
      const file = url.pathname.split('/').at(-1);
      const next = routes.find(item => item.file === file);
      if (file === 'ces_monitor.html') { event.preventDefault(); openScreen('overview'); return; }
      if (next || file === 'index.html') {
        event.preventDefault();
        openScreen(next?.screen ?? 'overview', next?.file);
      }
    });
    doc.addEventListener('change', event => {
      if (event.target.id === 'coin' && Array.from(asset.options).some(option => option.value === event.target.value)) {
        asset.value = event.target.value;
      }
    });
    syncAsset(doc);
  });
  frame.src = route.file;
  views.set(route.file, frame);
  container.append(frame);
  return frame;
}

function render(requested) {
  activeScreen = Object.hasOwn(screens, requested) ? requested : 'overview';
  const screen = screens[activeScreen];
  const available = routes.filter(route => route.screen === activeScreen);
  const selected = available.find(route => route.file === chosenTool.get(activeScreen)) ?? available[0];
  document.querySelector('#workspace-title').textContent = screen.title + (activeScreen === 'overview' ? ' ' + asset.value : '');
  document.querySelector('#workspace-description').textContent = screen.description;
  for (const link of nav.querySelectorAll('a')) {
    if (link.hash === '#' + activeScreen) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  overview.hidden = activeScreen !== 'overview';
  if (!overview.hidden) MISOverview.select(asset.value);
  library.hidden = activeScreen !== 'indicators';
  if (!library.hidden) renderLibrary();
  tools.replaceChildren(...available.map(route => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = route.label;
    button.setAttribute('aria-pressed', String(route === selected));
    button.onclick = () => openScreen(activeScreen, route.file);
    return button;
  }));
  const frame = selected ? frameFor(selected) : null;
  for (const view of views.values()) view.hidden = view !== frame;
  if (frame) {
    syncAsset(frame.contentDocument);
    frame.dispatchEvent(new Event('workspace-visible'));
  }
}

asset.addEventListener('change', () => {
  if (activeScreen === 'overview') render('overview');
  for (const frame of views.values()) if (!frame.hidden) syncAsset(frame.contentDocument);
});
window.addEventListener('hashchange', () => render(location.hash.slice(1)));
window.addEventListener('popstate', () => render(location.hash.slice(1)));
render(location.hash.slice(1));
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(console.error);
