# Quyết định của chủ dự án

| Quyết định | Phạm vi |
|---|---|
| GitHub là kênh trao đổi chung | Đọc tài liệu và phản biện trước mỗi nhiệm vụ. Cập nhật tiến độ, commit, test và trạng thái PASS/FAIL/BLOCKED sau mỗi nhiệm vụ. |
| PR riêng cho V1.7 | Dùng PR Draft để phản biện. PR #3 dành cho V1.6.7. |
| V1.7 dùng năm màn hình | Tổng quan → Bộ chỉ báo → Research → Backtest → Data Hub. |
| Quyền quyết định kỹ thuật | Sửa lỗi và kiểm thử trên nhánh phát triển. Merge, phát hành, thay đổi chiến lược hoặc xóa dữ liệu cần phê duyệt riêng. |
| Ngoại lệ nghiệm thu V1.6.7 | Bỏ qua SUI và iPhone thật cho V1.6.7. Không áp dụng ngầm cho V1.7. |

## Lệnh điều phối

| Lệnh | Hiệu lực |
|---|---|
| Đồng ý | Duyệt phương án đang được đề xuất. |
| Triển khai | Giao việc đã duyệt, gồm kiểm thử, review và sửa theo phản hồi. |
| Kiểm tra tiến độ | Đọc trạng thái mới nhất và phản biện. |
| Nghiệm thu | Đánh giá bằng chứng trước quyết định phê duyệt cuối. |
| Tạm dừng | Ngừng nhận nhiệm vụ mới trong phạm vi được nêu, dừng công việc đang chạy nếu có thể và xác nhận trạng thái. |

Nguồn phê duyệt: [MIS-CDS V1.0](https://github.com/Quang-Financial/MIS_Backtest/issues/5).

### 26/11/2026 · Giao tiếp dự phòng trong phiên Cloud

[Quyết định 7180782050](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7180782050) chấp nhận nhịp polling 60 giây làm phương án dự phòng chính thức khi phiên Work đang hoạt động, trong giới hạn đã duyệt. Khi thấy yêu cầu mới, gửi ACK ngắn theo ID trước và phản hồi phân tích riêng. Theo dõi cả thời gian phát hiện → ACK và thời gian đăng → ACK. Chấp nhận bằng chứng vận chuyển của TEMP-POLL-003. Không thêm probe, khởi động lại thử nghiệm đã dừng hoặc thay đổi lịch dự phòng theo giờ. Giao tiếp CDS theo sự kiện vẫn chờ kiểm chứng.
