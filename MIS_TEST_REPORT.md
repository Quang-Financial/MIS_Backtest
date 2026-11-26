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

## Hoàn tất kiểm thử tích hợp

[GitHub Actions run #1](https://github.com/Quang-Financial/MIS_Reports_Staging/actions/runs/45632940439) đạt trên kho riêng tư Quang-Financial/MIS_Reports_Staging. Phép thử dùng hàm publish của commit e3e731e với danh sách đích đổi riêng trong môi trường kiểm thử. Hai lần gửi cùng báo cáo giả lập trả cùng URL, với đúng một yêu cầu PUT và một lần đọc lại thành công. Dùng GITHUB_TOKEN của workflow trong kho thử. UI đồng bộ đã kiểm thử riêng bằng API giả lập. Staging web vẫn chặn API ghi GitHub.

Hoàn thành phạm vi nghiệm thu đã duyệt gồm BTC và sáu Altcoin. SUI và iPhone thật nằm ngoài phạm vi theo quyết định chủ dự án. Chờ phê duyệt riêng cho merge và phát hành.

## Đối chiếu Engine cho V1.7.0

Mốc V1.6.7 là c4d2768. Chạy `node tests/engine-parity.test.cjs`. Cả Auto Backtest và Live Monitor đều gọi `CESDynamic.signals`, bên dưới gọi `MISCES.signals`. Optimizer cũng gọi cùng Engine. Historical Research gọi với bản đồ Fear rỗng và đường nhập dữ liệu BTC khác, cần đối chiếu riêng.

- PASS 6 ca × 211 mốc tuần. So toàn bộ snapshot tín hiệu gồm điểm CES, cờ mua, drawdown BTC, EMA200, các giá trị chỉ báo và trạng thái đạt của từng điều kiện. Chạy RA01, RA02, RA03, SMA01, cấu hình tổng hợp RSI/EMA/SMA/Fear và ca thiếu Fear. Live cắt dữ liệu tại một mốc đóng nến. Auto nhận thêm 48 ngày tương lai bị biến đổi mạnh. Snapshot tại và trước mốc cắt khớp chính xác. Test kiểm tra điểm và thông báo quyết định trên DOM mô phỏng. Việc tránh look-ahead chỉ được xác minh cho hạng mục và fixture này.
- Sai khác 1: Auto áp khóa drawdown tối thiểu 40% và bắt buộc dưới EMA200. Live đọc cấu hình đã lưu. Fixture 2025-01-20, CES 100, drawdown -0,990099%, Live với ngưỡng 0% và tắt EMA200 cho valid=true. Auto với ngưỡng 40% và bật EMA200 cho valid=false. Cùng Engine, khác cấu hình thực thi.
- Sai khác 2: Engine gốc tính EMA200 từ cả tuần đầu bắt đầu giữa tuần. Fixture 2024-11-04 có 199 tuần đầy đủ nhưng Engine đã trả EMA200 = 179,75443941897242. Validator chặn tập chỉ có 199 tuần đầy đủ. Khi tập dài hơn, tuần đầu thiếu vẫn đi vào seed của Engine. Các chỉ báo động tuần/tháng đã lọc nến tổng hợp đủ ngày.
- Fear & Greed hiện tra theo ngày UTC trong snapshot. Chưa xác minh thời điểm công bố hoặc sửa đổi lịch sử từ nguồn thật. Chưa kiểm thử đồng nhất đường tải dữ liệu và cache ở hai màn hình.
- Không sửa Engine, cấu hình RA01/RA02/RA03/SMA01 hoặc BUY/SELL trong đợt đối chiếu này.

### Báo cáo BTC CES-A 2.000 cấu hình đã nhận

Tệp gzip do chủ dự án cung cấp, SHA-256 `d8e7d9962863642543baff7a6b8e9ebd46d333ad9d16a9b8947671df62e86e63`. Báo cáo Full, partial=false, 2.000 dòng all, 813 dòng results. Đối chiếu trạng thái từng dòng: 813 pass, 836 noTrade, 218 vượt rủi ro (20 MDD, 12 MAE, 186 cả hai), 133 missing và 0 lỗi theo báo cáo. Top 20: 12 chưa giao dịch ngoài mẫu và 8 không đạt. Hạng 1, 2, 7 có 0 lệnh ngoài mẫu. Phép kiểm xác nhận nội dung tệp, không tái lập toàn bộ thử nghiệm hay xác nhận ứng viên. Giữ tệp gốc trong phạm vi riêng tư.

### Kiểm toán warmup trên dữ liệu thị trường cố định

Chạy `node tests/market-warmup-audit.cjs <btcusd-bitstamp.json>`. Bộ kiểm toán xác minh SHA-256 của snapshot Bitstamp BTC/USD 5.578 nến, 2011-08-18 đến 2026-11-24. Đối chứng loại bốn nến ngày của tuần UTC đầu chưa đủ. Đây là kiểm toán độ nhạy của đầu vào, có thể tác động tới cả các chỉ báo dựa trên chuỗi đầu vào; chưa phải bản sửa Engine.

- Mốc có EMA200 hiện tại 2015-06-15. Khi bắt đầu từ tuần đầy đủ, mốc là 2015-06-22. Chênh EMA200 lớn nhất tại các mốc cả hai cùng có giá trị là 0,891299 USD, ở mốc chung cuối là 0,002299 USD.
- So 796 mốc chung mỗi cấu hình RA01, RA02, RA03, SMA01. Không đổi cờ giá dưới EMA200 hoặc tín hiệu hợp lệ. SMA01 đổi điểm tại 2012-03-05, trước khi EMA200 sẵn sàng.
- Báo cáo Historical CES-A đủ 20 dòng mỗi bên. ROI, CAGR, MDD, MAE, số lệnh, trạng thái và funnel giữ nguyên cả 20 dòng. Chín dòng khác nội dung audit giao dịch ở trường ema200. Kết quả JSON được lưu cùng script.

### Đường tải dữ liệu hiện tại

| Đường chạy | Nến | Fear & Greed |
|---|---|---|
| Live Monitor, Optimizer, Auto Backtest | Cùng dùng fullDaily: BTC kết hợp Bitstamp lịch sử và OKX; Altcoin lấy OKX. Các lượt chạy tải riêng, vì vậy chưa bảo đảm dùng cùng snapshot. | fearDaily lấy lịch sử và ánh xạ giá trị theo ngày UTC. |
| Historical Research | BTC và BTC gate từ nguồn chọn qua Data Hub; nến Altcoin dùng fullDaily. | Engine được gọi với Map rỗng. Các cấu hình đối chứng hiện tại không dùng Fear. |

Mã của ứng dụng chỉ lưu giá trị Fear theo ngày. Chưa có bản chụp nguồn kèm thời điểm công bố hoặc phiên bản sửa đổi để chứng minh giá trị nào đã có tại từng thời điểm lịch sử. Kiểm tra nhân quả của Fear trên dữ liệu thật vẫn mở.

### Bản sửa warmup V1.7

Engine chỉ dùng tuần UTC đủ bảy nến ngày cho chỉ báo tuần và yêu cầu BTC gate có tuần xác nhận đầy đủ. Đỉnh BTC vẫn theo các giá cao đã quan sát, kể cả phần dữ liệu đầu chuỗi. Live Monitor, Optimizer và Auto Backtest dùng chung hàm căn khoảng ngày giữa tài sản và BTC, rồi kiểm tra độ phủ. Historical Research giữ các tùy chọn nguồn riêng.

Tám ca Node đạt, bao gồm dữ liệu tương lai biến đổi, Fear thiếu, EMA200 chưa sẵn sàng ở 199 tuần và sẵn sàng đúng ở tuần đầy đủ thứ 200, cùng ca kiểm tra khoảng ngày chồng lấp và thiếu nến. Trên snapshot 5.578 nến BTC, 20/20 dòng khớp trạng thái, chỉ số giao dịch, ngày, hành động, giá, số lượng và tiền mặt với Engine c4d2768. Lần đầu EMA200 hợp lệ là 2015-06-22. Thông tin EMA200 trong audit có thể khác bản cũ. GitHub Actions của commit này cần được xác minh riêng. Chênh lệch khóa cấu hình Auto/Live còn mở.

### Workspace năm màn hình

Thêm kiểm tra trình duyệt cho thứ tự điều hướng, bốn cấu hình đối chứng, ngữ cảnh ETH từ Tổng quan sang Auto Backtest, chuyển vào Data Hub và quay lại bằng lịch sử trình duyệt. Các trang công cụ cũ còn dùng được ở đường dẫn trực tiếp. Bản đồ cấu hình chỉ đọc, chưa tự kích hoạt ứng viên.

Kết quả chạy cục bộ: Chromium 1440 × 900 và 414 × 896 đều đạt điều hướng, chuyển công cụ, ngữ cảnh ETH, EMA200 và nhập/khôi phục Data Hub. Kiểm thử chặn mạng ngoài localhost và dùng dữ liệu OHLC giả lập cho Data Hub. Xem tests/workspace-browser-results.log.

### Phản biện V1.7

Xem MIS_REVIEW.md để theo dõi từng P0/P1/P2 và MIS_DECISIONS.md để đối chiếu phạm vi phê duyệt. Ca Node xác nhận giữ đỉnh BTC trước ngày đầu Altcoin và nhãn Live chỉ dùng cho nghiên cứu. Một sai khác chính sách Auto/Live được giữ trong fixture tái hiện. Chưa xác nhận hồi quy Altcoin bằng nến thật hoặc CI trên cùng commit.

### Tái cấu trúc Tổng quan

Chromium 1440 × 900 và 414 × 896: PASS. Tổng quan có bảng tín hiệu trực tiếp, một bộ chọn tài sản, không có tab chức năng lồng. Mở biểu đồ và cập nhật tín hiệu ETH từ API giả lập với 1.470 nến ngày liên tục. Chuyển sang Auto Backtest giữ ETH và xác nhận chiều cao khung đủ cho toàn bộ nội dung. Research và Data Hub mở đúng công cụ; Data Hub nhập và phục hồi IndexedDB. Đối chiếu Engine, Data Hub và report sync ở Node đều đạt; sai khác chính sách Auto/Live giữ trạng thái cũ. Xem tests/overview-browser-results.log.

### CDS-001 và V170-OVERVIEW

Kiểm tra tại 9c684adf73ec006d8b9f1ac78b772ba1fb3f9b7e: [MIS browser smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45653094967) và [MIS smoke tests](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45653095088) đều completed/success. Kiểm thử đối chiếu Engine đã chạy trên dữ liệu cố định và tổng hợp; điều kiện P0 Auto/Live chưa đạt khi cấu hình thực thi khác nhau. Việc xác nhận giao thức không phải nghiệm thu phát hành V1.7.

### V170-OVERVIEW · Dashboard riêng theo thiết kế

Chromium 1440 × 900 và 414 × 896 đạt kiểm tra năm tab, biểu đồ mặc định, hai cột/stack, bốn KPI, Z0–Z6 giả thuyết, ba khung nghiên cứu, nguồn/as-of/nến xác nhận, CES/ba gate, kết luận và bốn liên kết bằng chứng. Test mô phỏng thiếu dữ liệu, điều kiện CES đạt khi cấu hình chưa phê duyệt và dữ liệu quá cũ. Cả ba ca giữ giải ngân tắt. Giá ticker chỉ hiện khi có dữ liệu OKX hợp lệ trong 15 phút; nến ngày và tuần quá mốc 3/8 ngày được đánh dấu cũ. Node parity, Data Hub và đồng bộ báo cáo chạy lại. P0 parity vẫn có sai khác đã biết. Không thay đổi Engine hoặc BUY/SELL.

- [Desktop 1440 × 900](tests/overview-dashboard-desktop.png) và [Mobile 414 × 896](tests/overview-dashboard-mobile.png) dùng dữ liệu thị trường tổng hợp, không phải kết quả Live.
- [Log Chromium](tests/overview-dashboard-browser.log). Nghiệm thu thiết kế vẫn FAIL theo đánh giá trước cho đến khi kiến trúc sư kiểm tra lại.

### UX-5-SCREENS · Chromium

PASS trên PC 1440 × 900 và mobile 414 × 896. Fixture lưu ngưỡng BTC 0% và tắt EMA200, nhưng Tổng quan hiển thị khóa nghiên cứu 40% và ghi khác cấu hình. Với dữ liệu đủ và CES dưới ngưỡng, vùng giả thuyết đặt WATCH. Ca dữ liệu cũ và refresh thất bại không giữ CES/gate cũ. Ảnh dùng dữ liệu mô phỏng. Các ca Node Engine parity, Data Hub và report sync cũng chạy lại.

| Màn hình | PC | Mobile |
|---|---|---|
| Tổng quan | [PC](tests/ux-overview-desktop.png) | [Mobile](tests/ux-overview-mobile-chromium.png) |
| Bộ chỉ báo | [PC](tests/ux-indicators-desktop.png) | [Mobile](tests/ux-indicators-mobile-chromium.png) |
| Research | [PC](tests/ux-research-desktop.png) | [Mobile](tests/ux-research-mobile-chromium.png) |
| Backtest | [PC](tests/ux-backtest-desktop.png) | [Mobile](tests/ux-backtest-mobile-chromium.png) |
| Data Hub | [PC](tests/ux-data-desktop.png) | [Mobile](tests/ux-data-mobile-chromium.png) |

[Log](tests/ux-five-screens-browser.log). Giữ các quy tắc Engine, dữ liệu, kho báo cáo và các đường dẫn công cụ độc lập.

### CDS-002 · Phương án và ranh giới kiểm thử

| Phương án | Độ trễ | Phạm vi |
|---|---|---|
| Webhook GitHub PR gốc | Theo sự kiện; đo thực tế ở ca thử, chưa có SLA. | PR được phép, bật sự kiện comment/review khi cần. Schema không có comment Issue thường. Scheduled Work chạy một tác vụ riêng. |
| Scheduled Work polling | Chu kỳ nhanh nhất một giờ; nếu sự kiện phân bố đều, thời gian chờ theo lịch trung bình khoảng 30 phút, tối đa danh nghĩa 60 phút cộng thời gian hàng đợi/xử lý. | Có thể kiểm tra Issue #5 qua connector đọc, nhưng vẫn là lượt Work riêng. Chưa bật. |
| OpenAI API hoặc dịch vụ trung gian | Chưa đo. | Thêm chi phí, quyền hoặc hạ tầng. Ngoài phạm vi. |

[OpenAI Help: Scheduled tasks](https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt) và [Work/Codex](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex). Plus đủ điều kiện theo tài khoản/workspace; khả năng tạo trên tài khoản hiện tại được xác nhận qua tác vụ thử. Không kết luận không tiêu hao hạn mức gói. Không cần máy cá nhân chạy liên tục.

Kiểm soát của ca thử: phạm vi PR #4, bật comment người dùng, so khớp GitHub login và toàn bộ marker chứa ID tác vụ, kiểm tra PONG có sẵn, tôn trọng marker STOP, tối đa một lần ghi mỗi lượt chạy. Đây là chống gửi lặp theo kiểm tra trước khi ghi; chưa chứng minh khóa nguyên tử khi các lượt chạy song song. Hai vai trò cùng sử dụng một tài khoản GitHub nên login xác thực tài khoản, chưa phân biệt được vai trò phát lệnh. Nội dung comment không tự cấp quyền hoặc xác nhận merge/phát hành.

### UX-INDICATOR-LIBRARY

Chromium 1440×900 và 414×896 đạt ca đếm đúng một hàng cho mỗi chỉ báo từ cấu hình CESAuto.lock(CESShared.load()), bốn ứng viên đối chứng, tổng trọng số và mã hash. Không đổi cơ chế lưu, quy tắc chiến lược hoặc trạng thái kích hoạt. Mã hash ở bảng là định danh cấu hình nghiên cứu; chưa có hồ sơ Strategy ID được phê duyệt để giao dịch. [PC](tests/indicator-library-desktop.png) · [Mobile](tests/indicator-library-mobile-chromium.png).

### 26/11 · P0 và QA chỉ báo

Auto Backtest và Tổng quan chạy trên Chromium bằng fixture ETH/BTC qua hai giao diện thật. SHA-256 snapshot và cấu hình thực thi trùng, CES 0, BTC và EMA đạt, ngưỡng CES không đạt. Cấu hình lưu 0% và tắt EMA được áp khóa nghiên cứu 40% và bật EMA. Cutoff loại nến ngày UTC chưa đóng và Fear sau ngày dùng. Hồi quy Historical thực trên 5.578 nến Bitstamp giữ 20/20 dòng, chỉ số và khớp lệnh so với V1.6.7. Đây là đối chiếu cùng dữ liệu; chưa có hồ sơ phê duyệt, snapshot lưu dùng lại hoặc hồi quy Altcoin thật ở SHA này.

| Chỉ báo | Tái hiện / kỳ vọng | Sai khác cũ và kiểm tra lại |
|---|---|---|
| RSI | Hàng RSI, p=7, giới hạn 0 | Bỏ q/s dư. Khung, trọng số 0, chi tiết mở/đóng PASS. |
| EMA | EMA 7/20, cắt lên | Bỏ s và ngưỡng không dùng; hiển thị cửa sổ 3 nến. PASS chi tiết. |
| SMA | SMA 7/20, cắt lên | Như EMA. PASS chi tiết. |
| Fear | Fear 1D, giới hạn 0 | Bỏ chu kỳ không dùng. Giá trị 0 hiển thị đúng. PASS chi tiết. |
| RSI/SMA | Cặp 7/20 | Bỏ s; hiển thị phép cắt và cửa sổ. PASS chi tiết. |
| MACD | 7/20/5 | Giữ cả ba chu kỳ, ghi cửa sổ. PASS chi tiết. |
| ADX | p=7, ngưỡng 0 | Bỏ q/s dư, giữ toán tử và ngưỡng 0. PASS chi tiết. |
| BB | Dải trên 7/20, fixture tắt | Hiển thị dải và trạng thái Tắt. PASS chi tiết. |

Cả tám hàng qua kiểm tra số hàng, khung, trọng số, trạng thái và chi tiết sau reload, cùng bốn mục đối chứng có liên kết Research. Bằng chứng kiểm định chưa liên kết tiếp tục ghi rõ. [Ảnh PC mở chi tiết](tests/indicator-detail-desktop.png) · [Ảnh điện thoại mở chi tiết](tests/indicator-detail-mobile-chromium.png) · [log](tests/morning-browser.log).

### CDS-002 · kiểm chứng tiếp

Tác vụ thử vẫn tạm dừng, lần chạy cuối ghi no_update. Không tái kích hoạt. Webhook PR từng đánh thức Work trong khoảng 10,5 giây; không có bằng chứng về PONG hoặc định tuyến vào phiên Kiến trúc sư hiện có. Theo phản biện, cơ chế đọc mỗi giờ hiện hữu chỉ hỗ trợ phát hiện nội dung, chờ danh nghĩa tối đa khoảng 60 phút cộng xử lý; chưa xác minh độ trễ thực. Không cần hành động chủ dự án trong phạm vi hiện hành.

Proof cục bộ dùng compare-and-set cho một Git ref theo repository/PR/comment ID. Một trong tám worker chiếm quyền, lần phát lại bị từ chối. Thiết kế thực tế còn cần phân biệt danh tính theo vai trò và xử lý crash giữa lúc claim và post bằng đối soát nội dung, vì claim không tự bảo đảm đăng comment đúng một lần. Chưa tạo ref thật, trigger mới hay đổi quyền.

### CDS-003 · native relay

Phép thử tách biệt theo [lệnh 7178916202](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7178916202). Webhook lọc PR #4 và tác giả; mỗi lượt đọc lại comment, chỉ nhận marker nguyên văn, kiểm tra chuỗi duy nhất và STOP, claim riêng bằng tạo tệp GitHub, chỉ ghi một bước và không retry nếu trạng thái ghi không chắc chắn. Mốc ARCH-3 là điểm dừng. Các marker mô phỏng hai vai trò nên không dùng để xác nhận quyền hoặc phiên Kiến trúc sư độc lập.

Kiểm tra hai yêu cầu tạo cùng tệp trên nhánh thử: một commit thành công `2998d549`, một HTTP 422 vì tệp đã tồn tại. Đây là kiểm tra quyền claim; tác vụ mất kết nối sau khi claim cần đối soát thủ công thay vì gửi lại mù. Lịch giám sát mỗi giờ giữ nguyên.

### CDS-004 · chẩn đoán và ACK tối giản

CDS-003 run `8e196fbf-657c-8323-936a-605de0a5992f`: bắt đầu 00:42:19.310 UTC, kết thúc 00:45:52.867 UTC (213,56 giây), trạng thái cuối `no_update`. Không có kết quả chi tiết, chat_ref, lỗi hoặc thông báo cần phê duyệt trong dữ liệu truy cập được. Môi trường ghi inherited, chưa xác minh connector thực sự được gọi. Quyền đọc/ghi trực tiếp và lần reviewer theo giờ đã có bằng chứng riêng; không suy ra quyền hoặc nguyên nhân lỗi của lượt webhook.

CDS-004 bỏ claim và ghi tệp, chỉ đọc PR #4/Issue #5, so marker và GitHub login rồi ghi tối đa một ACK lên Issue #5. Issue thường không là nguồn của trigger PR, tránh tự kích hoạt. Kiểm tra trước khi ghi chưa chứng minh chống trùng nguyên tử khi có nhiều lượt song song. Tạo lúc đầu báo giới hạn 5/5, tạo lại sau khi tác vụ kiểm tra CDS-003 đã ở trạng thái tắt. Không đổi quyền hoặc lịch giờ.

### Luồng B · chi tiết chỉ báo và snapshot ghim

- Chromium desktop/mobile: tám nhóm RSI, EMA, SMA, Fear, RSI/SMA, MACD, ADX, BB. Mỗi nhóm có đúng một hàng, khung và trọng số đúng fixture; tỷ phần 0% cho trọng số 0/chỉ báo tắt, 16,67% cho mỗi chỉ báo còn lại. Chi tiết có trường ngữ nghĩa; JSON chỉ hiện khi mở mục kỹ thuật. Ứng viên chưa liên kết bằng chứng ghi đúng trạng thái chờ.
- Auto Backtest đọc snapshot ETH đã ghim từ IndexedDB trong tab khác với mạng ngoài bị chặn. Xác nhận hash snapshot, hash cấu hình, CES và gate khớp Tổng quan. Dùng checkbox rõ ràng; mặc định Auto vẫn tải như trước. Snapshot phải khớp tài sản/ngày và hash. Lưu riêng một bản ghim cho mỗi tài sản trong trình duyệt.
- Dữ liệu thật: 2.000 nến ETH/USDT OKX đã đóng, 2021-06-04 đến 2026-11-24, BTC/USD Bitstamp giữ lịch sử trước ETH. Hai lượt Historical CES-A tái lập 20/20 dòng: 12 thiếu phạm vi, 8 không giao dịch. Đây là replay trên dữ liệu cố định, chưa phải hồi quy sáu Altcoin hoặc parity Live theo thời gian thực. [JSON kết quả](tests/eth-market-results.json).
- [Ảnh PC](tests/indicator-readable-desktop.png) · [ảnh mobile](tests/indicator-readable-mobile.png) · [log](tests/parallel-browser.log).

### Luồng A · ma trận CDS005

| Test | Tiêu chí và trạng thái |
|---|---|
| T01 | Webhook PR #4, đầu ra đúng HELLO CDS005-T01. Prompt cấm mọi công cụ. [START riêng](https://github.com/Quang-Financial/MIS_Backtest/pull/4#issuecomment-7179689853). |
| T02 | BLOCKED bởi T01 chưa xác minh đầu ra. Lượt riêng chỉ đọc ID một comment, trả ID trong kết quả, không ghi. |
| T03 | BLOCKED trước runtime đọc và trả kết quả ổn định. Lượt riêng ghi một ACK sang Issue #5 để tránh tự kích hoạt PR. |
| T04 | So sánh từng lớp. Work hiện tại đọc và ghi được qua GitHub; lịch reviewer đã đo một vòng. Webhook có thời điểm started_at, nhưng chưa ghi env thực thi, chat_ref, tool call hoặc quyền runtime trong kết quả truy cập được. Không quy lỗi vào connector, quyền, cấu hình hay môi trường. |
| T05 | BLOCKED xác minh reviewer độc lập qua sự kiện. Schema gốc có webhook PR; chưa có đích được xác thực cho một phiên Kiến trúc sư riêng hoặc đúng phiên đang có. |
| T06 | BLOCKED, chỉ chạy ba vòng có đối chiếu ID, độ trễ và ngưỡng STOP sau khi T01–T05 đạt. |

Nguồn đối chiếu: [Scheduled Tasks](https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt), [Work/Codex](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex), [GitHub Connector](https://help.openai.com/en/articles/11145903-connecting-github-to-chatgpt). Tác vụ webhook hỗ trợ hoạt động PR được cấp quyền; đọc connector trong Work tương tác không chứng minh thao tác trong lượt webhook. Duy trì lịch dự phòng và STOP các POC cũ.

T01 **PASS wake / BLOCKED đầu ra**. Run c8792726-4858-8320-8c8d-6f222f32912f bắt đầu 01:21:26.177 UTC. Tại 01:25:13 UTC tạm dừng; sau khoảng 227 giây chưa có HELLO, kết quả hoặc lỗi, run vẫn in_progress ở lần đọc cuối trước khi dừng. Kết quả cho thấy hiện tượng có thể tái hiện với prompt không yêu cầu GitHub; chưa biết launcher, runner, output delivery hoặc lý do khác. Giữ T02/T03 tạm chặn để tránh lặp mất kiểm soát.

### 26/11/2026 · Hồi quy Altcoin và snapshot

| Hạng mục | Kết quả |
|---|---|
| SOL, AVAX, LINK, OKB | PASS, mỗi mã 2.000 nến 1D UTC OKX, 20/20 dòng Historical CES-A khớp baseline 544b21f, 285 điểm so sánh BTC Drawdown |
| BNB | PASS, 1.435 nến, 20/20 dòng khớp, 204 điểm so sánh BTC Drawdown |
| SUI | BLOCKED, 1.302 nến và 185 tuần hoàn chỉnh so với yêu cầu 200 |
| Chromium desktop/mobile | PASS, xác minh Auto Backtest với trường hợp ngày sai, hash bị sửa và cách ly ETH/SOL |

Mốc nến cuối 24/11/2026 UTC. Các mã đủ warmup đều có 12 dòng Insufficient Data và 8 dòng No Trade. Kết quả kiểm chứng ổn định khi cấp cùng đầu vào, với Fear & Greed trống. ETH được replay riêng tại 49aed03. [JSON](tests/altcoin-market-regression-results.json) · [log Chromium](tests/altcoin-pinned-browser.log).

Tái lập bằng cách giải nén các tệp OKX trong `tests/fixtures` và lưu mỗi tệp theo tên mã viết hoa, ví dụ `SOL.json`. Chạy `node tests/altcoin-market-regression.cjs <thư-mục-OKX> <btc-bitstamp.json> <checkout-544b21f>`. Dùng SHA-256 của BTC và từng mã trong JSON kết quả để xác nhận đầu vào.

CDS005-T01 · PASS wake / BLOCKED HELLO. Run ghi nhận trạng thái cuối `no_update` lúc 01:29:21.709 UTC, sau 475,532 giây kể từ lúc bắt đầu. `chat_ref` và `latest_result` đều trống. Đã tạm dừng T01 trước khi trạng thái kết thúc. Hiện có bằng chứng rằng sự kiện tới và một lần chạy được ghi nhận. Giai đoạn thực thi prompt và chuyển kết quả còn thiếu telemetry.

### Đối chiếu Tổng quan và Auto Backtest trên nến thị trường lưu cố định

**PASS Chromium desktop.** Kiểm thử đi qua nút Ghim snapshot ở Tổng quan và nút chạy Auto Backtest trên hai trang riêng, cùng IndexedDB cô lập. Cấm mạng ngoài ở trang Auto. So sánh toàn bộ bản ghi tín hiệu tuần từ hai lần gọi Engine, gồm BTC Drawdown, EMA200W, RSI, EMA, SMA RSI, Fear & Greed, chi tiết từng chỉ báo/Hard Filter, điểm CES và trạng thái đủ điều kiện. So sánh thêm hash dữ liệu và cấu hình, ba gate hiển thị, trạng thái đủ điều kiện và điểm CES hiển thị.

| Tài sản | Số dòng tuần khớp | CES tại mốc tuần 23/11/2026 UTC |
|---|---:|---:|
| SOL | 285 | 47,79 |
| AVAX | 285 | 39,12 |
| LINK | 285 | 25,94 |
| OKB | 285 | 41,38 |
| BNB | 204 | 47,79 |

Bộ kiểm thử cắt dữ liệu tại ba ngày đánh giá trên mỗi tài sản và chạy lại từng bản ghi tuần. 15/15 bản ghi khớp với chuỗi đầy đủ, gồm chỉ báo và Hard Filter. Nến tài sản lấy từ OKX, BTC từ Bitstamp, Fear & Greed từ Alternative.me. Snapshot cắt nến và Fear & Greed đến 24/11/2026 UTC. Giá ticker thời gian thực không tham gia bài kiểm thử. Tất cả tín hiệu ở mốc cuối đều chưa đủ điều kiện.

Các đầu vào nén trong `tests/fixtures` và hash trong [JSON kiểm thử](tests/market-caller-parity-results.json). Sau khi giải nén như hướng dẫn hồi quy và mở local server trên cổng 8765, chạy `node tests/market-caller-parity.cjs <thư-mục-OKX> <btcusd-bitstamp.json> <fear-alternative-me.json>` với Playwright và Chromium. Đường kiểm thử gồm Live Monitor tích hợp vào Tổng quan và Auto Backtest qua snapshot đã ghim. Các đường nạp dữ liệu độc lập còn cần một phép so sánh riêng.

### Mở rộng đối chiếu hai đường nạp và URL cũ

- **PASS** trên Chromium desktop 1440×900 và mobile 414×896. Mỗi viewport có 1.344 dòng tuần khớp cho cả hai cách chạy Auto: snapshot đã ghim với mạng ngoài bị chặn, và tự tải từ các phản hồi thị trường đã ghi trong một browser context mới. Hash snapshot, hash cấu hình và Fear & Greed khớp Tổng quan trong cả hai cách chạy. Kiểm tra cắt chuỗi 15/15 mỗi viewport.
- **PASS** trên Chromium desktop/mobile khi chọn SOL trên Auto trong lúc chỉ ETH có snapshot. Auto báo đúng lỗi tài sản/ngày. Chọn lại ETH chạy và lưu thành công.
- **FAIL parity tại URL tương thích cũ `ces_monitor.html`**, tái hiện bằng cấu hình thử nghiệm riêng của browser với BTC Drawdown 0%, bộ lọc EMA200W tắt và ngưỡng điểm 0. Dùng cùng nến OKB và Fear & Greed tại tuần xác nhận 23/11/2026 UTC, cả hai tính điểm 100, giá đóng 82,87 và EMA200W 72,07898178. URL cũ dùng cấu hình lưu nên báo đủ điều kiện. Tổng quan áp khóa nghiên cứu như Auto nên báo giá chưa dưới EMA200. Đây là sai khác chính sách cấu hình đã được ghi nhận bằng fixture; vòng này xác nhận trên trình duyệt với đầu vào thị trường. Cấu hình thử chỉ tồn tại trong browser context riêng.
- **BLOCKED** đối với SUI tại mốc dữ liệu cố định vì 185/200 tuần hoàn chỉnh. Thời điểm thực tế Alternative.me xuất bản từng số liệu lịch sử chưa có trong fixture.

### TEMP-POLL-001 · Giám sát trong phiên Cloud đang hoạt động

Theo [lệnh 7179922441](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7179922441), Work đọc song song hai luồng GitHub bằng nhịp mục tiêu 60 giây, ghi ID comment mới và giữ điều kiện dừng MIS_STOP. Phép thử chạy trong tiến trình giới hạn thời gian của phiên Work, không tạo lịch 60 giây. Tác vụ dự phòng theo giờ đã được xác nhận vẫn bật.

GitHub REST ghi thời điểm đăng lệnh 08:35:18 giờ Việt Nam. Work quan sát lệnh tại 08:35:55.608, chênh khoảng **37,6 giây**. GitHub REST ghi [ACK 7179937702](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7179937702) lúc 08:36:11, **53 giây** từ lúc đăng lệnh. ACK gửi một lần dù yêu cầu được nhắc lại trong Work. Các comment do Work đăng được ghi nhận theo ID và không kích hoạt phản hồi tiếp.

Hai báo cáo thị trường đã chạy lại từ kho GitHub với các đầu vào nén đã commit, kết quả JSON trùng từng byte. Workflow [smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45737427675) và [browser](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45737427683) đều PASS ở 70acba07.

[Log TEMP-POLL-001](tests/temp-poll-001.csv) gồm 16 lần đọc thành công trên mỗi luồng trong 15 phút, tính cả lần đầu và lần tại mốc cuối. Nhịp đo giữa các lần đọc hoàn tất nằm trong 59,230–61,033 giây. [Probe của Kiến trúc sư](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7180119779) đăng 08:46:44, được thấy 08:46:56.290 và [ACK duy nhất](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7180127875) đăng 08:47:09. Thời gian phát hiện khoảng 12,3 giây, đến ACK 25 giây. Lần đọc cuối cũng nhận MIS_FIX trên PR #4. Phép thử kết thúc sau lần đọc cuối và không kéo dài. Lịch dự phòng vẫn theo giờ.

### P0 · Chuyển bookmark Live Monitor cũ về Tổng quan

**PASS** [7180120359](https://github.com/Quang-Financial/MIS_Backtest/pull/4#issuecomment-7180120359), Chromium desktop và mobile. Bookmark cũ có `coin=okb` mở Tổng quan OKB, chỉ chuyển mã tài sản. Tham số thử tắt EMA200 và hạ Drawdown không truyền sang Tổng quan. Thử với cấu hình lưu đã tắt EMA200 như ca tái hiện: tại tuần 23/11/2026 OKB có CES 100, EMA200W vẫn không đạt và trạng thái đủ điều kiện là chưa đạt. Reload giữ tài sản, hash cấu hình/snapshot và trạng thái. Mã ngoài danh sách dùng BTC. Cấu hình lưu đã được xác minh giữ nguyên. [JSON sau sửa](tests/market-caller-parity-results.json). [JSON tái hiện trước sửa](https://github.com/Quang-Financial/MIS_Backtest/blob/70acba07db1bde345a0ac441bdda5f2391242fe0/tests/market-caller-parity-results.json).

Hiện có timestamp bản ghi Alternative.me, chưa có lịch sử thời điểm phát hành và hiệu chỉnh riêng cho từng quan sát. Kiểm thử giới hạn dữ liệu Fear & Greed tại mốc đánh giá và so khớp cả hai đường nạp đã ghi. Kết quả no-trade/thiếu phạm vi của Historical CES-A phản ánh dữ liệu đối chứng. Đánh giá lợi nhuận và xác minh nguồn timestamp công bố là hạng mục khác.

### 26/11/2026 · Kiểm thử tích hợp năm màn hình

Kiểm tra lại build V1.7 từ 677b2bed. Ảnh và log UI lấy từ Chromium cô lập, desktop 1440×900 và mobile 414×896. Giá và dữ liệu trong ảnh lấy từ fixture. Bài so sánh tín hiệu dùng bộ nến thị trường và Fear & Greed cố định riêng. [Log](tests/integration-v17/five-screen.log).

| Màn hình | Điều kiện | Kết quả | Ảnh desktop · mobile |
|---|---|---|---|
| Tổng quan | Hiển thị một bộ chọn tài sản, có trạng thái dữ liệu thiếu/cũ, chuyển đúng màn hình từ bookmark Live Monitor và giữ OKB sau reload | PASS | [Desktop](tests/integration-v17/integration-desktop.png) · [Mobile](tests/integration-v17/integration-mobile-chromium.png) |
| Bộ chỉ báo | Hiển thị tám loại chỉ báo, chi tiết trường, trọng số, trạng thái bật/tắt và bằng chứng ứng viên | PASS | [Desktop](tests/integration-v17/integration-details-desktop.png) · [Mobile](tests/integration-v17/integration-details-mobile-chromium.png) |
| Research | Đi từ bằng chứng vùng mua, mở Historical Research theo yêu cầu và kiểm tra warmup EMA200 theo tuần đầy đủ | PASS | [Desktop](tests/integration-v17/integration-research-desktop.png) · [Mobile](tests/integration-v17/integration-research-mobile-chromium.png) |
| Backtest | Mở Optimizer và Auto Backtest từ tab chuẩn, giữ ETH, khớp hash/điểm/gate, chặn snapshot sai ngày/hash/mã và chạy lại được sau lỗi | PASS | [Desktop](tests/integration-v17/integration-backtest-desktop.png) · [Mobile](tests/integration-v17/integration-backtest-mobile-chromium.png) |
| Data Hub | Dùng ngữ cảnh tài sản chung, nhập fixture, tải lại rồi đọc IndexedDB và kiểm tra chất lượng | PASS | [Desktop](tests/integration-v17/integration-data-desktop.png) · [Mobile](tests/integration-v17/integration-data-mobile-chromium.png) |

Bản đóng gói Staging tái lập JSON đối chiếu thị trường khi chạy lại độc lập. Mỗi viewport đạt 1.344 dòng tuần trên năm Altcoin cho từng đường nạp và 15/15 ca cắt dữ liệu. Bookmark OKB giữ snapshot và trạng thái thiếu gate EMA200W với CES 100 sau reload. Cấu hình lưu được giữ, và ảnh cho thấy đường điều hướng chuẩn. SUI tiếp tục ngoài phạm vi kiểm thử này (185/200 tuần). Nguồn Fear & Greed có timestamp bản ghi; tính sẵn có đúng thời điểm của từng số lịch sử và mốc cập nhật hiệu chỉnh chưa được chứng minh. [JSON thị trường](tests/market-caller-parity-results.json) · [Tài liệu dữ liệu](https://alternative.me/crypto/fear-and-greed-index/#api).

### TEMP-POLL-003 · Năm probe tương tác qua phiên TEMP-POLL-002

Tất cả thời điểm dưới đây ở UTC ngày 26/11/2026. Thời điểm đăng và trả ACK đã đọc từ GitHub REST. Thời điểm phát hiện lấy từ kết quả kết nối Work.

| Probe | Đăng | Phát hiện | Đăng ACK | Đăng → ACK (giây) |
|---|---|---|---|---:|
| 01 | 02:09:59 | 02:10:04.637 | 02:10:10 | 11 |
| 02 | 02:11:51 | 02:12:05.118 | 02:13:05 | 74 |
| 03 | 02:13:02 | 02:13:04.886 | 02:14:11 | 69 |
| 04 | 02:20:27 | 02:21:04.913 | 02:21:10 | 43 |
| 05 | 02:22:23 | 02:23:04.786 | 02:23:09 | 46 |

PASS vận chuyển dự phòng, 5/5 với đúng một ACK mỗi ID, trung bình 48,6 giây. Ba mẫu dưới 60 giây; mẫu 02 và 03 chậm tại đoạn từ phát hiện đến ghi ACK. Đây là kết quả từ các probe tương tác của Kiến trúc sư. [ID và số đo](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7180764023) · [Quyết định](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7180782050).

### Ma trận nghiệm thu kỹ thuật V1.7 · PR #4, yêu cầu 7180790510

| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| Mã ứng dụng trên Staging: a75b7bcd41b76b563a648e04b59c80376106d74e | PASS | Gói Staging commit 5d1effe808fe88fa5f7b156280e1cdb9e15ca126 có ba thay đổi chức năng tương ứng. [Staging](https://mis-workspace-v17.pointydahlia32.chatgpt.site). |
| CI nền chứng cứ 063ac14d6b7d1727922d924e6dfd729693643017 | PASS | [Smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45740843464) · [Browser smoke](https://github.com/Quang-Financial/MIS_Backtest/actions/runs/45740843506). |
| Năm màn hình desktop/mobile | PASS với fixture | [Ma trận ảnh 5 màn hình ở trên](#26112026--kiểm-thử-tích-hợp-năm-màn-hình). |
| Cập nhật từ V1.6.7 c4d2768 đến gói Staging V1.7 | PASS với fixture | Dùng một origin cô lập, từ cache Service Worker cũ đến mới. Giữ cấu hình localStorage, báo cáo Auto/Historical và dữ liệu nhập Data Hub qua API lưu của hai phiên bản. Bookmark OKB mở Tổng quan đúng mã khi offline sau cập nhật. [Kết quả](tests/integration-v17/storage-upgrade-stage.json) · [Script](tests/storage-upgrade-v17.cjs). |
| Caller chuẩn, cả ghim và nạp riêng | PASS trên chuỗi thị trường đã đóng | 1.344 bản ghi tuần cho năm Altcoin mỗi viewport, so chi tiết chỉ báo, gate, điểm, trạng thái tín hiệu và hash; 15/15 ca cắt chuỗi. [Kết quả](tests/market-caller-parity-results.json). |
| SUI | BLOCKED ở mốc kiểm toán | Fixture có 185 tuần hợp lệ, EMA200 cần 200. |
| Thời điểm công bố lịch sử Fear & Greed | BLOCKED | Nguồn ghi timestamp bản ghi. Chưa có thời điểm công bố hoặc lịch sử hiệu chỉnh của từng giá trị để xác nhận dữ liệu đã khả dụng đúng lúc. |
| iPhone thật | Chưa kiểm thử | Có kết quả Chromium mobile cho V1.7. iPhone không thuộc vòng QA này. |
| Hoạt hóa và phát hành | Chờ chủ dự án | Các cấu hình vẫn thuộc phạm vi nghiên cứu. Bằng chứng hồi quy tín hiệu không xác nhận lợi nhuận. |

Chạy lại test nâng cấp với Playwright và Chromium bằng `node tests/storage-upgrade-v17.cjs <checkout-c4d2768> <gói-dist-Staging>`. Hai viewport đều đã chạy, tài khoản/dữ liệu đầu tư cá nhân không được dùng.

### Thử quy trình ACK trước xử lý

- 7180789889 đăng 02:25:23 UTC, phát hiện 02:26:05.023, ACK [7180801605](https://github.com/Quang-Financial/MIS_Backtest/issues/5#issuecomment-7180801605) lúc 02:26:10. Từ phát hiện tới ACK khoảng 5,0 giây; toàn tuyến 47 giây.
- 7180790510 đăng 02:25:26 UTC, phát hiện 02:26:05.023, ACK [7180801845](https://github.com/Quang-Financial/MIS_Backtest/pull/4#issuecomment-7180801845) lúc 02:26:11. Từ phát hiện tới ACK khoảng 6,0 giây; toàn tuyến 45 giây.
