# MIS — Tiêu chuẩn thiết kế và nghiệm thu V1.0
Ngày 26/11/2026. Tài liệu chuẩn duy nhất; cập nhật thay thế nội dung lỗi thời, không nối thêm ý tưởng trùng. Lịch sử thay đổi lưu bằng Git. Áp dụng cho MIS và tham khảo cho ứng dụng tương lai.

## 1. Mục tiêu
Phức tạp trong xử lý, đơn giản trong sử dụng. Logic chặt chẽ, dữ liệu đáng tin cậy, thao tác thuận tiện, giao diện gọn, hiệu quả. Không cắt chức năng để tối giản.

## 2. Kiến trúc
Năm tab theo thứ tự Tổng quan → Bộ chỉ báo → Research → Backtest → Data Hub. Dữ liệu và bằng chứng đi theo chiều ngược lại. Một nguồn dữ liệu chuẩn, một engine, một định danh chiến lược, một hồ sơ nghiên cứu, một tín hiệu nhất quán, một quyết định. Cùng snapshot/cutoff/cấu hình phải tái lập tín hiệu. Tách nghiên cứu khỏi chiến lược được duyệt; không tự kích hoạt.

## 3. UI/UX
Một bộ chọn tài sản chung, một điều hướng chính, tránh cuộn lồng và chức năng trùng. Thống nhất typography, màu, khoảng cách, bảng, nút và trạng thái. Mỗi màn hình ưu tiên câu hỏi chính và hành động chính. Chỉ hiện thông tin thiết yếu mặc định; ghi chú, định nghĩa, phương pháp, tham số phụ và bằng chứng chi tiết mở/đóng bằng nút * cuối dòng/hạng mục, ngay tại chỗ. Nút có nhãn trợ năng, focus, trạng thái mở và vùng chạm đủ lớn. Không giấu cảnh báo rủi ro, dữ liệu thiếu/cũ, lỗi, hard gate không đạt, trạng thái phê duyệt hoặc hành động thiết yếu. Responsive PC/iPhone, không tràn ngang ngoài bảng thực sự cần, không che nội dung, không raw JSON mặc định.

## 4. Năm màn hình
- Tổng quan: giá, trạng thái thị trường, vùng mua, CES, hard gates, hành động/rủi ro; biểu đồ và bằng chứng truy xuất; không đưa công cụ backtest vào đây.
- Bộ chỉ báo: mỗi chỉ báo một dòng, tên/khung/chu kỳ hoặc tham số chính/trọng số/trạng thái; hard gates riêng; chi tiết *; phân biệt ứng viên và cấu hình duyệt.
- Research: kết luận và vùng mua trước, bằng chứng sau; mẫu, chu kỳ độc lập, lợi nhuận kỳ hạn, MAE, phục hồi, OOS; phân biệt giả thuyết, thiếu dữ liệu và kết quả xác thực.
- Backtest: thiết lập chính, kết quả và so sánh A/B; nâng cao thu gọn; ROI/CAGR/MDD/MAE/Calmar, IS/OOS riêng, no-trade khác kết quả dương; không xếp hạng chỉ theo ROI.
- Data Hub: nguồn, phạm vi, độ mới, chất lượng, warmup; nhập/xuất, audit và nhật ký chi tiết theo nhu cầu.

## 5. Kỹ thuật trading
Dữ liệu chuẩn hóa, nến đóng, cutoff UTC rõ, chống look-ahead, phí/trượt giá, tái lập kết quả, kiểm thử đa chu kỳ/OOS, benchmark, không đánh đồng hồi quy với lợi nhuận. Thiếu dữ liệu hoặc cấu hình chưa duyệt phải fail closed; không bịa giá, timestamp hoặc tín hiệu. Fear lịch sử chưa chứng minh thời điểm công bố phải ghi giới hạn. Không tự nới hard gates. Bảo toàn dữ liệu, backup/restore, migration, service worker, kiểm tra lỗi và hiệu năng. Không thay đổi chiến lược, kích hoạt, merge/release, mất dữ liệu, quyền hoặc chi phí nếu chưa được chủ dự án duyệt.

## 6. Nghiệm thu
Thiết kế → triển khai → test → review độc lập → sửa → hồi quy → duyệt kỹ thuật → người dùng nghiệm thu. Mỗi mục PASS/FAIL/BLOCKED có SHA, kỳ vọng/thực tế, cách tái lập và bằng chứng. Kiểm tra cả năm màn hình PC/mobile, trạng thái mở/đóng *, lỗi/thiếu/cũ/loading, reload, thao tác, accessibility, dữ liệu và engine. Phân biệt fixture, dữ liệu thị trường cố định, live và iPhone thật. Không coi smoke test là nghiệm thu UX. Thang điểm đề xuất: trading logic 25, kiến trúc/code 20, UI 15, UX 15, dữ liệu 15, hiệu năng/ổn định 10. Ngưỡng đề xuất 90/100 và không P0/P1 trong phạm vi phát hành; không bù lỗi nghiêm trọng bằng điểm UI. Chỉ chấm khi có bằng chứng.

## 7. Duy trì tài liệu
Mỗi quyết định tối ưu được duyệt cập nhật vào đúng mục, thay thế quy tắc cũ; không lưu các phương án bị loại trong bản chuẩn. Không nhân bản tiêu chuẩn sang các file quản trị khác; chỉ dẫn link. Work và Kiến trúc sư cùng dùng bản mới nhất. Quyết định mới ngoài phạm vi đã duyệt cần chủ dự án xác nhận.
