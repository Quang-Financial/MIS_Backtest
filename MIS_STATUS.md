# Trạng thái MIS

Cập nhật ngày 25/11/2026, giờ Việt Nam. Mốc nguồn của đợt kiểm thử là `4acbdacc5399cd51c3b9413f06a5770c95311296` trên `develop/v1.6.7`, PR #3.

[Staging riêng](https://mis-backtest-qa-v167.pointydahlia32.chatgpt.site) yêu cầu đăng nhập chủ tài khoản. Bản thử có sửa icon BTC và kiểm tra đủ 200 tuần hoàn chỉnh để khởi tạo EMA200. Các ca Cloud Work dùng Chromium cô lập, dữ liệu thị trường công khai, không dùng token hoặc dữ liệu đầu tư cá nhân.

Trạng thái: hoàn thành kiểm thử trong phạm vi nghiệm thu đã duyệt, chờ quyết định phát hành. Hồi quy BTC đạt. BNB đã chạy đủ 20 lượt. Chủ dự án duyệt bỏ qua SUI trong phạm vi nghiệm thu V1.6.7. Sáu Altcoin còn lại đã chạy đủ 20 lượt mỗi mã. Đồng bộ qua GitHub API thật đạt trong kho thử riêng tư. Chủ dự án đã mở được Staging V1.6.7 và duyệt bỏ ca iPhone thật khỏi phạm vi nghiệm thu. Production và PR giữ nguyên trạng thái phát hành.

Mã nguồn đã kiểm thử: [5bfbaff](https://github.com/Quang-Financial/MIS_Backtest/commit/5bfbaff35b3ee12fd6fc9aee1903b0f4cbaa9b3d). Xem [CI](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45627252522) và MIS_TEST_REPORT để đối chiếu môi trường và phạm vi.

## V1.7.0 · kiểm tra nền tảng

Sáu ca đối chiếu PASS, mỗi ca 211 mốc tuần. Hai ca tái hiện sai khác về chính sách khóa cấu hình và tuần đầu không đầy đủ. Đây là kiểm thử dữ liệu tổng hợp bằng Auto Backtest core và hàm cập nhật Live Monitor. Chưa kết luận parity cho nguồn dữ liệu hoặc giao diện thực tế. Ghi chi tiết trong MIS_TEST_REPORT.md và tests/engine-parity-results.jsonl.

Kiểm toán snapshot Bitstamp 5.578 nến ngày đã hoàn tất. Sửa riêng điểm bắt đầu dữ liệu đối chứng để bỏ tuần đầu thiếu nến làm mốc EMA200 lùi một tuần. Trên bốn cấu hình, tín hiệu mua không đổi và 20 dòng Historical có cùng kết quả tài chính. Chín dòng đổi giá trị EMA200 lưu trong chi tiết giao dịch. Báo cáo ghi riêng giới hạn của đường dữ liệu và Fear & Greed.

Nhánh V1.7 đã sửa warmup tuần UTC đầy đủ và dùng chung hàm căn dữ liệu cho Live Monitor, Optimizer và Auto Backtest. Test Node và hồi quy BTC 20/20 đã đạt. Còn mở đối chiếu Altcoin sau sửa, cơ chế snapshot chung và khóa cấu hình thực thi.
