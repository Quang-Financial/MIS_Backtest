# MIS Backtest V1.6.7 · Kết quả kiểm thử Staging

Kiểm thử ngày 25/11/2026 theo giờ Việt Nam. Bản thử dựa trên `develop/v1.6.7` tại `4acbdacc5399cd51c3b9413f06a5770c95311296`. Staging chạy tại một origin riêng và chỉ chủ tài khoản có quyền truy cập. Phiên kiểm thử tự động sử dụng Chromium 141, dữ liệu thị trường công khai, IndexedDB thật và tài khoản GitHub giả lập cho luồng đồng bộ. GitHub Pages Production và PR #3 giữ nguyên.

## Hồi quy BTC

So sánh với `develop/v1.6.6.3` tại `5cc3eab12c4d6fd3d6e944fdf66c94a291ff41e1`. Cả hai chạy Historical Research CES-A trong Chromium trên origin riêng, cùng 5.578 nến Bitstamp BTC/USD, blob Git `5dd55b58604a2d99f08f5d2d857a9ba6a7363607`. Nến cuối ngày 24/11/2026. Vốn giả lập 10.000, phí 0,10%, trượt giá 0,05%, giới hạn MDD 30%, MAE 25%. Toàn bộ 20 dòng báo cáo chi tiết khớp chính xác khi so sánh JSON.

| Ứng viên | ROI toàn kỳ |
|---|---:|
| RA01 | 223,55% |
| RA02 | 223,55% |
| RA03 | 399,68% |
| SMA01 | 248,90% |

## Kiểm thử chức năng

| Hạng mục | Kết quả |
|---|---|
| Trang chủ và biểu đồ | Chuyển các tab, đổi khung sang 1D và hiển thị 399 nến BTC đã đóng từ OKX. |
| Historical Research | Chạy, mở chi tiết, tự lưu, tải lại và khôi phục đủ 20 dòng. Copy AI Quick đủ 20 dòng. Dừng lần mới giữ nguyên báo cáo hoàn chỉnh trước đó. |
| Optimizer | Mở hộp cài đặt, chạy BTC CES-A, lưu nhật ký và khôi phục qua tải lại. Cấu hình kiểm tra có 0 lệnh. |
| Auto Backtest | BTC chạy 100/100 cấu hình, 0 lỗi thực thi, 7 cấu hình thiếu dữ liệu. Khôi phục kết quả sau khi tải lại. Khoảng thời gian sai bị từ chối. |
| Live Monitor | Cập nhật BTC qua nguồn dữ liệu công khai, hiển thị ngày xác nhận UTC 23/11/2026. |
| Data Hub | Nạp 5.578 nến Bitstamp đã xác minh hash, kiểm toán sau khi tải lại, 0 khoảng trống. Import dữ liệu thử, từ chối OHLC hỏng và bảo toàn bản nhập trước đó. |
| Đồng bộ báo cáo | API GitHub Private giả lập nhận đúng 20 dòng. Gửi hai lần chỉ tạo một PUT. Token thử được xóa sau khi tải lại. |
| PWA và offline | Chromium 414 px mở offline đủ 7 đường dẫn đã kiểm tra, gồm trang Compare chuyển sang Optimizer. LocalStorage còn sau khi chuyển offline. |
| Sửa lỗi | Bỏ đường dẫn icon BTC ban đầu trỏ tới tệp không có trong repo. Cơ chế icon nhúng của ứng dụng vẫn chọn BTC và Altcoin theo mã. Kiểm thử PWA chạy lại, xác nhận 0 phản hồi 404 nội bộ. |

## Giới hạn nghiệm thu ban đầu

- Hai mã SUI và BNB thiếu nến theo điều kiện 1.450 ngày. Giữ điều kiện hiện hành và không ghép dữ liệu nguồn khác.
- Đồng bộ qua GitHub đã được kiểm thử bằng API mô phỏng. Staging chặn kết nối tới API GitHub để tránh ghi vào kho báo cáo thật.
- Chrome trên máy người dùng đã mở tới trang đăng nhập của Staging. Kiểm thử chức năng được thực thi trong Chromium cô lập. Chưa có kết quả trên iPhone thật.
- Hồi quy đối chiếu chính xác cho Historical CES-A BTC. Những màn hình và luồng trên được kiểm tra theo các ca đã ghi, chưa bao phủ mọi tổ hợp thiết lập.

## Historical Research cho bảy Altcoin trên bản gốc

Mỗi mã được chạy trong một ngữ cảnh trình duyệt riêng, sử dụng nến spot OKX và BTC gate Bitstamp.

