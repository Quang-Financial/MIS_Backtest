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
const research = document.querySelector('#workspace-research');
const historyPanel = document.querySelector('#workspace-history');
const data = document.querySelector('#workspace-data');
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
  const get = suffix => document.querySelector('#workspace-' + suffix);
  const config = get('config');
  const identity = get('config-id');
  const table = get('indicator-table').tBodies[0];
  const gates = get('config-gates');
  const weight = get('weight');
  const candidates = get('candidates');
  table.replaceChildren();
  gates.replaceChildren();
  identity.textContent = '';
  weight.textContent = '';
  try {
    const saved = CESShared.load();
    const flex = CESAuto.lock(saved);
    config.textContent = 'Phiên bản ' + flex.version + ' · CES ≥ ' + flex.threshold +
      ' · Cấu hình nghiên cứu, chưa duyệt kích hoạt.';
    identity.textContent = 'Đang tính mã cấu hình nghiên cứu…';
    const tag = Symbol();
    identity.renderTag = tag;
    researchHash(flex)
      .then(digest => {
        if (identity.renderTag !== tag) return;
        identity.textContent = 'Mã cấu hình nghiên cứu: ' + digest.slice(0, 12);
        identity.title = digest;
      }).catch(() => { if (identity.renderTag === tag) identity.textContent = 'Chưa tạo được mã cấu hình.'; });
    for (const text of ['Drawdown BTC ≥ ' + flex.btcDrawdown + '%', 'Giá đóng tuần dưới EMA200W']) {
      const item = document.createElement('li');
      item.textContent = text;
      gates.append(item);
    }
    const total = CESDynamic.validate(flex.dynamic);
    weight.textContent = 'Tổng trọng số đang bật: ' + total + ' · điểm chuẩn hóa trên 100.';
    const legacyFrame = {weekly:'1W',daily:'1D',ema:'1W',fear:'1D',base:'1W'};
    for (const row of flex.dynamic) {
      const name = CESDynamic.name(row);
      const frame = row.tf ?? legacyFrame[row.id] ?? '—';
      const operators = { le: '≤', ge: '≥', up: 'Cắt lên', down: 'Cắt xuống' };
      const pair = ['EMA','SMA','RSI/SMA','MACD','BB'].includes(row.type);
      const single = ['RSI','ADX'].includes(row.type);
      const periods = row.type === 'MACD' ? [row.p,row.q,row.s]
        : pair ? [row.p,row.q] : single ? [row.p] : [];
      const operation = ['RSI','Fear','ADX'].includes(row.type) ? [operators[row.op],row.limit].join(' ')
        : [operators[row.op], ['up','down'].includes(row.op) ? '· ' + row.window + ' nến' : '',
          row.type === 'BB' ? (row.band === 'upper' ? '· dải trên' : '· dải dưới') : ''].filter(Boolean).join(' ');
      const parameters = row.points ? row.points.map(([x,y]) => x + '→' + y).join(', ')
        : row.weeks ? row.weeks + ' tuần'
        : [periods.join('/'), operation].filter(Boolean).join(' · ');
      const item = table.insertRow();
      for (const [index, value] of [name, frame, parameters || '—', String(row.weight),
        row.enabled ? row.hard ? 'Bật · bắt buộc' : 'Bật' : 'Tắt'].entries()) {
        const cell = item.insertCell();
        cell.dataset.label = ['Chỉ báo','Khung','Tham số','Trọng số','Trạng thái'][index];
        cell.textContent = value;
      }
      const extra = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'Chi tiết';
      const details = document.createElement('dl');
      const share = row.enabled ? 100 * row.weight / total : 0;
      const fields = [
        ['Khung thời gian', frame], ['Thông số thực thi', parameters || 'Chưa có'],
        ['Trọng số gốc', String(row.weight)],
        ['Tỷ phần chuẩn hóa', share.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + '%'],
        ['Bộ lọc chỉ báo', !row.enabled ? 'Tắt' : !row.hard ? 'Không bắt buộc'
          : row.hardMax == null ? 'Phải đạt điều kiện' : 'Giá trị ≤ ' + row.hardMax],
        ['Cách tính điểm', !row.enabled ? 'Không tham gia' : row.points
          ? 'Nội suy theo các mốc giá trị → điểm và chuẩn hóa theo tổng trọng số'
          : 'Đạt điều kiện: nhận tỷ phần chuẩn hóa; không đạt: 0 điểm'],
        ['Dữ liệu tại thời điểm đánh giá', row.enabled ? 'Chưa đối chiếu dữ liệu của snapshot' : 'Không áp dụng'],
        ['Nguồn và kiểm định', 'Cấu hình nghiên cứu hiện tại · Bằng chứng kiểm định chưa liên kết'],
      ];
      for (const [label, value] of fields) {
        const term = document.createElement('dt');
        const content = document.createElement('dd');
        term.textContent = label;
        content.textContent = value;
        details.append(term, content);
      }
      const raw = document.createElement('details');
      const rawTitle = document.createElement('summary');
      rawTitle.textContent = 'JSON kỹ thuật';
      const json = document.createElement('pre');
      json.textContent = JSON.stringify(row, null, 2);
      raw.append(rawTitle, json);
      extra.append(summary, details, raw);
      item.cells[2].append(extra);
    }
  } catch (error) {
    config.textContent = 'Không đọc được cấu hình: ' + error.message;
  }
  candidates.replaceChildren(...['RA01','RA02','RA03','SMA01'].map(id => {
    const candidate = CESLibrary[id];
    const item = document.createElement('li');
    const detail = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = id + ' · v' + candidate.flex.version + ' · ' + candidate.coin + ' CES-' + candidate.mode;
    const description = document.createElement('p');
    description.textContent = 'Đối chứng nghiên cứu · CES ≥ ' + candidate.flex.threshold +
      ' · BTC giảm ≥ ' + candidate.flex.btcDrawdown + '% · Chưa duyệt kích hoạt.';
    const evidence = document.createElement('p');
    evidence.textContent = 'Bằng chứng Research của ứng viên: chưa liên kết.';
    detail.append(summary, description, evidence);
    item.append(detail);
    return item;
  }));
}

