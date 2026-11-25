# Trạng thái MIS

Cập nhật ngày 25/11/2026, giờ Việt Nam. Mốc nguồn của đợt kiểm thử là `4acbdacc5399cd51c3b9413f06a5770c95311296` trên `develop/v1.6.7`, PR #3.

[Staging riêng](https://mis-backtest-qa-v167.pointydahlia32.chatgpt.site) yêu cầu đăng nhập chủ tài khoản. Bản thử có sửa icon BTC và kiểm tra đủ 200 tuần hoàn chỉnh để khởi tạo EMA200. Các ca Cloud Work dùng Chromium cô lập, dữ liệu thị trường công khai, không dùng token hoặc dữ liệu đầu tư cá nhân.

Trạng thái: đang kiểm thử. Hồi quy BTC đạt. BNB đã chạy đủ 20 lượt. Chủ dự án duyệt bỏ qua SUI trong phạm vi nghiệm thu V1.6.7. Sáu Altcoin còn lại đã chạy đủ 20 lượt mỗi mã. Đồng bộ GitHub mới xác minh bằng API giả lập. Chủ dự án đã mở được Staging V1.6.7 và duyệt bỏ ca iPhone thật khỏi phạm vi nghiệm thu. Production và PR giữ nguyên trạng thái phát hành.

Mã nguồn đã kiểm thử: [5bfbaff](https://github.com/Quang-Financial/MIS_Backtest/commit/5bfbaff35b3ee12fd6fc9aee1903b0f4cbaa9b3d). Xem [CI](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45627252522) và MIS_TEST_REPORT để đối chiếu môi trường và phạm vi.
