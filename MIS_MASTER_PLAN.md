# Kế hoạch phát triển MIS

- **Chủ dự án** duyệt thay đổi chiến lược, merge PR và phát hành.
- **ChatGPT trong cuộc trò chuyện chính** phụ trách kiến trúc, nghiên cứu chiến lược và phản biện kết quả.
- **Codex** triển khai mã, kiểm thử, sửa lỗi kỹ thuật và ghi bằng chứng.

Mã phát triển của V1.6.7 nằm trên `develop/v1.6.7` và được theo dõi qua PR #3. Dùng Cloud Work để chạy kiểm thử, Cloud Browser để kiểm tra giao diện khi có quyền, và GitHub Actions để chạy các kiểm tra lặp lại. Staging dùng origin và dữ liệu thử riêng. Dùng dữ liệu thị trường công khai hoặc bộ dữ liệu thử định danh được. Đồng bộ báo cáo dùng API giả lập hoặc kho thử được cấp quyền riêng.

Trước khi bắt đầu, đọc MIS_STATUS, MIS_TASKS, MIS_ROADMAP và MIS_TEST_REPORT. Kiểm tra commit đầu nhánh, phạm vi và CI. Sau mỗi nhiệm vụ, ghi commit, môi trường, đầu vào, kết quả, bằng chứng và việc còn lại. Tách trạng thái đạt, thất bại và bị chặn. Nếu lỗi có thể sửa trong phạm vi kỹ thuật, tái hiện, sửa, chạy lại phép thử liên quan và hồi quy BTC.

Chủ dự án phê duyệt trước mọi thay đổi chiến lược, merge hoặc phát hành. Dữ liệu cá nhân và Production nằm ngoài môi trường thử.

Khi máy tính chủ dự án tắt, Cloud Work có thể sửa mã, kiểm thử với dữ liệu công khai, lưu bằng chứng và cập nhật GitHub. GitHub Actions chạy theo các sự kiện đã cấu hình. Staging dùng máy chủ độc lập. Chỉ các ca xác minh trên thiết bị thật hoặc dữ liệu cục bộ của chủ dự án cần thiết bị tương ứng.

## Kiến trúc V1.7–V2.0

Thanh điều hướng theo thứ tự **Tổng quan → Bộ chỉ báo → Research → Backtest → Data Hub**. Luồng dữ liệu nghiên cứu đi từ Data Hub qua Backtest và Research đến Bộ chỉ báo và Tổng quan. Dùng chung dữ liệu chuẩn, Engine, Strategy ID và hồ sơ nghiên cứu. Tổng quan chỉ sử dụng cấu hình đã phê duyệt và kích hoạt. Các tín hiệu gắn với thời điểm nến đã đóng, cấu hình, phiên bản Engine và phiên bản dữ liệu.

## Phối hợp trên GitHub

Trước mỗi nhiệm vụ đọc MIS_TASKS, MIS_STATUS, MIS_REVIEW, MIS_DECISIONS và thảo luận PR V1.7 mới nhất. Sau nhiệm vụ ghi trạng thái PASS/FAIL/BLOCKED, commit, môi trường, đầu vào và bằng chứng. Các quyết định được chủ dự án duyệt ghi vào MIS_DECISIONS. Trao đổi V1.7 trong PR riêng.
