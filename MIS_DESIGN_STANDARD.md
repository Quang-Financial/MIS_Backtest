# MIS — Tiêu chuẩn thiết kế và nghiệm thu V1.4
Ngày 26/11/2026. Tài liệu chuẩn duy nhất; cập nhật thay thế nội dung lỗi thời, không nối thêm ý tưởng trùng. Lịch sử thay đổi lưu bằng Git. Áp dụng cho MIS và tham khảo cho ứng dụng tương lai.

## 1. Mục tiêu
Phức tạp trong xử lý, đơn giản trong sử dụng. Logic chặt chẽ, dữ liệu đáng tin cậy, thao tác thuận tiện, giao diện gọn, hiệu quả. Không cắt chức năng để tối giản.
Giá trị chung: đơn giản, logic, khoa học, hiệu quả, an toàn, cải tiến liên tục. Chủ động phản biện, đánh giá tác động toàn hệ thống, ưu tiên bằng chứng và phương án tối ưu.

## 2. Kiến trúc
Năm tab theo thứ tự Tổng quan → Bộ chỉ báo → Research → Backtest → Data Hub. Dữ liệu và bằng chứng đi theo chiều ngược lại. Một nguồn dữ liệu chuẩn, một engine, một định danh chiến lược, một hồ sơ nghiên cứu, một tín hiệu nhất quán, một quyết định. Cùng snapshot/cutoff/cấu hình phải tái lập tín hiệu. Tách nghiên cứu khỏi chiến lược được duyệt; không tự kích hoạt.

## 3. UI/UX
Một bộ chọn tài sản chung, một điều hướng chính, tránh cuộn lồng và chức năng trùng. Thống nhất typography, màu, khoảng cách, bảng, nút và trạng thái. Mỗi màn hình ưu tiên câu hỏi chính và hành động chính. Áp dụng 80/20 như nguyên tắc ưu tiên chức năng thường dùng; mục tiêu tối đa ba thao tác cho tác vụ thường xuyên, không bỏ bước xác nhận an toàn. Chỉ hiện thông tin thiết yếu mặc định; ghi chú, định nghĩa, phương pháp, tham số phụ và bằng chứng chi tiết mở/đóng bằng nút * cuối dòng/hạng mục, ngay tại chỗ. Nút có nhãn trợ năng, focus, trạng thái mở và vùng chạm đủ lớn. Không giấu cảnh báo rủi ro, dữ liệu thiếu/cũ, lỗi, hard gate không đạt, trạng thái phê duyệt hoặc hành động thiết yếu. Responsive PC/iPhone, không tràn ngang ngoài bảng thực sự cần, không che nội dung, không raw JSON mặc định.

## 4. Năm màn hình
- Tổng quan: giá, trạng thái thị trường, vùng mua, CES, hard gates, hành động/rủi ro; biểu đồ và bằng chứng truy xuất; không đưa công cụ backtest vào đây.
- Bộ chỉ báo: mỗi chỉ báo một dòng, tên/khung/chu kỳ hoặc tham số chính/trọng số/trạng thái; hard gates riêng; chi tiết *; phân biệt ứng viên và cấu hình duyệt.
- Research: kết luận và vùng mua trước, bằng chứng sau; mẫu, chu kỳ độc lập, lợi nhuận kỳ hạn, MAE, phục hồi, OOS; phân biệt giả thuyết, thiếu dữ liệu và kết quả xác thực.
- Backtest: thiết lập chính, kết quả và so sánh A/B; nâng cao thu gọn; ROI/CAGR/MDD/MAE/Calmar, IS/OOS riêng, no-trade khác kết quả dương; không xếp hạng chỉ theo ROI.
- Data Hub: nguồn, phạm vi, độ mới, chất lượng, warmup; nhập/xuất, audit và nhật ký chi tiết theo nhu cầu.

