(function (root) {
  'use strict';
  const day = 86400000;
  const boundaries = [40, 45, 50, 55, 60, 70];
  const horizons = [90, 180, 365, 730];

  function zone(peak, price) {
    const drawdown = Math.max(0, 100 * (1 - price / peak));
    return { drawdown, index: boundaries.filter(value => drawdown + 1e-9 >= value).length };
  }

  function median(values) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  function zoneEvidence(bars) {
    const split = Math.floor(bars.length * 7 / 10);
    const rows = [];
    for (const [label, start, end] of [['IS', 0, split], ['OOS', split, bars.length]]) {
      const events = [];
      let peak = 0;
      let previous = 0;
      let cyclePeak = 0;
      for (let i = 0; i < end; i++) {
        const bar = bars[i];
        if (bar.h > peak) {
          peak = bar.h;
          cyclePeak = bar.t;
        }
        const { index } = zone(peak, bar.c);
        if (i >= start && index > 0 && index !== previous) events.push({ index, i, cyclePeak });
        previous = index;
      }
      for (let index = 1; index <= boundaries.length; index++) {
        const samples = events.filter(item => item.index === index);
        const metrics = horizons.map(days => {
          const mature = samples.filter(item => item.i + days < end);
          const returns = [], adverse = [], recovery = [];
          for (const { i } of mature) {
            const entry = bars[i].c;
            const path = bars.slice(i + 1, i + days + 1);
            returns.push(100 * (path.at(-1).c / entry - 1));
            adverse.push(Math.min(0, ...path.map(bar => 100 * (bar.l / entry - 1))));
            const trough = path.reduce((worst, bar, offset) => bar.l < path[worst].l ? offset : worst, 0);
            const recovered = path.findIndex((bar, offset) => offset > trough && bar.c >= entry);
            if (recovered >= 0) recovery.push(recovered - trough);
          }
          return { days, samples: mature.length, roi: median(returns), mae: median(adverse),
            recovery: median(recovery), recovered: recovery.length };
        });
        rows.push({ label, index, candidates: samples.length,
          cycles: new Set(samples.map(item => item.cyclePeak)).size, metrics });
      }
    }
    return { split: bars[split]?.t, rows };
  }

  function frames(bars) {
    const completeMonths = root.MISCES.aggregate(bars, 'month').filter(bar =>
      bar.n === new Date(Date.UTC(new Date(bar.t).getUTCFullYear(), new Date(bar.t).getUTCMonth() + 1, 0)).getUTCDate()
    );
    return { days: bars.length,
      weeks: root.MISCES.aggregate(bars, 'week').filter(bar => bar.n === 7).length,
      months: completeMonths.length };
  }

  function robustness(snapshot, flex, options, rulesFor, includeAblation = true) {
    const { a, b, fear } = snapshot;
    const split = Math.floor(a.length * 7 / 10);
    const windows = [['IS', 0, split], ['OOS', split, a.length]];
    if (flex.dynamic.some(row => row.enabled && (row.type === 'Fear' || row.id === 'fear'))) {
      return { blocked: true, rows: [] };
    }
    const scores = config => root.CESDynamic.signals(a, b, fear,
      { flex: config, threshold: config.threshold }).signals;
    const signals = scores(flex);
    const rows = [];
    for (const [label, start, end] of windows) {
      const bars = a.slice(start, end);
      if (bars.length < 2) continue;
      for (const mode of ['A', 'B']) {
        const samples = [...signals].filter(([at]) => at >= bars[0].t && at <= bars.at(-1).t);
        const usable = samples.filter(([, signal]) => [signal.score, signal.ema200, signal.btcDD].every(Number.isFinite));
        if (!usable.length) {
          rows.push({ label, mode, status: 'Thiếu dữ liệu', usable: 0, weeks: samples.length });
          continue;
        }
        const stats = root.MISCES.simulateCustom(bars, signals,
          { ...options, rules: rulesFor(mode) }, mode);
        const cagr = 100 * ((stats.final / options.capital) ** (365.25 / (bars.length - 1)) - 1);
        rows.push({ label, mode, status: stats.buyCount ? 'Có giao dịch' : 'Không giao dịch',
          usable: usable.length, weeks: samples.length, buys: stats.buyCount, roi: stats.roi,
          mdd: stats.mdd, mae: stats.mae, cagr, calmar: stats.mdd < 0 ? cagr / Math.abs(stats.mdd) : null,
          benchmark: 100 * (bars.at(-1).c / bars[0].o - 1) });
      }
    }
    const active = flex.dynamic.filter(row => row.enabled);
    const basePass = [...signals].filter(([, signal]) => signal.valid).length;
    const ablation = (includeAblation ? active : []).filter(row => !row.hard && active.some(other => other !== row && other.weight > 0))
      .map(row => {
        const config = { ...flex, dynamic: flex.dynamic.map(item => item === row ? { ...item, enabled: false } : item) };
        return { name: root.CESDynamic.name(row), passingWeeks: [...scores(config)].filter(([, signal]) => signal.valid).length };
      });
    const trials = includeAblation ? root.CESAuto.neighbors(flex, 32).filter(candidate =>
      candidate.btcDrawdown === flex.btcDrawdown && candidate.belowEMA200 === flex.belowEMA200 &&
      candidate.dynamic.every((row, index) => !flex.dynamic[index].hard ||
        JSON.stringify(row) === JSON.stringify(flex.dynamic[index]))).slice(0, 6) : [];
    const stability = trials.map(config => ({ threshold: config.threshold, changes: config.dynamic.filter((row, index) =>
      JSON.stringify(row) !== JSON.stringify(flex.dynamic[index])).map(row => ({ name: root.CESDynamic.name(row),
        limit: row.limit, window: row.window, weight: row.weight })),
      passingWeeks: [...scores(config)].filter(([, signal]) => signal.valid).length }));
    return { rows, basePass, ablation, stability };
  }

  function paperPrice(snapshot, coin) {
    const row = snapshot.a.at(-1);
    if (row?.source !== 'OKX ' + coin + '/USDT' || !Number.isFinite(row.c) || row.c <= 0) {
      throw Error('Sổ mô phỏng cần giá OKX/USDT. Snapshot này chưa có giá cùng đơn vị.');
    }
    return row.c;
  }

  function paperFill(account, order) {
    const { coin, date, snapshotId, side, amount, price, fee, slippage } = order;
    if (!/^[A-Z0-9]{2,10}$/.test(coin) || !/^[a-f0-9]{64}$/.test(snapshotId) ||
        !Number.isSafeInteger(date) || date < 0 || date % day || !['BUY', 'SELL'].includes(side) ||
        ![amount, price].every(value => Number.isFinite(value) && value > 0) ||
        ![fee, slippage].every(value => Number.isFinite(value) && value >= 0 && value < 100)) {
      throw Error('Thông số mô phỏng không hợp lệ.');
    }
    const last = account.fills.at(-1);
    if (last && (date < last.date || account.fills.some(fill =>
      fill.date === date && fill.coin === coin))) throw Error('Lượt mô phỏng phải theo ngày; mỗi mã một lượt mỗi ngày.');
    const old = account.positions[coin] ?? { units: 0, cost: 0 };
    const buying = side === 'BUY';
    if (buying && amount > account.cash) throw Error('Số tiền mô phỏng vượt tiền mặt.');
    if (!buying && amount > old.units) throw Error('Số lượng mô phỏng vượt vị thế.');
    const fill = price * (1 + (buying ? 1 : -1) * slippage / 100);
    const units = buying ? amount / (fill * (1 + fee / 100)) : amount;
    const paidFee = fill * units * fee / 100;
    const net = buying ? -amount : fill * units - paidFee;
    const basis = buying ? 0 : old.cost * (amount / old.units);
    const cash = account.cash + net;
    const position = buying ? { units: old.units + units, cost: old.cost + amount }
      : { units: old.units - units, cost: old.cost - basis };
    if (![fill, units, paidFee, net, cash, position.units, position.cost].every(Number.isFinite) ||
        units <= 0 || cash < 0) throw Error('Kết quả mô phỏng không hợp lệ.');
    const realized = buying ? account.realized : account.realized + net - basis;
    if (!Number.isFinite(realized)) throw Error('Lãi/lỗ mô phỏng ngoài phạm vi.');
    return { ...account, cash, realized, positions: { ...account.positions, [coin]: position },
      fills: [...account.fills, { ...order, fill, units, paidFee, net }] };
  }

  const api = { zone, zoneEvidence, frames, robustness, paperPrice, paperFill };
  root.MISResearchWorkspace = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
