# Lộ trình MIS

| Mốc | Điều kiện hoàn thành |
|---|---|
| Staging V1.6.7 | URL riêng, origin riêng, dữ liệu công khai hoặc dữ liệu thử, kiểm soát kết nối ghi. |
| Kiểm thử V1.6.7 | Hồi quy BTC, sáu ca Altcoin trong phạm vi đã duyệt, Optimizer, Auto Backtest, Historical Research, Live Monitor, Data Hub, PWA và báo cáo. Ghi kết quả và lý do khi dữ liệu thiếu. |
| Nghiệm thu | Kiểm tra CI đúng commit, luồng còn thiếu trên thiết bị hoặc môi trường đại diện, chủ dự án duyệt các ngoại lệ. |
| Phát hành | Chủ dự án duyệt chính thức. Ghi phiên bản, commit và phương án quay lại. |

Ưu tiên đưa các phép kiểm lặp lại vào GitHub Actions. Dùng dữ liệu cố định cho hồi quy và kiểm thử độc lập cho nguồn dữ liệu thị trường.

| Phiên bản | Phạm vi định hướng |
|---|---|
| V1.7.0 | Unified Architecture: năm màn hình, dữ liệu và Engine chung, Strategy ID và điều hướng. |
| V1.7.1 | Buy Zone Research: Drawdown, chất lượng điểm mua, lợi nhuận và rủi ro theo kỳ nắm giữ. |
| V1.7.2 | Indicator Research: ngưỡng, chu kỳ, trọng số, Ablation và Stability. |
| V1.7.3 | Robustness Research: đa khung, đa chu kỳ, OOS, Walk Forward, Stress Test và CES-A/B. |
| V1.7.4 | Research Integration: liên kết cấu hình, kết quả và bằng chứng giữa năm màn hình. |
| V1.8.0 | Live Decision: chu kỳ, vùng mua, WAIT/WATCH/BUY READY, kế hoạch giải ngân và cảnh báo. |
| V1.8.1 | Paper Trading: tín hiệu thực tế, mô phỏng vị thế, đối chiếu Backtest và Live. |
| V1.9.0 | Portfolio Management: vốn, danh mục và hiệu quả đầu tư. |
| V2.0.0 | Multi-Strategy: nghiên cứu TES/RES sau khi CES đủ bằng chứng và chủ dự án phê duyệt. |

[Quy trình MIS-CDS](MIS_DISCUSSION.md) áp dụng cho mỗi mốc. PR #4 tiếp nhận phản biện V1.7. Tiêu chí kỹ thuật và bằng chứng được theo dõi theo ID trong MIS_TASKS.md.
