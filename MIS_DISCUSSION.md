# MIS-CDS V1.2 · Sổ trao đổi

[Issue #5](https://github.com/Quang-Financial/MIS_Backtest/issues/5) quản lý giao thức. [PR #4](https://github.com/Quang-Financial/MIS_Backtest/pull/4) quản lý phản biện và thay đổi V1.7. Phản hồi trực tiếp trong issue hoặc PR kèm ID nhiệm vụ. Trang này lưu liên kết và trạng thái bàn giao; chi tiết kỹ thuật nằm trong luồng gốc.

| ID | Trao đổi | Bằng chứng |
|---|---|---|
| CDS-001 | Chủ dự án phê duyệt giao thức, Work tiếp nhận. | [Phê duyệt](https://github.com/Quang-Financial/MIS_Backtest/issues/5) · [ACK](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7168115240) |
| V170-P1-BTC | Kiến trúc sư phản biện BTC gate mất đỉnh trước khi altcoin ra đời. Work sửa và thêm fixture. | [Phản biện](https://github.com/Quang-Financial/MIS_Backtest/pull/3#issuecomment-7167476186) · [Bản sửa](https://github.com/Quang-Financial/MIS_Backtest/commit/aaedfacd2c51cb6a07c7b26a1811ecaf7554bc33) · [PR #4](https://github.com/Quang-Financial/MIS_Backtest/pull/4) |
| V170-OVERVIEW | Work bàn giao Tổng quan native cho kiến trúc sư. | [Bàn giao](https://github.com/Quang-Financial/MIS_Backtest/pull/4#issuecomment-7167868087) |

Kiến trúc sư ghi phản hồi độc lập bằng PASS/FAIL/BLOCKED và ghi SHA đã xem. Work ACK, nêu câu hỏi hoặc blocker, sửa trong phạm vi và phản hồi lại với SHA và bằng chứng. Đọc phản hồi sau mỗi vòng thực hiện. Nhận xét trên GitHub được xử lý khi Work được gọi hoặc khi có tác vụ tự động được thiết lập riêng.

| ID | Trao đổi | Bằng chứng |
|---|---|---|
| CDS-002 | Kiểm chứng đường vận chuyển GitHub PR → Cloud Work → PR, tách khỏi việc tiếp tục phiên Kiến trúc sư. | [Phạm vi](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7168878074) · [ACK](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7168905597) · [PING](https://github.com/Quang-Financial/MIS_Backtest/pull/4#issuecomment-7168917090) |

## Giao thức ba vai trò (V1.2)
MIS01 điều phối duy nhất; MIS02 ghi source; MIS03 QA read-only source, báo cáo độc lập. Issue #5 là control plane, PR #4 là luồng kỹ thuật; mỗi lệnh chỉ đăng một lần, liên kết thay vì sao chép. Envelope: FROM, TO, TASK_ID, REV, TYPE, PRIORITY, REF_SHA (nếu áp dụng), PARENT_COMMENT_ID, nội dung/tiêu chí. Chỉ xử lý lệnh EXECUTE/FIX/STOP đúng vai trò và phạm vi; QUESTION/REVIEW/DONE/ACK không tự sinh lệnh. Shared GitHub login không xác thực riêng từng AI; role label chỉ là quy ước, không cấp quyền mới. Dedupe theo comment ID và TASK_ID+REV+TO, đọc ACK/trạng thái trước thực hiện; một ACK mỗi revision, không ACK của ACK. Một nhiệm vụ chính mỗi Work, hàng đợi ưu tiên P0/P1/P2/P3, STOP ưu tiên, P0 báo điều phối trước khi chuyển việc an toàn. Revision mới chỉ thay thế khi ghi rõ supersedes; không tự hủy việc đang chạy. MIS02 bàn giao SHA cố định, MIS03 review đúng SHA; MIS01 gom findings thành một FIX batch, MIS02 DONE rồi MIS03 retest, MIS01 nghiệm thu. Không lặp polling vô ích: đọc khi bắt đầu/kết thúc mốc, khi BLOCKED và trong polling đang được phép; giữ fallback lịch giờ hiện hữu, không tạo lịch trùng, không restart webhook đã STOP. ACK ngắn trước xử lý; báo cáo khi đổi trạng thái hoặc có blocker, không heartbeat chat. Native wake hai chiều chưa chứng minh; không cam kết độ trễ hoặc chạy nền. Thử trên QA-PILOT-001, đo ACK, trùng lệnh, xung đột, vòng sửa/retest; chỉ PASS khi có bằng chứng. Không merge/release/activation/chi phí/quyền mới.
