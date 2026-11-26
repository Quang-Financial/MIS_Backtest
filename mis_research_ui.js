(() => {
  'use strict';
  const get = id => document.getElementById(id);
  const asset = get('workspace-asset');
  const app = MISResearchWorkspace;
  const format = value => Number.isFinite(value) ? value.toLocaleString('vi-VN', { maximumFractionDigits: 6 }) : '—';
  const date = value => Number.isFinite(value) ? MISCES.iso(value) : '—';
  const hash = value => value.slice(0, 12);
  let audit;
  let researchRevision = 0;
  let paperRevision = 0;

  function table(id, rows) {
    const body = get(id).tBodies[0];
    body.replaceChildren();
    for (const values of rows) {
      const row = body.insertRow();
      for (const value of values) row.insertCell().textContent = value;
    }
  }

  async function pinned(coin) {
    const entry = await pinnedResearchSnapshot(coin);
    if (!entry) throw Error('Chưa có snapshot. Vào Tổng quan và ghim dữ liệu đã xác nhận.');
    return restorePinnedResearch(coin, entry.end);
  }

  function costs(prefix) {
    for (const key of ['fee', 'slip']) {
      const input = get(prefix + key);
      if (!input.checkValidity()) throw Error('Phí và trượt giá phải từ 0% đến 10%.');
    }
    return { fee: get(prefix + 'fee').valueAsNumber, slippage: get(prefix + 'slip').valueAsNumber };
  }

  function defaultRules(mode) {
    return { buy: mode === 'A' ? [{ drop: 0, pct: 100 }] :
      [{ drop: 0, pct: 30 }, { drop: 10, pct: 30 }, { drop: 20, pct: 40 }],
    sell: [{ gain: 100, pct: 25 }, { gain: 200, pct: 40 }], trail: 15 };
  }

  function resetResearch() {
    researchRevision++;
    audit = undefined;
    get('research-download').disabled = true;
    get('research-risk').textContent = '';
    get('research-context').textContent = '';
    get('research-indicators').textContent = '';
    for (const id of ['research-zones', 'research-robustness']) table(id, []);
  }

  get('research-run').addEventListener('click', async () => {
    const coin = asset.value;
    const button = get('research-run');
    button.disabled = true;
    resetResearch();
    get('research-status').textContent = 'Đang kiểm tra snapshot…';
    const revision = researchRevision;
    try {
      const preset = get('research-config').value;
      const flex = CESAuto.lock(preset ? CESLibrary[preset].flex : CESShared.load());
      const options = { ...costs('research-'), capital: 10000 };
      const snapshot = await pinned(coin);
      const configId = await researchHash(flex);
      const zone = app.zoneEvidence(snapshot.a);
      const frames = app.frames(snapshot.a);
      const base = app.robustness(snapshot, flex, options, defaultRules);
      const stressOptions = { ...options, fee: options.fee * 2, slippage: options.slippage * 2 };
      const stress = app.robustness(snapshot, flex, stressOptions, defaultRules, false);
      if (researchRevision !== revision) return;
      audit = { schema: 1, coin, preset: preset || null, snapshotId: snapshot.snapshotId, configId, flex, end: snapshot.end,
        frames, options, rules: { A: defaultRules('A'), B: defaultRules('B') }, zone, base, stressOptions, stress };
      get('research-context').textContent = coin + ' · chốt dữ liệu ' + date(snapshot.end) +
        ' UTC · OOS từ ' + date(zone.split) + ' · ' + frames.days + ' ngày / ' +
        frames.weeks + ' tuần / ' + frames.months + ' tháng đầy đủ · cấu hình ' +
        hash(configId) + ' · snapshot ' + hash(snapshot.snapshotId);
      table('research-zones', zone.rows.flatMap(row => row.metrics.map(metric => [
        row.label, 'Z' + row.index, metric.days, metric.samples + '/' + row.candidates,
        row.cycles, format(metric.roi), format(metric.mae), format(metric.recovery), metric.recovered
      ])));
      table('research-robustness', [['Gốc', base], ['Phí/trượt ×2', stress]].flatMap(([scenario, result]) =>
        result.rows.map(row => [scenario, row.label, row.mode, row.status, row.usable + '/' + row.weeks,
          format(row.roi), format(row.cagr), format(row.mdd), format(row.mae), format(row.calmar), format(row.benchmark)])));
      get('research-risk').textContent = base.blocked ?
        'A/B, stress và ablation bị chặn vì cấu hình dùng Fear & Greed BTC mà thời điểm công bố lịch sử chưa được xác minh.' : '';
      get('research-indicators').textContent = base.blocked ? 'Chưa thể chấm đóng góp chỉ báo trên dữ liệu này.' :
        'Tuần qua toàn bộ gate: gốc ' + base.basePass + (base.ablation.length ? ' · ' + base.ablation.map(row =>
          'bỏ ' + row.name + ': ' + row.passingWeeks).join(' · ') : ' · Không có chỉ báo tùy chọn để ablate.') +
        ' · Độ nhạy (' + base.stability.length + ' biến thể): ' + (base.stability.map(row => row.passingWeeks).join(', ') || '—') + ' tuần qua gate.';
      get('research-status').textContent = 'Đã tạo hồ sơ nghiên cứu ' + coin + '. Các dòng có 0 mẫu chưa đủ bằng chứng.';
      get('research-download').disabled = false;
    } catch (error) {
      if (researchRevision === revision) get('research-status').textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  function download(value, name) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name + '.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  get('research-download').addEventListener('click', () => {
    if (audit) download(audit, 'MIS-research-' + audit.coin + '-' + date(audit.end));
  });

  async function accountStore(mutate) {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('mis-paper-sandbox-v1', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('accounts');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction('accounts', mutate ? 'readwrite' : 'readonly');
        const store = tx.objectStore('accounts');
        const request = store.get('primary');
        let result;
        let error;
        request.onsuccess = () => {
          try {
            result = request.result;
            if (mutate) {
              result = mutate(result);
              store.put(result, 'primary');
            }
          } catch (err) {
            error = err;
            tx.abort();
          }
        };
        tx.oncomplete = () => resolve(result);
        tx.onabort = tx.onerror = () => reject(error ?? tx.error ?? Error('Không lưu được sổ mô phỏng.'));
      });
    } finally {
      db.close();
    }
  }

  async function showPaper() {
    const revision = ++paperRevision;
    const account = await accountStore();
    if (paperRevision !== revision) return;
    get('paper-start').disabled = Boolean(account);
    get('paper-capital').disabled = Boolean(account);
    get('paper-record').disabled = !account;
    get('paper-download').disabled = !account;
    get('paper-balance').textContent = account ?
      'Vốn đầu ' + format(account.initial) + ' · Tiền mặt ' + format(account.cash) +
        ' · Lãi/lỗ đã chốt ' + format(account.realized) + ' USDT mô phỏng.' : 'Chưa tạo sổ mô phỏng.';
    const positions = Object.entries(account?.positions ?? {}).filter(([, position]) => position.units > 0);
    table('paper-positions', positions.map(([coin, position]) =>
      [coin, format(position.units), format(position.cost), format(position.cost / position.units)]));
    table('paper-fills', (account?.fills ?? []).slice(-20).reverse().map(fill => [
      date(fill.date), fill.coin, fill.side, format(fill.units), format(fill.fill),
      format(fill.paidFee), hash(fill.snapshotId)
    ]));
    const marks = await Promise.all(positions.map(async ([coin, position]) => {
      try {
        const snapshot = await pinned(coin);
        return { time: snapshot.end, value: app.paperPrice(snapshot, coin) * position.units };
      } catch { return null; }
    }));
    if (paperRevision !== revision) return;
    const marked = account && marks.every(mark => mark && mark.time === marks[0]?.time &&
      mark.time >= account.fills.at(-1)?.date && Number.isFinite(mark.value));
    if (!account) get('paper-equity').textContent = '';
    else if (!marked) get('paper-equity').textContent = 'Chưa định giá: cần snapshot cùng ngày chốt cho mọi vị thế.';
    else {
      const equity = account.cash + marks.reduce((total, item) => total + item.value, 0);
      get('paper-equity').textContent = 'Tổng tài sản theo giá mô phỏng: ' + format(equity) +
        ' · ROI ' + format(100 * (equity / account.initial - 1)) + '%' + (marks.length ? ' · ' + date(marks[0].time) + ' UTC' : '');
    }
  }

  function paperAction(id, operation) {
    get(id).addEventListener('click', async () => {
      const button = get(id);
      button.disabled = true;
      try {
        await operation();
        await showPaper();
      } catch (error) {
        get('paper-status').textContent = error.message;
        await showPaper().catch(() => {});
      }
    });
  }

  paperAction('paper-start', async () => {
    const input = get('paper-capital');
    if (!input.checkValidity()) throw Error('Nhập vốn mô phỏng hợp lệ.');
    const initial = input.valueAsNumber;
    await accountStore(current => {
      if (current) throw Error('Sổ mô phỏng đã tồn tại.');
      return { initial, cash: initial, realized: 0, positions: {}, fills: [] };
    });
    get('paper-status').textContent = 'Đã mở sổ mô phỏng trên thiết bị.';
  });

  paperAction('paper-record', async () => {
    const coin = asset.value;
    const side = get('paper-side').value;
    const input = get('paper-amount');
    if (!input.checkValidity()) throw Error('Nhập giá trị hoặc số lượng mô phỏng hợp lệ.');
    const amount = input.valueAsNumber;
    const quote = costs('paper-');
    const snapshot = await pinned(coin);
    if (asset.value !== coin) throw Error('Mã tài sản đã đổi. Kiểm tra lại lượt mô phỏng.');
    await accountStore(account => {
      if (!account) throw Error('Chưa tạo sổ mô phỏng.');
      return app.paperFill(account, { coin, side, amount, ...quote, date: snapshot.end,
        snapshotId: snapshot.snapshotId, price: app.paperPrice(snapshot, coin) });
    });
    get('paper-status').textContent = 'Đã ghi lượt ' + side + ' ' + coin + ' tại giá đóng ' + date(snapshot.end) + ' UTC.';
  });

  get('paper-download').addEventListener('click', async () => {
    try {
      const account = await accountStore();
      if (account) download({ schema: 1, ...account }, 'MIS-paper-sandbox');
    } catch (error) { get('paper-status').textContent = error.message; }
  });

  get('paper-side').addEventListener('change', () => {
    get('paper-amount-label').textContent = get('paper-side').value === 'BUY' ?
      'Tiền mô phỏng chi (gồm phí)' : 'Số lượng bán mô phỏng';
  });

  for (const id of ['research-config', 'research-fee', 'research-slip']) {
    get(id).addEventListener('change', () => {
      resetResearch();
      get('research-status').textContent = 'Đã đổi đầu vào. Chạy lại nghiên cứu.';
    });
  }
  asset.addEventListener('change', () => {
    resetResearch();
    get('research-status').textContent = 'Chạy nghiên cứu từ snapshot đã ghim cho ' + asset.value + '.';
  });
  const refreshPaper = () => showPaper().catch(error => { get('paper-status').textContent = error.message; });
  window.addEventListener('mis-snapshot-pinned', refreshPaper);
  refreshPaper();
})();
