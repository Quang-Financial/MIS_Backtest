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

UX-5-SCREENS triển khai theo thứ tự bảo vệ trạng thái Tổng quan → tóm tắt và mở rộng chi tiết cho năm màn hình → kiểm tra ảnh và phản biện độc lập. Nghiên cứu vùng mua, snapshot thống nhất và so sánh báo cáo A/B được theo dõi riêng.

**Điều phối:** áp dụng Fast Execution hiện hành; native wake còn BLOCKED, không lặp thử nghiệm thiếu hướng mới.

## Kế hoạch ưu tiên bản tích hợp đủ chức năng test (26/11/2026)
Theo chỉ đạo chủ dự án, xây khung toàn bộ CES Spot trước, hạng mục khó đạt mức trung gian 80%, tối ưu đồng bộ sau. Không phải phê duyệt chiến lược mới hoặc release. Dự toán ngày làm việc hữu hiệu, chưa đo throughput và không bảo đảm ngày lịch:

| Gói | Mốc | Ngày dự kiến |
|---|---|---:|
| A | V1.7.0 khung 5 màn hình | 0,5 |
| A | V1.7.1 vùng mua | 1–1,5 |
| A | V1.7.2 chỉ báo | 1–1,5 |
| A | V1.7.3 đa khung/chu kỳ, A/B | 1–2 |
| A | V1.7.4 tích hợp | 0,5–1 |
| B | V1.8.0 Live Decision nghiên cứu | 1–1,5 |
| B | V1.8.1 Paper Trading | 0,5–1 |
| C | V1.9.0 vốn/danh mục mô phỏng | 0,5–1 |
| Tổng | Bản test tích hợp | 6–10 |

MIS02 thực hiện tuần tự theo phụ thuộc, MIS03 chuẩn bị test song song và retest trực tiếp; MIS01 theo dõi milestone, hỗ trợ blocker. Không dừng để tối ưu thẩm mỹ nhỏ hoặc nghiệm thu release từng mốc. Mỗi chức năng phải có luồng test thực, phần thiếu ghi pending/disabled, không giả lập kết quả thành thật. Giữ hard gates, causal data, bảo toàn dữ liệu, cấu hình chưa duyệt không kích hoạt, SUI/Fear provenance ghi giới hạn. V2.0 ngoài phạm vi. Sau bản test, lập backlog tối ưu và dự toán cuối theo bằng chứng; thời gian paper observation và chờ phiên Work không nằm trong 6–10 ngày. Tiêu chuẩn [V1.7](MIS_DESIGN_STANDARD.md).
