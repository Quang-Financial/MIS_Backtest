# MIS Research Close REV2

Baseline `51fab4bc103c80fa761617e349f9a9b5ff9b3fdb`. BTC/USD Bitstamp spot only. Research results remain exploratory.

## Archive and rankings

- Original Git blob `5c6ba2e0cfdbe4496c7cdf8ab5ab4ae154995d25`, from commit `c5c062f164670b5f2f67db6a1b03762c2f3897eb`, is preserved byte-for-byte.
- [Shard manifest](exit-grid/manifest.json) lists all 14 groups by drawdown and capital allocation with SHA-256, counts, candidate IDs, per-group balanced ranking and four overall rankings. All 1,680 configurations reconstruct in original row order, with 120 per shard.
- Balanced filter admits 471 candidates; robustness admits six. `R15-1291` leads both. Ranking uses original unrounded measurements and source-row ID for exact ties. Safety and growth are alternate descriptions of the same grid.
- All 10,080 PF values are undefined. The latest segment, 2025-01-01 through 2026-11-25, has zero entries for every candidate. Its zero returns and undefined Calmar/Sharpe provide no positive validation. A 2020 exclusion and higher transaction costs test sensitivity on observed data.
- Earlier rounds 1–8 are each indexed below as unavailable. Review-branch history, existing research artifacts and Issue #5 provide no uniquely attributable original configuration grid, dataset and output for those rounds. Rounds 9–18 remain linked in the master and cannot be substituted for the missing material.

| Historical round | Archival disposition |
| --- | --- |
| 1 | Original reproducible record unavailable |
| 2 | Original reproducible record unavailable |
| 3 | Original reproducible record unavailable |
| 4 | Original reproducible record unavailable |
| 5 | Original reproducible record unavailable |
| 6 | Original reproducible record unavailable |
| 7 | Original reproducible record unavailable |
| 8 | Original reproducible record unavailable |

## Engine comparison

Pinned market blob `2a902bfc8699cbff69153102ccd8b91353fc6a4a`. Replay uses the official `MISCES.simulateCustom` execution code with an external research entry gate. It builds EMA200W from complete historical weeks and computes cumulative ATH from daily highs through the just-completed week. The archived research gate uses BTC weekly close below EMA200W and an ATH discount. It does not provide CES indicator scoring, Fear & Greed, CES threshold, or an original event log. Native CES strategy parity cannot be inferred from this adapter.

| Comparison field | Archive protocol | Official execution replay |
| --- | --- | --- |
| Buy | Weekly gate with next open | Matching intended timing; no same-week reentry after a position closes; individual archived fill timestamps unavailable |
| Capital | Fractional allocation of USD 10,000; idle cash zero yield | Ring-fenced fixed allocation passed into one-step official simulation; reserve added back for equity metrics; simulator caps each entry at sleeve cash |
| TP | Hybrid target exits based on accumulated quantity; research checkpoint describes next-open execution | Intraday high triggers limit TP at max(open, target); quantities reference accumulated base; gap and multiple targets may fill same day |
| Trailing | Daily close trigger and next open | Starts next daily candle after last TP; uses intraday low against previous stop with min(open, stop) fill, then updates peak only if stop survives |
| Costs | Base 0.10% fee / 0.05% slippage per side; stress 0.30% / 0.20% | Same inputs; Engine charges proportional fill fees after adverse slippage. Exact archival cost/fill sequence unavailable |
| Terminal equity | Open positions marked at close | Cash plus marked quantity at last close; no forced sale |
| Sharpe | Archived output | Not returned by official execution and excluded from delta |

Replay covers all six robust rows plus `R15-0062`, the top archived early-Calmar candidate selected using only the early column for a retrospective chronological check. Its official replay mid window has one entry and annualized 10.60%; the recent window has zero entries. The dates and grid have already been observed. No unseen OOS is claimed.

For `R15-1291`, base CAGR falls from 19.48% to 13.19% (−6.30 pp), MDD from −9.83% to −9.25%, and Calmar from 1.981 to 1.425. Both show three buys and three closed cycles. Replay skip-2020 CAGR 9.93% falls below the archive robustness rule of 12%. All six shortlisted candidates have lower base CAGR under official execution. **FAIL for matching archived metrics.** The comparison does not allocate the differences to individual rules because archival fills and simulator source are absent.

## Reproduction and QA

1. Run `node research/build-close-archive.cjs` to verify all shards, ranking and exact ordered reconstruction.
2. Fetch the exact MIS_Data Git blob identified above into a local JSON file. Run `node research/replay-close-shortlist.cjs PATH_TO_PINNED_JSON` and compare with the checked-in replay output. The script verifies the input Git SHA.
3. Serve the pinned checkout on loopback. Run `node tests/research-close-browser.cjs` with Playwright installed. The script opens Research, checks keyboard and accent-insensitive glossary search, verifies PWA manifest/icons and exercises offline reload.
4. Independent MIS03 acceptance requires the exact handoff commit. Windows desktop install and the deployed HTTPS Staging URL are separate checks.

Work ran the browser, storage-upgrade and baseline suites. See the [test log](../tests/mis-research-close-rev2.log). The loopback Chromium probe found zero installability errors. The upgrade started from `c4d2768`, preserved four categories of stored data and loaded the legacy monitor bookmark offline at both viewports. For a Windows install check, open the pinned HTTPS Staging URL in Chrome, use the address-bar install control for MIS Staging, launch it in standalone mode, then check the shell offline and refresh after reconnecting. The loopback test does not establish installability of any particular deployed URL.
