# Phản biện kỹ thuật MIS V1.7

Nguồn: [phản biện độc lập](https://github.com/Quang-Financial/MIS_Backtest/pull/3#issuecomment-7167476186). Đối chiếu nhánh workspace tại e4861104 và bản sửa đề xuất trong PR V1.7.

| Mục | Trạng thái | Xử lý và bằng chứng |
|---|---|---|
| P0 · Cấu hình thực thi Auto và Live | FAIL | Auto vẫn khóa drawdown tối thiểu 40% và EMA200. Live dùng cấu hình đang lưu. Bản sửa ghi cấu hình đầu vào, cấu hình thực thi và hai hash trong Auto. Live chỉ hiển thị điều kiện nghiên cứu. Ca gọi hàm cập nhật Live qua DOM giả lập kiểm tra nhãn an toàn. Parity cho ứng viên khác cấu hình vẫn mở, cần hồ sơ phê duyệt và định danh cấu hình theo phiên bản. |
| P1 · BTC gate giữ đỉnh trước khi Altcoin ra đời | PASS | Bốn đường chạy dùng cùng hàm căn ngày cho Altcoin. Giữ tiền sử BTC đến ngày chốt chung. Test đặt đỉnh BTC 1.000 trước ngày bắt đầu ETH và xác nhận BTC/ETH nhận cùng drawdown tại cùng mốc. Phép thử dùng fixture tổng hợp. |
| P1 · Snapshot, cache, Fear | BLOCKED | Khác nguồn giữa Historical và Live. Historical truyền Map Fear rỗng. Engine loại tín hiệu khi chỉ báo Fear được bật mà thiếu giá trị. Chưa có bằng chứng thời điểm công bố Fear trong quá khứ. Còn mở thiết kế snapshot chung, provenance và phân biệt thiếu dữ liệu với chỉ báo tắt trên giao diện. |
| P1 · Hồi quy Altcoin và CI trình duyệt | BLOCKED | Có ca tổng hợp cho gap, tuần/tháng thiếu, UTC, cắt dữ liệu tương lai và start lệch. Cần snapshot Altcoin cố định và CI đúng SHA. Smoke Chromium ở e4861104 xác nhận điều hướng, chưa chứng minh parity end-to-end. |
| P1 · CAGR và OOS | FAIL | Mã hiện tại chọn Top 20 bằng IS trước khi chạy OOS. Benchmark và gate-only được annualize theo IS. Auto tính CAGR OOS theo nến đầu/cuối của OOS. Đường full period cần xác minh tiếp theo từng chỉ số. Top 20 báo cáo gốc có 12 không giao dịch và 8 không đạt, nên 0 lệnh không được tính là thành công. Báo cáo 2.000 lượt giữ riêng tư. |
| P2 · Tích hợp nhánh và kiến trúc | BLOCKED | PR riêng nhắm vào baseline develop/v1.6.7 để thấy toàn bộ diff V1.7. Workspace có năm tab và bằng chứng điều hướng. Còn mở snapshot ID, Strategy ID, provenance, version Engine và quy trình migration/rollback. |

| Yêu cầu follow-up | Trạng thái | Bằng chứng |
|---|---|---|
| Tổng quan trực tiếp, rà chức năng trùng ở năm màn hình | PASS | Chromium 1440 × 900 và 414 × 896. Bảng tín hiệu trực tiếp chạy với dữ liệu ETH giả lập. Điều hướng chính, bộ chọn tài sản, chiều cao khung và việc khôi phục dữ liệu đã kiểm tra. Các trang độc lập cũ và khóa lưu trữ vẫn giữ. |

### CDS-001

ACK và tài liệu điều phối: PASS. Vòng phản biện/sửa BTC gate có trong MIS_DISCUSSION.md. Review lại độc lập của bản Tổng quan và giao thức CDS-001: BLOCKED cho tới khi có nhận xét mới của kiến trúc sư. CI trên SHA 9c684ad: PASS cho cả hai workflow. Các trạng thái P0/P1 còn mở giữ theo bằng chứng ở bảng trên.

### V170-OVERVIEW · phản biện thiết kế

[Phản biện 7168240873](https://github.com/Quang-Financial/MIS_Backtest/pull/4#issuecomment-7168240873): thiết kế FAIL, điều hướng PASS. Bản sửa dùng dashboard riêng và gọi loader/Engine CES. Ảnh và test ở MIS_TEST_REPORT. Chờ kiến trúc sư kiểm tra lại. P0 parity vẫn FAIL; Tổng quan giữ fail-closed và chỉ hiển thị kết quả nghiên cứu.