## 5. Kỹ thuật trading
Triết lý đầu tư: tìm vùng mua có lợi thế thay vì dự đoán đáy, thu hồi lợi nhuận theo quy tắc thay vì đoán đỉnh; ưu tiên chỉ báo có bằng chứng, lợi nhuận trong giới hạn rủi ro, chấp nhận đứng ngoài khi chưa đủ điều kiện. Mọi quyết định phải giải thích được hành động, lý do, bằng chứng, rủi ro và điều kiện thay đổi quyết định.
Dữ liệu chuẩn hóa, nến đóng, cutoff UTC rõ, chống look-ahead, phí/trượt giá, tái lập kết quả, kiểm thử đa chu kỳ/OOS, benchmark, không đánh đồng hồi quy với lợi nhuận. Thiếu dữ liệu hoặc cấu hình chưa duyệt phải fail closed; không bịa giá, timestamp hoặc tín hiệu. Fear lịch sử chưa chứng minh thời điểm công bố phải ghi giới hạn. Không tự nới hard gates. Bảo toàn dữ liệu, backup/restore, migration, service worker, kiểm tra lỗi và hiệu năng. Không thay đổi chiến lược, kích hoạt, merge/release, mất dữ liệu, quyền hoặc chi phí nếu chưa được chủ dự án duyệt.

## 6. Nghiệm thu
Thiết kế → triển khai → test → review độc lập → sửa → hồi quy → duyệt kỹ thuật → người dùng nghiệm thu. Mỗi mục PASS/FAIL/BLOCKED có SHA, kỳ vọng/thực tế, cách tái lập và bằng chứng. Kiểm tra cả năm màn hình PC/mobile, trạng thái mở/đóng *, lỗi/thiếu/cũ/loading, reload, thao tác, accessibility, dữ liệu và engine. Phân biệt fixture, dữ liệu thị trường cố định, live và iPhone thật. Không coi smoke test là nghiệm thu UX. Thang điểm đề xuất: trading logic 25, kiến trúc/code 20, UI 15, UX 15, dữ liệu 15, hiệu năng/ổn định 10. Ngưỡng đề xuất 90/100 và không P0/P1 trong phạm vi phát hành; không bù lỗi nghiêm trọng bằng điểm UI. Chỉ chấm khi có bằng chứng.

## 7. Duy trì tài liệu
Mỗi quyết định tối ưu được duyệt cập nhật vào đúng mục, thay thế quy tắc cũ; không lưu các phương án bị loại trong bản chuẩn. Không nhân bản tiêu chuẩn sang các file quản trị khác; chỉ dẫn link. Work và Kiến trúc sư cùng dùng bản mới nhất. Kiến trúc sư chủ động áp dụng tiêu chuẩn cho mọi thiết kế mới và nâng cấp, kể cả khi chủ dự án không nhắc; chủ động phản biện, đề xuất cải tiến và cập nhật tại đúng mục sau khi thống nhất. Tái sử dụng các nguyên tắc chung cho ứng dụng khác, điều chỉnh phần nghiệp vụ theo từng dự án. Quyết định mới ngoài phạm vi đã duyệt cần chủ dự án xác nhận.

## 8. Điều phối trợ lý cá nhân
Trợ lý chủ động đề xuất ý tưởng, phản biện, lập lịch và ưu tiên, chia nhiệm vụ cho Work, giám sát bằng chứng, yêu cầu sửa và nghiệm thu. Chu trình: mục tiêu → phương án → kế hoạch → giao việc → giám sát → nghiệm thu → đúc kết. Khi nhận dự án, trợ lý đề xuất số Work tối thiểu phù hợp độ phức tạp, khả năng song song, phụ thuộc, hạn mức và chi phí; mặc định 1 cho đơn giản, 2 cho phát triển và QA độc lập, 3 cho nghiên cứu/phát triển/QA, 4–5 chỉ khi phân module có lợi. Đây là hướng dẫn linh hoạt, không tự tạo phiên hoặc tăng quyền/chi phí. Giao việc theo đầu vào, đầu ra, phạm vi sở hữu, phụ thuộc, branch và tiêu chí nghiệm thu; tránh sửa cùng file song song, dùng hợp đồng giao diện và snapshot chung. Trợ lý hỗ trợ giải đáp, kiểm tra tiến độ theo mốc, phản biện, tích hợp và báo cáo kết quả; phân biệt giao việc, ACK, thực hiện và nghiệm thu. Mỗi nhiệm vụ có ID, phạm vi, người thực hiện, mốc thời gian, tiêu chí và trạng thái; không báo hoàn thành khi chưa có bằng chứng. Báo cáo ngắn gồm kết quả, vấn đề, quyết định, bước tiếp theo và bài học tái sử dụng; chỉ tích hợp bài học tối ưu đã thống nhất vào đúng mục chuẩn, không trùng lặp. Chủ dự án giữ quyền quyết định quan trọng. Giám sát theo khả năng công cụ và lịch đã được cấp phép; không giả định chạy liên tục hoặc tự kích hoạt phiên Work. Khi có blocker, nêu rõ và đề xuất cách xử lý.
