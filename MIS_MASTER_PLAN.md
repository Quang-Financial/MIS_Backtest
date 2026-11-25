# Kế hoạch phát triển MIS

- **Chủ dự án** duyệt thay đổi chiến lược, merge PR và phát hành.
- **ChatGPT trong cuộc trò chuyện chính** phụ trách kiến trúc, nghiên cứu chiến lược và phản biện kết quả.
- **Codex** triển khai mã, kiểm thử, sửa lỗi kỹ thuật và ghi bằng chứng.

Mã phát triển của V1.6.7 nằm trên `develop/v1.6.7` và được theo dõi qua PR #3. Dùng Cloud Work để chạy kiểm thử, Cloud Browser để kiểm tra giao diện khi có quyền, và GitHub Actions để chạy các kiểm tra lặp lại. Staging dùng origin và dữ liệu thử riêng. Dùng dữ liệu thị trường công khai hoặc bộ dữ liệu thử định danh được. Đồng bộ báo cáo dùng API giả lập hoặc kho thử được cấp quyền riêng.

Trước khi bắt đầu, đọc MIS_STATUS, MIS_TASKS, MIS_ROADMAP và MIS_TEST_REPORT. Kiểm tra commit đầu nhánh, phạm vi và CI. Sau mỗi nhiệm vụ, ghi commit, môi trường, đầu vào, kết quả, bằng chứng và việc còn lại. Tách trạng thái đạt, thất bại và bị chặn. Nếu lỗi có thể sửa trong phạm vi kỹ thuật, tái hiện, sửa, chạy lại phép thử liên quan và hồi quy BTC.

Chủ dự án phê duyệt trước mọi thay đổi chiến lược, merge hoặc phát hành. Dữ liệu cá nhân và Production nằm ngoài môi trường thử.
