# Trạng thái MIS

Cập nhật ngày 25/11/2026, giờ Việt Nam. Mốc nguồn của đợt kiểm thử là `4acbdacc5399cd51c3b9413f06a5770c95311296` trên `develop/v1.6.7`, PR #3.

[Staging riêng](https://mis-backtest-qa-v167.pointydahlia32.chatgpt.site) yêu cầu đăng nhập chủ tài khoản. Bản thử có sửa icon BTC và kiểm tra đủ 200 tuần hoàn chỉnh để khởi tạo EMA200. Các ca Cloud Work dùng Chromium cô lập, dữ liệu thị trường công khai, không dùng token hoặc dữ liệu đầu tư cá nhân.

Trạng thái: hoàn thành kiểm thử trong phạm vi nghiệm thu đã duyệt, chờ quyết định phát hành. Hồi quy BTC đạt. BNB đã chạy đủ 20 lượt. Chủ dự án duyệt bỏ qua SUI trong phạm vi nghiệm thu V1.6.7. Sáu Altcoin còn lại đã chạy đủ 20 lượt mỗi mã. Đồng bộ qua GitHub API thật đạt trong kho thử riêng tư. Chủ dự án đã mở được Staging V1.6.7 và duyệt bỏ ca iPhone thật khỏi phạm vi nghiệm thu. Production và PR giữ nguyên trạng thái phát hành.

Mã nguồn đã kiểm thử: [5bfbaff](https://github.com/Quang-Financial/MIS_Backtest/commit/5bfbaff35b3ee12fd6fc9aee1903b0f4cbaa9b3d). Xem [CI](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45627252522) và MIS_TEST_REPORT để đối chiếu môi trường và phạm vi.

## V1.7.0 · kiểm tra nền tảng

Sáu ca đối chiếu PASS, mỗi ca 211 mốc tuần. Hai ca tái hiện sai khác về chính sách khóa cấu hình và tuần đầu không đầy đủ. Đây là kiểm thử dữ liệu tổng hợp bằng Auto Backtest core và hàm cập nhật Live Monitor. Chưa kết luận parity cho nguồn dữ liệu hoặc giao diện thực tế. Ghi chi tiết trong MIS_TEST_REPORT.md và tests/engine-parity-results.jsonl.

Kiểm toán snapshot Bitstamp 5.578 nến ngày đã hoàn tất. Sửa riêng điểm bắt đầu dữ liệu đối chứng để bỏ tuần đầu thiếu nến làm mốc EMA200 lùi một tuần. Trên bốn cấu hình, tín hiệu mua không đổi và 20 dòng Historical có cùng kết quả tài chính. Chín dòng đổi giá trị EMA200 lưu trong chi tiết giao dịch. Báo cáo ghi riêng giới hạn của đường dữ liệu và Fear & Greed.

Nhánh V1.7 đã sửa warmup tuần UTC đầy đủ và dùng chung hàm căn dữ liệu cho Live Monitor, Optimizer và Auto Backtest. Test Node và hồi quy BTC 20/20 đã đạt. Còn mở đối chiếu Altcoin sau sửa, cơ chế snapshot chung và khóa cấu hình thực thi.

Giao diện V1.7 có năm màn hình chính trên một thanh điều hướng. Các công cụ hiện hữu dùng cùng origin và bộ chọn tài sản trong phiên. Thư viện hiển thị cấu hình Live Monitor đọc và bốn đối chứng. Tập dữ liệu chuẩn dùng chung theo snapshot, vòng đời Strategy ID và nghiên cứu vùng mua là các hạng mục tiếp theo.

### Phản biện V1.7

Xem MIS_REVIEW.md để theo dõi từng P0/P1/P2 và MIS_DECISIONS.md để đối chiếu phạm vi phê duyệt. Ca Node xác nhận giữ đỉnh BTC trước ngày đầu Altcoin và nhãn Live chỉ dùng cho nghiên cứu. Một sai khác chính sách Auto/Live được giữ trong fixture tái hiện. Chưa xác nhận hồi quy Altcoin bằng nến thật hoặc CI trên cùng commit.

Tổng quan V1.7 trực tiếp hiển thị bảng tín hiệu. Biểu đồ nằm trong phần mở rộng tùy chọn. Backtest chứa Optimizer và Auto Backtest; Research chứa Historical Research; Data Hub quản lý dữ liệu; Bộ chỉ báo giữ cấu hình và đối chứng. Công cụ nhúng còn lại tự theo chiều cao nội dung.

### MIS-CDS V1.0

GitHub là kênh trao đổi chính. CDS-001 đã ACK, có sổ liên kết và vòng phản biện/sửa BTC gate ghi nhận trên GitHub. V170-OVERVIEW đã kiểm thử tại 9c684ad trên Cloud, cả hai workflow thành công; đang chờ nhận xét độc lập ở PR #4. Không có tác vụ phụ thuộc PC cho lần bàn giao này.

V170-OVERVIEW: Tổng quan hiện là dashboard chuyên dụng, gồm biểu đồ giá mặc định, vị trí drawdown giả thuyết, đa khung, CES, điều kiện và bằng chứng. Kiểm thử cục bộ đạt. Trạng thái nghiệm thu thiết kế giữ FAIL theo phản biện cho đến lượt review độc lập.

UX-5-SCREENS: trình bày năm màn hình đã chạy qua smoke Chromium desktop/mobile. Tổng quan có khóa nghiên cứu bằng CESAuto.lock, WATCH giả thuyết, và loại trạng thái cũ sau mất dữ liệu. P0 đầy đủ vẫn mở do chưa có snapshot và ID cấu hình thực thi xuyên màn hình.

CDS-002: PASS kích hoạt lượt Work từ PR GitHub, khoảng 10,5 giây trong một lần đo. BLOCKED vòng hai chiều vào đúng hai phiên. Ca thử đã tạm dừng. UX-INDICATOR-LIBRARY đã cập nhật trên Staging và kiểm thử Chromium PC/mobile. V170-P0-CONFIG còn mở.

26/11: P0 parity của hai caller đạt trong fixture cùng snapshot; BTC Historical thực 20/20. Bộ chỉ báo kiểm tra đủ tám loại. CDS-002 xác nhận STOP và bổ sung bằng chứng chống nhận trùng cục bộ.

CDS-002 được ưu tiên theo lệnh 7178436261. Lịch điều phối hiện có đang kích hoạt mỗi giờ; vòng QUESTION → ACK qua Issue #5 đã xác minh trong 101 giây nhờ câu hỏi gần mốc chạy. Lịch giữ nguyên. Trạng thái hai chiều theo sự kiện tiếp tục BLOCKED. Không cập nhật ứng dụng hoặc Staging trong vòng này.

CDS-003 xác minh wake Work 7,31 giây và claim GitHub 1/2, chặn trùng tạo tệp. 0/3 vòng tự động, webhook thử đã tạm dừng. Tiếp tục dùng lịch reviewer hiện có; tạm hoãn UX.

CDS-004: PASS wake 9,20 giây. ACK đơn BLOCKED, phép thử tạm dừng. Chưa xác định nguyên nhân nền tảng; giữ fallback theo giờ.

Hai luồng tiếp tục độc lập. Luồng B bổ sung snapshot ghim và trình bày chỉ báo, có smoke Chromium và replay ETH. Luồng A kiểm tra T01 độc lập để tách connector khỏi đường xuất kết quả.

CDS005 T01 đã đánh thức Work và được tạm dừng sau khoảng 227 giây chưa có đầu ra. T02/T03 chờ xác minh runner; T05/T06 chưa nghiệm thu. Bản thử V1.7 đã cập nhật Staging.

### 26/11/2026 · Kiểm thử bổ sung

PR #4 bổ sung bằng chứng hồi quy dữ liệu thị trường và ca snapshot lỗi trên Chromium. Hai workflow browser smoke và smoke tests của 49aed03 đều PASS ([browser](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45735685328), [smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45735685297)). Xem MIS_TEST_REPORT.md cho phạm vi chính xác. CDS005-T01 đã kết thúc với trạng thái no_update và chưa xác minh được đầu ra. Tác vụ dự phòng theo giờ vẫn hoạt động.

Bổ sung phép chạy thực hai màn hình trên dữ liệu nến đã đóng và Fear & Greed công khai, ghi 1.344/1.344 dòng tuần cùng dữ liệu và cấu hình, 15/15 phép cắt dữ liệu thời điểm đánh giá. SUI vẫn thiếu warmup. Bằng chứng và bản chạy tái lập nằm trong MIS_TEST_REPORT.md.

Parity đường chuẩn đạt trên desktop/mobile Chromium cả khi Auto dùng snapshot và tự tải cùng phản hồi dữ liệu. URL Live Monitor cũ tái hiện sai khác do khóa nghiên cứu EMA200W. Xem số liệu OKB trong MIS_TEST_REPORT.md.
