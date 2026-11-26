# MIS Research Master
Status: exploratory; not approved for trading. 2026-11-26.
## Taxonomy
R01 Buy Zone; R02 EMA; R03 RSI; R04 Indicator Combination; R05 Capital Allocation; R06 Entry Strategy; R07 Exit Strategy; R08 Multi-Cycle; R09 Robustness; R10 Final Ranking.
## Protocol
Preserve all configurations and test rounds, unique IDs, source blob SHA, date range, execution assumptions, metrics, missing values, validation status. Rank per round, per category and final comparable full strategies. Default filter CAGR 12–20%, abs(MDD)<=20%, then Calmar descending; allow arbitrary filters and top N. No automatic promotion or combining winners without retest. PF unavailable is not pass. No OOS claim on observed data.
## Historical recovery checkpoint
Data MIS_Data/data/btcusd-bitstamp.json blob 2a902bfc8699cbff69153102ccd8b91353fc6a4a. BTC spot 2018-01-01 to 2026-11-25, weekly close below EMA200, cumulative ATH drawdown, next open execution, fee .1%, slip .05% per side, initial 10000 USD, idle cash zero yield. Hybrid exit 2x sell 25%, 3x sell 40% of accumulated quantity, trailing 15% after TP3 on daily close, next open. Open positions marked to close. Research script not official engine. Earlier rounds 1–8 require full historical backfill; do not treat this checkpoint as complete archive.
## Round 9 — R01 × R05
Columns: DD%, allocation%, CAGR%, MDD%, Calmar, Sharpe, buys, CAGR excluding 2020 entries%, Calmar excluding 2020, stress CAGR%, stress Calmar. Stress fee .3%, slip .2%.
```csv
DD,allocation,CAGR,MDD,Calmar,Sharpe,buys,skip2020CAGR,skip2020Calmar,stressCAGR,stressCalmar
40,25,15.43739,-15.47835,.99735,1.27800,4,8.49263,.64820,15.28744,.97882
40,30,18.02869,-17.90711,1.00679,1.27396,4,9.91736,.64273,17.85594,.98844
45,25,15.43739,-15.47835,.99735,1.27800,4,8.49263,.64820,15.28744,.97882
45,30,18.02869,-17.90711,1.00679,1.27396,4,9.91736,.64273,17.85594,.98844
50,25,15.83863,-15.47835,1.02328,1.32228,4,8.86974,.67698,15.68710,1.00441
50,30,18.52236,-17.90711,1.03436,1.32002,4,10.37711,.67253,18.34766,1.01565
55,25,15.79394,-15.47835,1.02039,1.34718,3,8.82773,.67378,15.65394,1.00228
55,30,18.46751,-17.90711,1.03129,1.34533,3,10.32602,.66922,18.30697,1.01340
60,25,15.79394,-15.47835,1.02039,1.34718,3,8.82773,.67378,15.65394,1.00228
60,30,18.46751,-17.90711,1.03129,1.34533,3,10.32602,.66922,18.30697,1.01340
65,25,15.54272,-11.41840,1.36120,1.44896,3,8.59163,.85244,15.40394,1.33058
65,30,18.17734,-13.06554,1.39124,1.44249,3,10.05579,.83889,18.01812,1.36026
```
Round 9 top 3: MIS-A-DD65-C30, MIS-A-DD65-C25, MIS-A-DD50-C30. None meets Calmar >=1 excluding 2020. PF not established. Independent OOS and official engine parity pending. Round 10 pending.
