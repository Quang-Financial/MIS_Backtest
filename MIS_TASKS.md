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
- [x] Ghép năm màn hình và giữ ngữ cảnh tài sản giữa Live Monitor, Historical Research, Optimizer và Auto Backtest.
- [ ] Tích hợp snapshot nguồn chuẩn từ Data Hub và hồ sơ cấu hình có thể tái lập.

### Phản biện V1.7

Xem MIS_REVIEW.md để theo dõi từng P0/P1/P2 và MIS_DECISIONS.md để đối chiếu phạm vi phê duyệt. Ca Node xác nhận giữ đỉnh BTC trước ngày đầu Altcoin và nhãn Live chỉ dùng cho nghiên cứu. Một sai khác chính sách Auto/Live được giữ trong fixture tái hiện. Chưa xác nhận hồi quy Altcoin bằng nến thật hoặc CI trên cùng commit.

- [x] Tích hợp bảng tín hiệu trực tiếp vào Tổng quan. Chuyển Optimizer và Auto Backtest vào Backtest, Historical Research vào Research.
- [x] Đồng bộ bộ chọn tài sản ngoài cùng, loại điều hướng và bộ chọn lặp trong công cụ nhúng, tự co giãn chiều cao theo nội dung.

## ID điều phối V1.7

| ID | Phạm vi và tiêu chí | Trạng thái | Nhánh, SHA và bằng chứng |
|---|---|---|---|
| CDS-001 | ACK, tám tài liệu quản trị, task ID, một vòng phản biện/sửa công khai, báo cáo PASS/FAIL/BLOCKED. | PASS cho thiết lập và vòng phản biện/sửa có trước; đánh giá độc lập mới của CDS đang mở. | [PR #4](https://github.com/Quang-Financial/MIS_Backtest/pull/4), develop/v1.7.0-review. SHA bàn giao ghi trong [Issue #5](https://github.com/Quang-Financial/MIS_Backtest/issues/5). |
| V170-OVERVIEW | Năm màn hình đúng thứ tự, Live native, một selector, không có tab test lồng hoặc cuộn dọc riêng cho công cụ, giữ Engine và dữ liệu. | PASS kiểm thử đã ghi, chờ review độc lập. | develop/v1.7.0-review · 9c684ad · [browser smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45653094967) · [smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45653095088). |
| V170-P0-CONFIG | Chứng minh cùng cấu hình thực thi, ID/hash và đầu vào cho Auto/Live. | FAIL: còn sai khác khóa đã tái hiện. | develop/v1.7.0-review · aaedfac · tests/engine-parity-results.jsonl. |
| V170-P1-BTC | Giữ BTC gate nhất quán khi đầu lịch sử Altcoin khác BTC. | PASS trên fixture tổng hợp. | develop/v1.7.0-review · aaedfac · tests/engine-parity.test.cjs. |
| V170-P1-MARKET | Snapshot chung, Fear theo thời điểm công bố, hồi quy Altcoin thực và kiểm toán CAGR/OOS. | BLOCKED phần bằng chứng thị trường; FAIL ở phần kiểm toán còn mở. | develop/v1.7.0-review · [chi tiết](MIS_REVIEW.md). |

### V170-OVERVIEW · sửa theo phản biện

Navigation của 9c684ad: PASS. Thiết kế Tổng quan theo phản biện: FAIL cho tới khi kiến trúc sư review lại. Bản sửa đã triển khai và chạy thử Chromium desktop/mobile. Tiêu chí và ảnh trong MIS_TEST_REPORT.md.

### UX-5-SCREENS · MIS_EXECUTE 7168724581

- [x] V170-OVERVIEW: reset đồng bộ khi refresh, lỗi hoặc đổi tài sản. WATCH nghiên cứu và khóa nghiên cứu Auto/Overview dùng chung.
- [x] Năm màn hình: tóm tắt trước, nhóm nâng cao mở theo nhu cầu, giữ các thao tác và báo cáo hiện hành.
- [ ] V170-P0-CONFIG: định danh/hash bất biến xuyên màn hình, đối chiếu caller trên cùng snapshot, hồ sơ phê duyệt và Legacy Live.
- [ ] Thiết kế so sánh hai báo cáo A/B cạnh nhau khi có hồ sơ nghiên cứu chung. Hai chế độ A/B hiện vẫn chọn được riêng.

### CDS-002 · MIS-CDS V1.1

| ID | Tiêu chí | Bằng chứng |
|---|---|---|
| CDS-002 | Trigger Cloud hai chiều vào đúng phiên Kiến trúc sư và Work, xác thực người gửi và ID tác vụ, chống trùng, lần thử hữu hạn, dừng/phê duyệt rõ ràng. | [Lệnh 7168878074](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7168878074) · [Kết quả kiểm chứng](MIS_REVIEW.md#cds-002--mis-cds-v11). |

- [x] UX-INDICATOR-LIBRARY: tách cấu hình nghiên cứu, bộ lọc bắt buộc và danh sách đối chứng; một hàng mỗi chỉ báo. Kiểm thử và ảnh Chromium lưu trong MIS_TEST_REPORT. Chờ phản biện thiết kế độc lập.

- [x] V170-P0-CONFIG: Auto và Tổng quan dùng cùng hàm xác lập cutoff/snapshot và mã cấu hình; xác minh qua caller trình duyệt trên fixture.
- [x] UX-INDICATOR-DETAIL-QA: bảng sai khác tám loại chỉ báo, ảnh chi tiết, kiểm tra reload và ứng viên.
- [ ] P0 nghiệm thu tổng thể: hồ sơ phê duyệt, snapshot lưu dùng lại, kiểm thử Altcoin thực và phản biện độc lập.
- [ ] CDS-002: định tuyến đúng phiên đích còn BLOCKED. Duy trì STOP và ghi kết quả CAS cục bộ.

**Ưu tiên hiện tại CDS-002:** liên lạc hai chiều trước các cải tiến UX. Đã xác minh [ACK của reviewer theo giờ](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7178509694), tiếp tục giữ STOP và chỉ nghiệm thu chiều ngược khi có ACK GitHub xác minh được.

### CDS-003

- [x] Kiểm tra kích hoạt webhook PR mới với mã riêng và chống trùng trên GitHub.
- [ ] Ba vòng tự động có ACK và mốc thời gian; xác nhận độc lập định tuyến đúng vai trò.
- [x] Giữ lịch dự phòng theo giờ; UX tiếp tục hoãn.

### Triển khai song song

- [x] B: chi tiết chỉ báo có trường dễ đọc và phân biệt tỷ phần/trọng số, kiểm định chưa liên kết ghi rõ.
- [x] B: ghim snapshot tại Tổng quan, dùng lại trong Auto Backtest qua IndexedDB.
- [x] B: xác minh replay ETH trên nến thật và kiểm thử năm màn hình bằng fixture.
- [ ] B: hồi quy thị trường các Altcoin còn lại; review độc lập và provenance Fear.
- [ ] A: ma trận T01–T06, ưu tiên tách output-only ra khỏi thao tác connector.

### Kiểm thử tiếp theo trên PR #4

- PASS: Hồi quy Historical CES-A đối chứng `544b21f` trên dữ liệu OKX đã đóng của SOL, AVAX, LINK, OKB, BNB. ETH có replay riêng ở 49aed03.
- PASS: Auto Backtest từ chối ngày lệch, hash sửa và không dùng snapshot khác tài sản trên Chromium desktop/mobile.
- BLOCKED: SUI chỉ có 185 tuần hoàn chỉnh, EMA200 cần 200. Đối chiếu Live và Backtest trên dữ liệu thị trường qua hai màn hình vẫn cần mở rộng ngoài fixture trình duyệt.
- BLOCKED: CDS005-T01 kết thúc `no_update` sau 475,532 giây, không trả HELLO. T02/T03/T05/T06 chờ bằng chứng mới. Tiếp tục lịch dự phòng theo giờ.

- PASS: Đối chiếu thực thi Tổng quan → snapshot → Auto Backtest trên nến thị trường ở Chromium. 1.344 dòng tín hiệu tuần và 15 phép cắt dữ liệu khớp. Còn kiểm thử hai đường nạp độc lập ngoài snapshot.
- PASS: Hai đường nạp Auto (pinned và nạp độc lập) khớp Tổng quan với dữ liệu thị trường cố định trên Chromium desktop/mobile.
- FAIL: URL Live Monitor cũ có thể khác Tổng quan vì áp bộ lọc theo cấu hình lưu. Đã ghi số liệu OKB cụ thể và chuyển Kiến trúc sư phản biện đường tương thích.
- PASS TEMP-POLL-001: Nhận lệnh thật và gửi một ACK trong cửa sổ kiểm tra Cloud. CDS V1.1 T02/T03/T05/T06 vẫn chờ dữ kiện từ runner hoặc đích Kiến trúc sư độc lập.
- PASS P0-7180120359: Bookmark Live Monitor cũ mở Tổng quan, giữ mã hợp lệ và áp cùng gate sau reload trên desktop/mobile. Kiểm tra thời điểm xuất bản lịch sử của Fear & Greed còn mở.
- PASS 7180497757: Ma trận QA tích hợp năm màn hình, 10 ảnh và log. Bản đóng gói Staging tái lập kết quả market-caller và kiểm tra bookmark. SUI và provenance công bố Fear vẫn còn giới hạn.
- PASS vận chuyển TEMP-POLL-003: 5/5 ACK, 3/5 dưới 60 giây. Áp dụng ACK ngắn trước MIS_REVIEW theo quyết định 7180782050. CDS hai chiều theo sự kiện tiếp tục BLOCKED.
- PASS 7180790510: Ma trận nghiệm thu kỹ thuật và ca cập nhật Service Worker V1.6.7 → gói Staging V1.7 trên origin cô lập. Còn chờ phản biện độc lập; các giới hạn SUI, Fear và iPhone được ghi rõ.
- QA-PILOT-001: Disclosure UI, keyboard/touch, stale/missing recovery and storage regressions run by MIS02; independent retest assigned by pinned SHA on PR #4.

- CDS-V14 REV4: Luồng nghiên cứu vùng, chỉ báo và A/B, trạng thái Live nghiên cứu, sổ paper và danh mục mô phỏng đã chạy được ở vòng dev. MIS03 retest trên SHA ghim. Walk-forward, provenance Fear, đối chứng nhiều chu kỳ và quan sát thật nằm trong backlog tối ưu [ma trận](MIS_TEST_REPORT.md).