| Mã | Kết quả |
|---|---|
| ETH | Hoàn thành 20 lượt. |
| SOL | Hoàn thành 20 lượt. |
| AVAX | Hoàn thành 20 lượt. |
| LINK | Hoàn thành 20 lượt. |
| OKB | Hoàn thành 20 lượt. |
| SUI | Bị chặn, có 1.302/1.450 ngày dữ liệu. |
| BNB | Bị chặn, có 1.435/1.450 ngày dữ liệu. |

Staging: https://mis-backtest-qa-v167.pointydahlia32.chatgpt.site

[Bằng chứng đợt kiểm thử ban đầu](https://chatgpt.com/library?file_id=libfile_1e62b7cce5f48191a971d9b3c2441419&account_id=personal)

## Kiểm thử lại sau khi sửa kiểm tra EMA200

- Đếm 200 tuần hoàn chỉnh từ các nến ngày liên tục, thay cho ngưỡng xấp xỉ 1.450 ngày. Công thức và điều kiện tín hiệu giữ nguyên.
- BTC: báo cáo chi tiết 20/20 dòng tiếp tục khớp chính xác mốc V1.6.6.3.
- BNB: 1.435 nến ngày có 204 tuần đầy đủ. Historical Research chạy, lưu và khôi phục đủ 20 dòng.
- SUI: ứng dụng từ chối chạy rõ ràng vì có 185 tuần đầy đủ. Chờ nguồn hợp lệ đủ lịch sử hoặc chủ dự án duyệt ngoại lệ phạm vi nghiệm thu.
- Chromium smoke mở bảy đường dẫn, chạy ca khởi tạo EMA200, nhập và khôi phục dữ liệu qua IndexedDB.
- [GitHub Actions · smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45627252587) và [GitHub Actions · browser smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45627252522).
- CI tại commit mã `5bfbaff`: cả hai workflow pull request báo success. Đợt chạy lại dữ liệu thật xác nhận 20 lượt mỗi mã cho ETH, SOL, AVAX, LINK, BNB và OKB. ETH và OKB hoàn thành sau khi chạy riêng với thời gian chờ kiểm thử dài hơn. Biểu đồ BTC 1D cũng đạt khi chạy lại riêng. Kết quả chi tiết ở tests/altcoin-regression-v167.json và tests/btc-browser-regression-v167.json.
- Optimizer BTC có kết quả đạt trên bản thử ban đầu. Trong đợt kiểm tra lại sau sửa, ca Optimizer hết thời gian chờ 180 giây. Cần xác minh lại trước nghiệm thu đầy đủ.
- Chạy lại Optimizer, Auto Backtest (100/100, 0 lỗi, 7 thiếu dữ liệu), Live Monitor, Data Hub và đồng bộ báo cáo đều đạt với bộ nến Bitstamp cố định được phục vụ qua API mô phỏng và bản chụp Fear & Greed. Đồng bộ GitHub dùng API mô phỏng. Xem tests/functional-staging-v167.json. Hai lần chờ quá 180 giây trong đợt dùng API trực tiếp ảnh hưởng Optimizer và Auto Backtest.
- [CI smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45628340685) và [CI browser smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45628340974) đều đạt ở commit `66bef77`. Commit ghi bổ sung bằng chứng này chỉ thay đổi tài liệu và JSON kết quả.

## Phạm vi nghiệm thu cập nhật

Chủ dự án duyệt bỏ qua SUI cho V1.6.7. Kết quả SUI 185/200 tuần được giữ để truy vết. Không sửa danh sách coin hoặc quy tắc EMA200.

Chromium 414 × 896, chế độ mobile/touch: chạy Historical Research BTC, copy AI Quick đủ 20 dòng, dừng lượt tiếp theo và khôi phục báo cáo trước với nội dung khớp chính xác. Ca này dùng bộ Bitstamp cố định. Safari trên iPhone thật vẫn chờ kiểm thử.

CI của commit 2df321e: [smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45628709476) và [browser smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45628706859) đều đạt.

## Xác nhận truy cập và phạm vi

Chủ dự án xác nhận mở được Staging V1.6.7 và duyệt bỏ qua kiểm thử iPhone thật. Ca Chromium mobile vẫn là bằng chứng kiểm thử mô phỏng. CI tại commit bcc347e: [smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45629958363) và [browser smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45629958353) đều đạt.

Đồng bộ thực tế vẫn cần kho thử được cấp quyền riêng. Mã hiện hành giới hạn đích là MIS_Reports và Staging chặn API ghi GitHub. Chỉ các ca mô phỏng đã được xác minh.