function openScreen(id, file) {
  if (!Object.hasOwn(screens, id)) id = 'overview';
  if (file && id !== 'overview') chosenTool.set(id, file);
  if (activeScreen !== id || location.hash !== '#' + id) {
    history.pushState(null, '', '#' + id);
  }
  render(id);
}

function collapse(doc, title, nodes, anchor = nodes[0]) {
  const targets = nodes.filter(Boolean);
  if (!targets.length || !anchor) return;
  const details = doc.createElement('details');
  const heading = doc.createElement('summary');
  heading.textContent = title;
  details.append(heading);
  anchor.before(details);
  details.append(...targets);
}

function refineTool(doc, file) {
  const get = id => doc.getElementById(id);
  if (file === 'ces_auto.html') {
    const result = get('results').closest('section');
    const setup = get('run').closest('section');
    setup.before(result);
    collapse(doc, 'Chi tiết kết quả, kiểm toán và xuất báo cáo',
      [get('researchAudit'), get('results'), doc.querySelector('[data-export]')?.parentElement, get('exportSize')]);
    const thresholdFields = ['capital','fee','slip','mdd','mae','goal','library','import','split']
      .map(id => get(id)?.closest('label'));
    const indicators = doc.querySelector('[data-type]')?.closest('.grid');
    collapse(doc, 'Cài đặt nâng cao', [...thresholdFields, indicators, get('importStatus')], get('run'));
    result.querySelector('h3').textContent = 'Kết quả trong mẫu và ngoài mẫu';
  }
  if (file === 'ces_optimizer.html') {
    const result = get('results').closest('section');
    const setup = get('mode').closest('section');
    setup.before(result);
    const rules = get('threshold').closest('section');
    const factors = get('params').closest('section');
    const run = get('run');
    const status = get('status');
    collapse(doc, 'Cài đặt điều kiện và bộ chỉ báo', [rules, factors]);
    setup.append(run, status);
  }
  if (file === 'mis_datahub.html') {
    const inventory = get('inventory');
    const sources = inventory.closest('section');
    const audit = get('audit').closest('section');
    collapse(doc, 'Quản lý nguồn, nhập dữ liệu', [sources]);
    collapse(doc, 'Kiểm toán, đối chiếu và xuất dữ liệu', [audit]);
    let currentQuery = 0;
    async function syncSummary() {
      const query = ++currentQuery;
      const key = get('source').value;
      const hub = doc.defaultView.MISDataHub;
      if (!hub) return;
      const set = (name, value) => { document.querySelector('#data-' + name).textContent = value; };
      set('source', hub.sources[key] ?? key);
      for (const [name, text] of Object.entries({range:'Chưa có dữ liệu',last:'Chưa có dữ liệu',quality:'Chưa kiểm toán',warmup:'Chưa kiểm tra'})) set(name,text);
      try {
        const snapshot = await hub.store(key);
        if (query !== currentQuery || !snapshot?.bars?.length) return;
        const bars = snapshot.bars;
        const iso = t => new Date(t).toISOString().slice(0, 10);
        set('range', iso(bars[0].t) + ' → ' + iso(bars.at(-1).t) + ' · ' + bars.length + ' nến');
        set('last', iso(bars.at(-1).t));
        const auditResult = snapshot.audit;
        if (auditResult) set('quality', auditResult.gaps.length + ' khoảng trống · ' + auditResult.bad.length + ' nến lỗi');
        const weeks = MISCES.aggregate(bars,'week').filter(week => week.n===7).length;
        set('warmup', weeks + ' tuần đầy đủ / 200');
      } catch {
        if (query === currentQuery) set('quality', 'Chưa đọc được dữ liệu nguồn.');
      }
    }
    get('source').addEventListener('change', syncSummary);
    const update = new MutationObserver(syncSummary);
    update.observe(inventory,{childList:true,subtree:true});
    syncSummary();
  }
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
      'nav, body > header, [hidden] { display:none !important; }' +
      'body {background:#edf3f5 !important;font-family:system-ui,sans-serif !important}' +
      'section, article {border-radius:12px !important;max-width:100%}' +
      'details>summary {cursor:pointer;font-weight:650;padding:8px}' +
      'pre {white-space:pre-wrap;overflow-wrap:anywhere}' +
      'label,input,select,button {max-width:100%}';
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
    refineTool(doc, route.file);
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
  research.hidden = activeScreen !== 'research';
  data.hidden = activeScreen !== 'data';
  document.querySelector('#data-asset').textContent = asset.value;
  if (!library.hidden) renderLibrary();
  tools.replaceChildren(...(activeScreen === 'backtest' ? available : []).map(route => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = route.label;
    button.setAttribute('aria-pressed', String(route === selected));
    button.onclick = () => openScreen(activeScreen, route.file);
    return button;
  }));
  const frame = selected && (activeScreen !== 'research' || historyPanel.open)
    ? frameFor(selected, activeScreen === 'research' ? historyPanel : frames) : null;
  for (const view of views.values()) view.hidden = view !== frame;
  if (frame) {
    syncAsset(frame.contentDocument);
    frame.dispatchEvent(new Event('workspace-visible'));
  }
}

asset.addEventListener('change', () => {
  render(activeScreen);
  for (const frame of views.values()) if (!frame.hidden) syncAsset(frame.contentDocument);
});
historyPanel.addEventListener('toggle', () => { if (activeScreen === 'research') render('research'); });
window.addEventListener('hashchange', () => render(location.hash.slice(1)));
window.addEventListener('popstate', () => render(location.hash.slice(1)));
const linkedAsset = new URLSearchParams(location.search).get('asset')?.trim().toUpperCase();
if (Array.from(asset.options).some(option => option.value === linkedAsset)) asset.value = linkedAsset;
render(location.hash.slice(1));
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(console.error);
