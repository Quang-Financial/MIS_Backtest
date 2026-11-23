MIS CES Spot V1.2 - Compare preview (experimental)

INSTALL: Unzip and upload ALL files in this ZIP to the root of the existing GitHub Pages repository. Do not upload the ZIP as a single file. Backup existing files first. Open index.html -> CES Compare V1.2 or /ces_compare.html.

INCLUDES: Original MIS alpha.6.2 from available ZIP, plus ces_compare.html, ces_compare.js, ces_engine.js and updated service-worker cache.

LOGIC: UTC daily OKX candles; weekly aggregation with Monday start, closed Sunday; signals calculated only on closed weeks; next Monday opening buys; daily TP and trailing. RSI14 weekly and daily, weekly EMA20/50/200, weekly SMA14(RSI14). Fear & Greed from alternative.me history. Data missing => signals invalid, no synthetic score.

KNOWN LIMITATIONS (preview, not production):
- No live network test of OKX/Alternative.me API/CORS in this environment. Safari/OKX regional network restrictions may block data. API rate limits may apply.
- Daily candle OHLC cannot establish intraday ordering. TP2 and trailing on same daily candle are not inferred; trailing starts after TP2, conservative.
- Historical Fear & Greed timestamps aligned by UTC day; publication delay not independently audited. Must verify before relying on results.
- EMA200 on young assets cannot be backtested without >=200 full weeks of history. Daily history requires >=1450 days and no gaps.
- Data stored in localStorage; browser quota may prevent cache; app can still run online.
- Weekly/monthly data verification against OKX native 1Wutc/1Mutc is not yet automated in this preview. Daily to weekly aggregation is deterministic.
- MAE measures lowest daily Low relative to position average entry; MDD uses daily close equity, not intraday worst equity.
- Backtest includes trading fee and slippage; no funding, tax, or market impact.
- Signal threshold and weights editable; DCA 30/30/40 and 10/20, exit fixed.
- No actual exchange orders are submitted.

NEXT: Run on iPhone and verify API availability, data coverage, and audit; then test known fixture cases and reconcile OKX native weekly/monthly OHLC before promoting to stable release.
