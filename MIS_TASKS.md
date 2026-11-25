# Công việc MIS V1.6.7

| Việc | Trạng thái |
|---|---|
| Staging độc lập và cách ly dữ liệu | Hoạt động. Chủ dự án xác nhận mở được V1.6.7. |
| Hồi quy BTC Historical CES-A | Đạt 20/20 trước và sau sửa kiểm tra EMA200. |
| Altcoin Historical Research | ETH, SOL, AVAX, LINK, OKB và BNB đã hoàn thành. SUI được chủ dự án duyệt bỏ qua cho V1.6.7. |
| Optimizer, Auto Backtest, Live Monitor, Data Hub | Các ca chức năng đã chạy trên Chromium cô lập. |
| Báo cáo và PWA | Đã thử lưu, khôi phục, dừng, copy, đồng bộ giả lập và offline. |
| Đồng bộ tới GitHub thử thật | Đạt. [Ca tích hợp GitHub Actions](https://github.com/Quang-Financial/MIS_Reports_Staging/actions/runs/45632940439) ghi đúng một lần và đọc lại khi gửi trùng. |
| iPhone thật | Chủ dự án duyệt bỏ qua trong V1.6.7. Giữ bằng chứng Chromium mobile. |
| Merge và phát hành | Chờ chủ dự án duyệt. |

## Chuẩn bị V1.7.0

- [x] Chốt nguồn đối chiếu V1.6.7 tại commit c4d2768.
- [x] Đối chiếu Auto Backtest và Live Monitor trong cùng cấu hình và thời điểm đóng nến.
- [x] Xác minh cấu trúc và số lượng của báo cáo gốc BTC CES-A 2.000 cấu hình.
- [ ] Quyết định cách thể hiện cấu hình thực thi sau khi Auto áp khóa và bảo toàn Strategy ID.
- [x] Định lượng tác động tuần UTC đầu thiếu nến trên snapshot BTC Bitstamp.
- [x] Sửa warmup tuần đầy đủ trên nhánh V1.7, kiểm chứng BTC 20/20.
- [ ] Hồi quy Altcoin sau sửa và kiểm thử tích hợp trong trình duyệt.
- [ ] Chuẩn hóa snapshot dữ liệu, bao gồm nguồn Fear & Greed có thời điểm công bố nếu có.
- [ ] Mở rộng test trên đầu vào thị trường cố định, Optimizer và Historical Research, bao gồm đồng nhất nguồn BTC gate.
