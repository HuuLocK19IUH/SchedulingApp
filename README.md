# SchedulingApp — Xếp Lịch Học

Web xếp lịch học cá nhân cho sinh viên — làm để **dùng ngay sau khi đăng ký học phần xong**.
Không backend, không tài khoản, không database. Dữ liệu chỉ lưu trên trình duyệt của bạn (localStorage).

Sinh viên: Nguyễn Hữu Lộc — IUH.

## Demo

Demo: <dán link Vercel của bạn vào đây sau khi deploy>

## Screenshots

Chưa có ảnh chụp thật trong repo — xem hướng dẫn chụp ở
[`docs/screenshots/README.md`](docs/screenshots/README.md) rồi bỏ ảnh
`dashboard.png` và `simulator.png` vào thư mục `docs/screenshots/`.

## Chạy thử

```bash
npm install
npm run dev
```

Mở địa chỉ hiện trên terminal (thường là http://localhost:5173).

Build bản production:

```bash
npm run build
npm run preview
```

## Có gì trong app

- Lưới tuần **Thứ 2 – Chủ nhật × Tiết 1–16**, đúng khung giờ IUH
  (Sáng 1–6, Chiều 7–12, Tối 13–16), mỗi môn một màu, bấm vào khối môn để xem
  mã lớp học phần, phòng, giảng viên, ghi chú.
- Chuyển học kỳ **HK1 / HK2**.
  - HK1: lịch thật từ web sv.iuh.edu.vn, tuần 05/10/2026 — 10 buổi.
  - HK2: bản nháp từ file Excel của Lộc — 6 buổi, chỉ có mã môn
    (QLDA, CNMOI, AUTOMAT, KTTKPM), chưa có tên đầy đủ / phòng / GV.
    Lộc bổ sung sau khi đăng ký học phần HK2 xong.
- Thêm / sửa / xóa buổi học, lịch thi, ca làm việc, sự kiện cá nhân.
  Bấm vào ô trống trên lưới là thêm đúng tiết đó.
- **Cảnh báo trùng tiết** ngay khi thêm/sửa và trên lưới tuần.
- Nhập nhanh bằng cách dán, mỗi buổi một dòng:
  `Tên môn | Thứ | Tiết bắt đầu-Tiết kết thúc | Phòng | GV`
- Xem **Hôm nay / Ngày mai**, lọc theo loại (Học / Thi / Làm việc / Cá nhân),
  tìm theo môn / giảng viên / phòng / mã LHP.
- Xuất CSV, Backup JSON, Nhập JSON để chuyển máy, nút Khôi phục gốc —
  cả 4 gom trong menu **⚙️ Cài đặt** ở header (bấm ra ngoài hoặc bấm Esc để đóng).
- Điện thoại: xem theo ngày, bấm tab T2–CN.
- Thống kê: số môn, số buổi/tuần, số ngày học, số tiết/tuần.
- Nhắc trước giờ học 15/30 phút (banner + thông báo), task & deadline
  gắn vào môn, đếm ngược kỳ thi, xuất .ics sang Google Calendar,
  cài được như app (PWA) trên điện thoại.
- Khung giờ tiết chọn theo trường (mặc định IUH) hoặc tự chỉnh từng tiết
  trong menu Cài đặt → "Khung giờ tiết".
- Mục **Lịch thi** riêng trên sidebar (màu đỏ): buổi thi + task thi, có ngày thi thì
  đếm ngược.
- Xuất ảnh PNG lưới tuần để share nhóm, và **Tìm giờ trống chung** để
  tìm khung giờ cả nhóm cùng rảnh — giờ nằm ở mục riêng trên sidebar.
- **Cá nhân hóa:** giao diện sáng/tối (hoặc theo hệ thống), đổi nền
  dashboard (Mặc định / Hoàng hôn / Rừng xanh / Biển / màu tự chọn),
  gắn icon emoji cho từng buổi học. Xem mục "Cá nhân hóa" bên dưới.
- Điều hướng bằng **sidebar trái** (desktop): Lịch học, Lịch thi,
  Mô phỏng đăng ký, Giờ trống chung, Task & Deadline, Cài đặt — thu gọn
  được về dạng chỉ icon. Trên điện thoại sidebar thành thanh tab ngang.

## Cá nhân hóa

- **Sáng / tối:** nút sáng/tối trên header hoặc cuối sidebar (bấm để
  xoay Sáng → Tối → Theo hệ thống) hoặc trong menu Cài đặt → "Giao
  diện". Chế độ "Theo hệ thống" tự theo giao diện máy, đổi live. Lưu ở
  localStorage key `schedulingapp-theme-v1`.
- **Nền dashboard:** trong menu Cài đặt → "Nền dashboard": Mặc định,
  Hoàng hôn, Rừng xanh, Biển, hoặc Màu tự chọn (bấm ô màu / nhập mã
  hex, ví dụ `#4f46e5`). Nền là gradient; ở dark mode mọi nền tự đổi
  sang bản tối để chữ vẫn đọc được.
- **Icon buổi học:** khi thêm/sửa buổi, chọn 1 trong 16 icon emoji
  (💻 Lập trình, 🧮 Toán/Thống kê, 📝 Thi, …). Buổi chưa chọn icon thì
  dùng icon mặc định theo loại: Học 📚, Thi 📝, Làm việc 💼, Cá nhân ⭐.
  Icon hiện trên khối môn ở lưới tuần, widget Hôm nay, modal chi tiết,
  tab Lịch thi và cả trong mô phỏng đăng ký.

## Thiết kế (Part 6 — UI/UX Pro Max)

Hướng thiết kế: **Bento Grid + Soft UI Evolution** với kỷ luật tối giản
kiểu Thụy Sĩ — một màu nhấn duy nhất (indigo), bóng mềm, chiều sâu nhẹ,
không dùng gradient tím/hồng neon. Token ngữ nghĩa nằm ở `src/index.css`
(`@theme`: background / surface / foreground / primary / border / ring
+ bóng thẻ), giá trị sáng ở `:root`, giá trị tối ở `.dark`; các mặt
chính dùng token (`bg-surface`, `border-border`, `text-foreground`,
`bg-primary`…) thay vì hard-code màu rải rác.

- **Sidebar:** chia nhóm HỌC TẬP / CÔNG CỤ / HỆ THỐNG, mục đang xem là
  pill màu nhấn có vạch chỉ bên trái, cuối sidebar có thẻ user "Nguyễn
  Hữu Lộc · IUH" và chuyển học kỳ HK1/HK2 (chuyển học kỳ chỉ nằm ở
  sidebar — không còn bản sao ở header). Nút sáng/tối ở sidebar chỉ
  hiện đúng tên chế độ ("Sáng" / "Tối" / "Theo hệ thống").
- **Header:** gọn lại — tiêu đề view + ô tìm kiếm kiểu command-palette
  (phím `/` để nhảy vào ô tìm), nút sáng/tối, nút Cài đặt.
- **Thống kê kiểu Bento:** 4 thẻ có icon chip SVG, số lớn, nhãn và dòng
  ngữ cảnh tính từ dữ liệu thật (VD: "5 môn" kèm "10 buổi / tuần"),
  hover nâng nhẹ (tắt khi hệ thống bật giảm chuyển động).
- **Lưới tuần:** cột hôm nay được nhấn nền + nhãn "Hôm nay", vạch
  "Đang học" ở tiết hiện tại (tính theo khung giờ đang dùng), ô trống
  hiện dấu "+" khi rê chuột, khối môn có giờ + phòng tách dòng riêng.
- **Icon:** icon UI chrome dùng SVG inline kiểu Lucide
  (`src/lib/ui-icons.jsx`, không thêm dependency), không dùng emoji làm
  icon điều hướng/nút bấm. Icon emoji của từng buổi học (Part 5) giữ
  nguyên vì đó là lựa chọn trang trí của Lộc.
- **Tiếp cận:** mọi phần tử bấm được có `cursor: pointer` và vòng
  focus thấy rõ; chuyển động ~150ms và tắt hẳn khi
  `prefers-reduced-motion`; tương phản ≥ 4.5:1 ở light mode; bố cục
  responsive 375 / 768 / 1024 / 1440.

## Sửa lỗi UI (Part 7)

- **Ô tìm kiếm (header):** icon kính lúp đè lên placeholder — nguyên
  nhân: class `.input` trong `src/index.css` viết trần (không layer)
  nên thắng utility `pl-9`/`pr-10` của Tailwind, đệm trái thực tế chỉ
  còn 12px. Đã đưa các class dùng chung (`.input`, `.btn-primary`,
  `.btn-ghost`, `.card`) vào `@layer components` để utility thắng đúng
  như ý, tăng đệm lên `pl-10`/`pr-10`, thêm nút xóa (×) khi có chữ
  (gợi ý phím `/` chỉ hiện khi ô trống).
- **Cột "Chủ nhật" xuống dòng:** tiêu đề ngày trên lưới tuần là
  `flex-col` nên huy hiệu "Hôm nay" rớt xuống dòng thứ hai dưới tên
  ngày — thấy rõ nhất vào ngày Chủ nhật. Đã xếp tiêu đề một hàng
  (`flex-row` + `whitespace-nowrap`, huy hiệu nằm cạnh tên ngày),
  nâng chiều rộng tối thiểu của lưới lên 1024px (≈135px/cột).
  Cụm ngày/giờ trong tab Lịch thi cũng giữ nguyên một dòng.
- **Thêm:** chip lọc cuộn ngang một hàng trên mobile; widget Hôm nay
  hiện buổi tiếp theo gần nhất khi hôm nay trống; banner trùng tiết có
  viền trái đỏ dày + icon cảnh báo; trạng thái trống (lưới tuần, ngày
  trên mobile, Lịch thi) có nút làm luôn ("Thêm buổi đầu tiên",
  "Khôi phục lịch gốc"); tên môn/phòng/GV dài được cắt gọn + `title`
  để rê chuột vẫn đọc đủ.

## Sửa lỗi UI (Part 8)

- **Cột "Chủ nhật" bị đẩy khỏi hàng tiêu đề (nguyên nhân thật):** Part 7
  đoán sai — không phải do flex-col. Nguyên nhân thật: nền nhấn cột hôm
  nay trong `WeekGrid.jsx` có `gridRow: '1 / 19'` nên chiếm luôn ô tiêu
  đề của cột hôm nay, trong khi 8 ô tiêu đề (và 16 ô gutter tiết) đều
  auto-placement. CSS Grid đặt ô có vị trí rõ trước, rồi mới xếp các ô
  auto-place vào chỗ còn trống — tiêu đề của cột hôm nay (Chủ nhật khi
  hôm nay là Chủ nhật) không vào được hàng 1 nên rớt xuống hàng 2, cột
  1, đúng chỗ "Chủ nhật + Hôm nay" nằm trên "T1 · Sáng" trong ảnh Lộc
  chụp; đồng thời 16 ô gutter tiết cũng bị đẩy xuống một hàng. Lỗi này
  xảy ra với BẤT KỲ ngày nào vào đúng ngày đó. Đã sửa: nền nhấn chỉ phủ
  các hàng thân lưới (`gridRow: '2 / 18'`), cả 8 ô tiêu đề đặt rõ ràng
  (`gridColumn: i+2`, `gridRow: 1`), 16 ô gutter tiết đặt rõ ràng
  (`gridColumn: 1`, `gridRow: p+2`) — trong lưới tuần không còn ô nào
  auto-placement nên không thể lệch nữa. Lưới thử ở Mô phỏng dùng chung
  `WeekGrid` nên được sửa theo. Vạch "Đang học" đã đặt rõ ràng từ trước
  nên giữ nguyên.
- **Ô tìm kiếm: KHÔNG sửa** — Lộc đã xác nhận "đã ok". Kiểm tra bằng số:
  input `pl-10` (40px) > icon kính lúp `left-3` + rộng 16px (kết thúc ở
  28px) → chừa 12px; `pr-10` (40px) > gợi ý phím `/` (~21px) và nút xóa
  (~20px) ở mép phải → chừa 7–10px. Chữ không thể chạy xuống dưới icon
  hay gợi ý. Ảnh Figma phóng to thấy "Tì" bị che là đọc nhầm (ảnh chụp
  ở độ phân giải thấp).
- **Giờ trống chung thiếu Chủ nhật:** danh sách "Khung giờ trống dài
  nhất" lấy `findFreeSlots` rồi `.slice(0, 5)` — có 6 ngày trống 16 tiết
  (Thứ 3–Chủ nhật) xếp trước Chủ nhật theo thứ tự ngày nên Chủ nhật
  (ngày thứ 6 trong số đó) bị cắt mất, cùng với Thứ 2. Đã thêm hàm
  `longestFreeSlotPerDay` (mỗi ngày tối đa 1 khung dài nhất, không cắt
  top-N) và đổi tiêu đề thành "Khung giờ trống dài nhất mỗi ngày
  (≥ 2 tiết)" để luật hiển thị rõ ràng: Chủ nhật hiện "Tiết 1–16 —
  trống 16 tiết", Thứ 2 hiện "Tiết 10–16 — trống 7 tiết".
- **Thêm:** hộp trống của tab Lịch thi căn giữa theo chiều dọc trong phần
  còn lại của trang (trước đây dính lên đầu, bỏ lại khoảng xanh trống
  lớn phía dưới). Tab Lịch thi không có lưới tuần nên không có gì liên
  quan tới Chủ nhật ở đó — không thêm lưới thi giả.

## Màu ô theo hình thức (Part 9)

Mỗi buổi học trên lưới có nền ô theo **hình thức**, Lộc yêu cầu (nói
muộn, từ đầu quên dặn):

- **Thực hành — xanh lá nhạt** (`#dcfce7`, dark `#14532d`)
- **Lý thuyết — xám nhạt** (`#f1f5f9`, dark `#334155`)
- **Thi — vàng nhạt** (`#fef9c3`, dark `#78350f`)

Quy tắc: nền mã hóa hình thức, còn **viền trái vẫn là màu môn** (tự sinh
từ tên môn như trước) nên các môn vẫn phân biệt được. Chữ giữ màu chữ
của palette môn — đã kiểm chứng tỉ lệ tương phản WCAG trên cả 3 nền
(sáng + tối): cặp tệ nhất 6.08:1, trên chuẩn AA 4.5:1. Buổi 'Làm việc' /
'Cá nhân' giữ nền theo môn như trước (Lộc không yêu cầu đổi).

- **Trường `mode`:** `'theory'` (lý thuyết) / `'practice'` (thực hành),
  chỉ có ý nghĩa khi loại là 'Học'; buổi Thi luôn vàng bất kể mode.
  Buổi cũ (localStorage / JSON backup cũ) chưa có mode vẫn hiện đúng —
  app đoán theo tên môn thay vì crash.
- **Đoán mặc định theo tên môn:** tên chứa "thực hành" thì là thực
  hành, còn lại là lý thuyết. Với lịch thật của Lộc, chỉ 2 buổi "Tiếng
  Việt thực hành" (Thứ 3 tiết 7–9, Thứ 6 tiết 9–10) là thực hành, 8
  buổi HK1 còn lại và cả 6 buổi HK2 là lý thuyết. Đoán sai thì sửa lại
  trong form Sửa buổi (mục "Hình thức" chỉ hiện khi loại là Học).
- **Chỗ hiện màu:** ô trên lưới tuần desktop + Mô phỏng (dùng chung
  `WeekGrid`), xem theo ngày trên mobile, widget "Hôm nay học gì" /
  "Ngày mai", hàng buổi thi trong tab Lịch thi, ảnh PNG xuất ra.
  Chú thích 3 màu nằm ngay trên lưới tuần. Chi tiết buổi hiện dòng
  "Hình thức: Lý thuyết / Thực hành" với buổi Học.
- **Nhập/xuất:** JSON backup mang đủ cả object nên mode giữ nguyên.
  Xuất CSV thêm cột "Hình thức" ở cuối (trống với buổi không phải Học).
  Nhập CSV nhận cột "Hình thức" (thiếu/sai thì đoán theo tên môn); dán
  nhanh và dán từ web trường giữ nguyên định dạng, hình thức đoán theo
  tên môn.

## Sửa lỗi tương tác (Part 10)

- **Bấm buổi học lại mở form thêm mới (lỗi xếp chồng):** các ô trống
  trong lưới có class `relative` (positioned), còn khối môn trước đây
  là static — theo thứ tự vẽ của CSS, phần tử positioned vẽ TRÊN phần
  tử không positioned trong cùng stacking context, bất kể thứ tự DOM,
  nên 112 ô trống trong suốt đè lên khối môn và chặn mọi cú bấm. Đã
  sửa: khối môn thêm `relative` (render sau ô trống trong DOM nên vẽ
  trên) + `stopPropagation()` ở onClick. Bấm buổi học giờ mở đúng
  modal chi tiết; bấm ô trống mới mở form thêm buổi.
- **Chặn lưu trùng tiết (chỉ ở form Lịch học):** bấm Lưu khi form trùng
  tiết với buổi khác thì KHÔNG lưu — hộp đỏ trong form ghi rõ buổi
  trùng (môn + thứ + tiết + phòng) và dặn xóa buổi trùng trước rồi
  thêm lại. Sửa buổi mà không đổi khung giờ thì không bị chặn (đã loại
  chính buổi đang sửa theo id); tiết kề nhau (1–3 rồi 4–6) vẫn lưu
  được. Nút Lưu vẫn hiện — bấm khi đang trùng thì lỗi ở lại, không gọi
  lưu. Lỗi nhập tên trống trước đây dùng `alert()` giờ cũng hiện trong
  modal. KHÔNG chặn: khôi phục seed, dán hàng loạt, nhập CSV/JSON,
  chốt phương án — và form ở Mô phỏng vẫn cho trùng (phương án là giả
  định, trùng tiết được chấm điểm −20/cặp chứ không chặn).
- **Xác nhận xóa:** bấm "Xóa" trong modal chi tiết không xóa ngay nữa
  mà chuyển sang hộp xác nhận trong cùng modal (tên + thứ/tiết buổi,
  [Hủy] quay lại xem chi tiết, [Xóa buổi] mới xóa thật). Cả Lịch học
  lẫn Mô phỏng đều được xác nhận vì dùng chung component.

## Điều hướng

Sidebar trái (desktop, rộng 240px, thu gọn còn 64px bằng nút thu gọn ở
cuối — lựa chọn được nhớ ở localStorage
`schedulingapp-sidebar-v1`): logo + các mục chia nhóm HỌC TẬP (Lịch học,
Lịch thi, Mô phỏng đăng ký), CÔNG CỤ (Giờ trống chung, Task & Deadline),
HỆ THỐNG (Cài đặt); cuối sidebar có thẻ user "Nguyễn Hữu Lộc · IUH",
chuyển học kỳ HK1/HK2 và nút sáng/tối. Trên điện thoại (<md) sidebar thành
thanh tab ngang cuộn được ở đầu trang — không dùng hamburger, mọi mục
đều thấy ngay.

## Mô phỏng đăng ký

Bấm **Mô phỏng đăng ký** trên sidebar để thử xếp lịch *trước* khi đăng ký
thật trên web trường. Mỗi phương án là một lịch thử độc lập, lưu riêng
(localStorage key `schedulingapp-plans-v1`) — lịch chính không bị động
cho tới khi Lộc bấm **Chốt phương án này**.

- Tạo / đổi tên / nhân bản / xóa phương án; thêm lớp bằng form hoặc nhập hàng loạt.
- Lưới thử vẽ đúng lịch cả kỳ, báo trùng ngay (cặp trùng liệt kê cụ thể).
- **Chấm điểm "lịch đẹp"** (hiển thị luôn trong app):
  `100 − 20 × cặp trùng − 8 × (ngày lên trường vượt quá 3) − 3 × tiết buổi tối (tiết ≥ 13) − 1 × tiết trống giữa các ca trong ngày`,
  kẹp tối thiểu 0. Ví dụ: lịch 4 ngày, 3 tiết tối, 2 tiết trống, không trùng → 100 − 8 − 9 − 2 = 81.
- **Bảng so sánh**: mỗi hàng là một tiêu chí (Điểm, Ngày lên trường, Tiết buổi tối,
  Tổng tiết, Cặp trùng, Giờ trống), mỗi cột là một phương án, ô xanh lá là tốt nhất hàng.
- **Chốt phương án**: hỏi xác nhận rồi thay toàn bộ buổi của học kỳ hiện tại
  (HK1/HK2 theo nút chuyển học kỳ) bằng các buổi trong phương án đó.

Phương án mẫu có sẵn (lấy đúng từ seed HK2, không bịa thêm): "HK2 – bản nháp"
(QLDA, CNMOI, AUTOMAT, KTTKPM) và một phương án trống "Phương án B — trống".

### Nhập lớp vào phương án — 3 cách

1. **Dán từ web trường**: copy nguyên đoạn từ trang Lịch học của
   sv.iuh.edu.vn, mỗi buổi một khối cách nhau bằng dòng trống. Mỗi khối cần
   có dòng `Thứ X` và `Tiết: a - b`; thiếu Thứ hoặc Tiết thì app báo lỗi
   chứ không tự đoán. Ví dụ:
   ```
   Đảm bảo chất lượng và Kiểm thử phần mềm
   DHKTPM19BTT - 422000402302
   Tiết: 1 - 3
   Phòng: V12.01
   GV: Châu Thị Bảo Hà
   ```
2. **Dán nhanh**: mỗi buổi một dòng
   `Tên môn | Thứ | Tiết bắt đầu-Tiết kết thúc | Phòng | GV`.
3. **Tải file CSV/TSV**: file `.csv` / `.tsv` / `.txt`, hàng đầu là tiêu đề
   cột (tùy chọn) như `Môn,Thứ,Tiết bắt đầu,Tiết kết thúc,Phòng,GV,Mã`
   hoặc cột `Tiết` dạng `7-9`. Dòng lỗi nào cũng báo rõ lý do.

Chưa có OCR ảnh chụp lịch — đó là bước sau.

## Dùng hàng ngày

- **Nhắc lịch**: vào menu **⚙️ Cài đặt → 🔔 Nhắc lịch**, bật nhắc và
  chọn nhắc trước 15 hoặc 30 phút (mặc định 15 phút). App kiểm tra mỗi
  30 giây khi đang mở: sắp tới giờ học thì hiện banner vàng trên dashboard
  và (nếu Lộc đã cho phép) gửi thông báo trình duyệt. Task loại Thi /
  Deadline đến hạn hôm nay hoặc ngày mai cũng được nhắc trước 1 ngày,
  mỗi task mỗi ngày chỉ nhắc 1 lần. Quyền thông báo chỉ hỏi khi Lộc bật
  nhắc — từ chối cũng không sao, banner trong app vẫn hiện.
  Lưu ý: nhắc chỉ chạy khi tab/app đang mở (trình duyệt không cho web
  chạy nền). Muốn nhắc cả khi đóng app thì cần bản native sau này.
- **Cài app (PWA)**: bản production có manifest + service worker, mở bằng
  điện thoại rồi bấm **Cài đặt app** trong menu Cài đặt (hoặc menu trình
  duyệt → Thêm vào màn hình chính). iPhone: mở bằng Safari → Chia sẻ →
  Thêm vào MH chính. Widget "Hôm nay học gì" là thẻ Hôm nay ngay đầu
  dashboard: mỗi buổi kèm "Bắt đầu sau X phút / Đang học / Đã xong".
  Web không làm được widget ngoài màn hình chính như app native — đó là
  giới hạn của PWA.
- **Task & deadline**: mục "Task & Deadline" riêng trên sidebar — thêm
  task (tên, môn, loại Bài tập / Thi / Deadline / Khác, ngày hết hạn),
  tick để xong, lọc Tất cả / Chưa xong / Đã xong. Task loại Thi bắt buộc
  có ngày thi. Kỳ thi gần nhất hiện ngay đầu thẻ với đếm ngược
  ("còn X ngày" / "Hôm nay" / "Quá hạn X ngày"). Bấm vào một buổi học
  → "＋ Thêm task cho môn này" để tạo task đã điền sẵn môn.
- **Xuất .ics (Google Calendar)**: menu Cài đặt → "Xuất .ics" tải file
  `schedulingapp-lich-hoc.ics` (buổi học lặp hàng tuần 15 tuần + task có
  ngày hết hạn thành sự kiện cả ngày). Rồi vào Google Calendar → Cài đặt
  → Nhập & xuất → Import file đó. Đây là đồng bộ một chiều: sửa lịch
  trong app thì xuất file mới và import lại.

## Khung giờ tiết, Lịch thi, Ảnh PNG, Giờ trống chung

- **Khung giờ tiết**: menu Cài đặt → "Khung giờ tiết". Mặc định là
  IUH (tiết 1 bắt đầu 6:30, tiết 16 kết thúc 21:30) — dữ liệu cũ của Lộc
  không đổi gì. Có thêm preset "Chuẩn 50 phút (mẫu ví dụ)" — chỉ là mẫu
  ví dụ (tiết 50 phút, nghỉ 10 phút, nghỉ trưa sau tiết 6), không phải
  giờ thật của trường nào. Chọn "Tùy chỉnh…" để tự chỉnh từng tiết
  (giờ bắt đầu/kết thúc dạng HH:MM); app chỉ lưu khi đủ 16 tiết, mỗi
  tiết kết thúc sau khi bắt đầu và các tiết xếp theo thứ tự tăng dần,
  sai thì báo lỗi rõ ràng. Đổi khung giờ là đổi giờ khắp app: lưới tuần,
  widget Hôm nay, nhắc lịch, xuất .ics, mô phỏng.
- **Lịch thi**: bấm mục **Lịch thi** trên sidebar (màu đỏ). Liệt kê các
  buổi loại "Thi" và task loại "Thi": có ngày thi thì hiện ngày + đếm
  ngược ("còn X ngày" / "Hôm nay" / "Quá hạn"), chưa có ngày thì xếp
  sau theo thứ. Nhập ngày thi trong form thêm/sửa buổi khi chọn loại
  "Thi" (không bắt buộc, không tự bịa ngày). Buổi thi vẫn hiện trên
  lưới tuần bình thường.
- **Xuất ảnh PNG**: menu Cài đặt → "Xuất ảnh PNG" tải file
  `schedulingapp-lich-hoc.png` — lưới tuần vẽ bằng Canvas, tiêu đề +
  giờ theo preset đang dùng, khối môn tô màu như trên web.
- **Tìm giờ trống chung**: bấm mục **Giờ trống chung** trên sidebar.
  Thêm bạn bằng tên + dán lịch bận của bạn (cùng định dạng dán
  nhanh). App liệt kê 5 khung trống dài nhất (≥ 2 tiết) và bảng giờ
  trống theo ngày. Bạn bè lưu ở localStorage máy này
  (`schedulingapp-friends-v1`). Chia sẻ bằng cách bạn xuất lịch
  (CSV/JSON/.ics) rồi Lộc nhập vào — chưa có lịch chung trực tuyến vì
  app không có backend.

## Kiểm thử & CI

```bash
npm test        # Vitest — 28 test cho logic thuần (giờ tiết, trùng tiết,
                # tiết hiện tại, chấm điểm phương án, import dán nhanh/CSV,
                # xuất .ics, giờ trống, icon mặc định theo loại buổi)
npm run build
```

Mỗi lần push / mở PR lên `main`, GitHub Actions (`.github/workflows/ci.yml`)
chạy `npm ci` → `npm test` → `npm run build` (Node 20). Deploy Vercel tự
động: import repo vào Vercel, Framework Preset **Vite**, Deploy — mỗi lần
push lên `main` là Vercel deploy lại, không cần token hay secret gì thêm.

## Roadmap

- [x] Phần 0 — Dọn dashboard (10/11/2026): bỏ ghi chú dư thừa, gom
  Xuất/Backup/Nhập/Khôi phục vào menu Cài đặt.
- [x] Phần 1 — Mô phỏng đăng ký (14/11/2026): thử xếp lịch trước khi
  đăng ký, so sánh phương án A/B/C, chấm điểm lịch đẹp, import dán/CSV.
- [x] Phần 2 — Dùng hàng ngày (14/11/2026): nhắc lịch, PWA + widget
  Hôm nay, task/deadline, xuất .ics.
- [x] Phần 3 — Cho người khác dùng (14/11/2026): preset khung giờ tiết,
  tab Lịch thi, xuất ảnh PNG, tìm giờ trống chung.
- [x] Phần 4 — Project thật (14/11/2026): Vitest, GitHub Actions CI,
  deploy Vercel tự động, README có Demo/Screenshots/Roadmap.
- [x] Phần 5 — Cá nhân hóa + sidebar (14/11/2026): giao diện sáng/tối,
  nền dashboard tùy chọn, icon cho từng buổi học, sidebar trái
  (desktop) / thanh tab ngang (mobile), Task & Giờ trống chung thành
  mục riêng.
- [x] Phần 6 — UI/UX Pro Max (15/11/2026): hệ token thiết kế (Bento
  Grid + Soft UI Evolution), sidebar chia nhóm + thẻ user, header gọn
  với ô tìm kiếm kiểu command-palette (phím `/`), thẻ thống kê Bento,
  cột hôm nay + vạch "Đang học" trên lưới tuần, icon SVG cho UI chrome,
  sửa 2 lỗi giao diện (chuyển học kỳ trùng ở header + sidebar, nút
  theme ở sidebar ghi "Sáng · sáng").
- [x] Phần 7 — Sửa lỗi UI (15/11/2026): sửa ô tìm kiếm (icon đè lên
  placeholder do `.input` viết trần thắng utility `pl-9` — đã đưa class
  dùng chung vào `@layer components`, thêm nút xóa khi có chữ), sửa
  cột "Chủ nhật" xuống dòng (tiêu đề ngày là flex-col nên huy hiệu
  "Hôm nay" rớt xuống dòng thứ hai — đã xếp một hàng + `whitespace-nowrap`),
  chip lọc cuộn ngang trên mobile, widget Hôm nay hiện buổi tiếp theo
  khi hôm nay trống, banner trùng tiết rõ hơn, trạng thái trống có nút
  làm luôn, cắt gọn tên môn/phòng/GV dài.
- [x] Phần 8 — Sửa lỗi UI (15/11/2026): nguyên nhân thật của cột "Chủ
  nhật" bị đẩy khỏi hàng tiêu đề — nền nhấn cột hôm nay chiếm
  `gridRow: '1 / 19'` nên chiếm luôn ô tiêu đề của cột hôm nay trong khi
  các ô tiêu đề auto-placement (đã sửa: nền nhấn chỉ phủ hàng thân lưới
  `2 / 18`, mọi ô tiêu đề + gutter tiết đặt vị trí rõ ràng); ô tìm kiếm
  KHÔNG sửa vì Lộc đã xác nhận ok và kiểm tra bằng số thấy không còn
  chỗ chồng (pl-10 = 40px > icon kết thúc ở 28px); Giờ trống chung
  thiếu Chủ nhật do `.slice(0, 5)` cắt mất (đã đổi sang khung dài nhất
  mỗi ngày, không cắt top-N); hộp trống Lịch thi căn giữa theo chiều dọc.
- [x] Phần 9 — Màu ô theo hình thức (15/11/2026): thực hành nền xanh
  lá, lý thuyết nền xám nhạt, thi nền vàng nhạt; viền trái vẫn màu môn,
  chữ giữ màu palette (tương phản tệ nhất 6.08:1, trên chuẩn AA 4.5:1);
  trường `mode` + đoán mặc định theo tên môn ("thực hành" -> thực
  hành), form Sửa buổi có mục Hình thức (chỉ khi loại Học), chú thích
  3 màu trên lưới tuần, CSV thêm cột Hình thức.
- [x] Phần 10 — Sửa lỗi tương tác (15/11/2026): bấm buổi học mở đúng
  modal chi tiết (khối môn thêm `relative` để vẽ trên 112 ô trống
  `relative` đang chặn bấm + `stopPropagation()`); form Lịch học chặn
  lưu khi trùng tiết với buổi khác (nêu rõ buổi trùng, dặn xóa trước
  rồi thêm lại), form Mô phỏng vẫn cho trùng để chấm điểm; xóa buổi
  phải xác nhận trong modal (Hủy / Xóa buổi).
- [ ] Tiếp theo: OCR ảnh chụp lịch, preset giờ thật của các trường khác
  (ghi rõ nguồn), đồng bộ đám mây khi cần (xem bên dưới).

## Có cần backend không?

**Không — với tất cả tính năng tới Phần 5, app vẫn chỉ cần frontend.**
Mọi dữ liệu nằm ở localStorage trên máy Lộc. Chỉ khi nào Lộc muốn lịch
chung trực tuyến thật sự (nhiều người cùng xem/sửa một lịch, đăng nhập
tài khoản) mới cần backend. Khi đó hướng gọn nhất là Supabase, chỉ cần
5 bước, chưa cần làm ngay:

1. Tạo project miễn phí ở supabase.com, tạo bảng `schedules`
   (cột: `id`, `user_id`, `data` jsonb, `updated_at`).
2. Bật Row Level Security, cho phép mỗi user chỉ đọc/ghi dòng của mình.
3. Lấy Project URL + anon key, thêm vào Vercel → Environment Variables
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Thêm đăng nhập Google bằng Supabase Auth (1 nút, không tự viết auth).
5. Đổi chỗ đọc/ghi localStorage hiện tại sang đọc/ghi bảng `schedules`
   (giữ localStorage làm cache offline) — logic lịch, điểm, import
   trong `src/lib/` giữ nguyên, không viết lại.

## Dữ liệu lưu ở đâu?

Chỉ trong `localStorage` của trình duyệt, key `xep-lich-hoc-v1`.
Xóa dữ liệu trình duyệt là mất lịch — nên thỉnh thoảng bấm **Backup JSON**
để giữ một bản. Muốn dùng ở máy khác: Backup JSON ở máy cũ, Nhập JSON ở máy mới.

## Deploy lên Vercel (2 bước, không cần biến môi trường)

1. Đẩy thư mục này lên GitHub (repo mới, public hay private đều được).
2. Vào [vercel.com](https://vercel.com) → Add New → Project → chọn repo đó →
   Framework Preset để **Vite** → Deploy. Xong, không cần cài thêm gì.

Vercel tự nhận `npm run build` và thư mục `dist`.

## Thêm học kỳ mới sau này

Mở `src/data/seed.js`, thêm một mục vào `SEMESTERS` và một mảng buổi học
vào `SEED` với cùng id đó, ví dụ `hk3: [ ... ]`. Quy ước:

- `day`: 0 = Thứ 2, 1 = Thứ 3, …, 5 = Thứ 7, 6 = Chủ nhật
- `start` / `end`: tiết bắt đầu / kết thúc (1–16)
- `type`: `'Học' | 'Thi' | 'Làm việc' | 'Cá nhân'`

Giờ từng tiết mặc định nằm ở `src/lib/time.js` (`PERIOD_TIMES`, preset
IUH); đổi khung giờ trong app thì vào menu Cài đặt → "Khung giờ tiết"
(xem mục trên), không cần sửa code.

## ⚠️ Lịch trùng cần kiểm tra lại với web trường

Theo đúng ảnh chụp web trường, **Thứ 6 tiết 9 đang trùng**:

- Lập trình cho thiết bị di động, tiết 7–9, phòng V11.02
- Tiếng Việt thực hành, tiết 9–10, phòng A3.01

App giữ nguyên như dữ liệu gốc và cảnh báo màu đỏ, **không tự sửa**.
Lộc đối chiếu lại trên sv.iuh.edu.vn rồi sửa/xóa buổi sai trong app.

## Công nghệ

Vite + React 19 + Tailwind CSS 4. Không thư viện UI nặng.
Cấu trúc code:

```
src/
  App.jsx                  # chỉ render DashboardPage — không chứa logic
  main.jsx                 # điểm vào React
  index.css                # Tailwind + font
  pages/
    DashboardPage.jsx      # trang chính: gom state giao diện + lắp ráp các component
    SimulatorPage.jsx      # mô phỏng đăng ký: danh sách phương án, lưới thử,
                           # điểm phương án, so sánh, chốt phương án
  hooks/
    useSchedule.js         # trạng thái dữ liệu: localStorage, học kỳ, thêm/sửa/xóa,
                           # nhập nhanh bằng dán, xuất/nhập file, khôi phục gốc, chốt phương án
    usePlans.js            # trạng thái các phương án mô phỏng (localStorage riêng)
    useTasks.js            # task & deadline (localStorage `schedulingapp-tasks-v1`)
    useReminders.js        # nhắc giờ học + thi/deadline, banner + Notification
    useInstallPrompt.js    # bắt sự kiện beforeinstallprompt để hiện nút cài app
    usePreset.js           # khung giờ tiết đang dùng (localStorage `schedulingapp-preset-v1`)
    useTheme.js            # sáng/tối + nền dashboard (localStorage `schedulingapp-theme-v1`,
                           # gắn class .dark lên <html>, theo hệ thống live)
  components/
    Header.jsx             # header gọn: tiêu đề view + ô tìm kiếm (phím "/")
                           # + nút sáng/tối + menu Cài đặt (giao diện, nhắc lịch,
                           # xuất .ics/PNG, cài app, khung giờ tiết) — menu điều
                           # khiển từ DashboardPage
    Sidebar.jsx            # sidebar trái: logo + điều hướng 5 mục chia nhóm
                           # HỌC TẬP / CÔNG CỤ / HỆ THỐNG, thẻ user, chuyển học
                           # kỳ + sáng/tối ở cuối, thu gọn về chỉ icon
    ThemeSettings.jsx      # mục "Giao diện" trong menu Cài đặt (sáng/tối + nền)
    PresetSettings.jsx     # mục "Khung giờ tiết" trong menu Cài đặt (chọn preset / tự chỉnh)
    ExamList.jsx           # mục Lịch thi: buổi thi + task thi, đếm ngược
    FreeTimeFinder.jsx     # tìm giờ trống chung với bạn bè (lưu localStorage)
    StatsBar.jsx           # 4 thẻ thống kê kiểu Bento: icon + số + ngữ cảnh
    ConflictBanner.jsx     # banner cảnh báo các buổi đang trùng tiết
    ReminderBanner.jsx     # banner vàng nhắc sắp học / sắp đến hạn
    TodayTomorrow.jsx      # widget "Hôm nay học gì" + Ngày mai (kèm đếm ngược)
    TasksPanel.jsx         # danh sách task & deadline + form thêm + đếm ngược thi
    Toolbar.jsx            # lọc theo loại + nút Thêm buổi / Nhập nhanh
    QuickImportModal.jsx   # khung dán nhanh: mỗi buổi một dòng
    WeekGrid.jsx           # lưới tuần desktop + xem theo ngày trên điện thoại,
                           # cột hôm nay + vạch "Đang học" + dấu "+" ở ô trống
    SessionCard.jsx        # một khối môn trên lưới tuần (giờ + phòng tách dòng)
    SessionDetailModal.jsx # modal xem chi tiết một buổi
    SessionFormModal.jsx   # form thêm / sửa buổi, có cảnh báo trùng tiết
    PlanCompare.jsx        # bảng so sánh các phương án mô phỏng
    PlanImport.jsx         # panel nhập lớp vào phương án (web trường / dán nhanh / file)
    Modal.jsx              # khung modal dùng chung
    Row.jsx                # một dòng "nhãn: giá trị" trong modal chi tiết
    Field.jsx              # một field có nhãn trong form
  data/
    seed.js                # dữ liệu gốc HK1 + HK2, chuyển học kỳ
    presets.js             # preset khung giờ tiết: IUH (mặc định) + mẫu 50 phút
  lib/
    time.js                # giờ từng tiết, kiểm tra trùng tiết, ngày hôm nay,
                           # lần học tiếp theo, đếm ngược, kiểm tra khung giờ (hàm thuần)
    colors.js              # bảng màu theo môn (PALETTE sáng + tối, colorFor, TYPE_STYLE)
    icons.js               # icon emoji cho buổi học + icon mặc định theo loại (hàm thuần)
    ui-icons.jsx           # icon SVG inline kiểu Lucide cho UI chrome (không dependency)
    theme.js               # nền dashboard: preset gradient + trộn màu tự chọn (hàm thuần)
    download.js            # tải chuỗi text xuống máy dưới dạng file
    ics.js                 # xuất file .ics cho Google Calendar (hàm thuần)
    planScore.js           # chấm điểm phương án + tìm cặp trùng (hàm thuần)
    importers.js           # parser dán web trường / dán nhanh / CSV-TSV (hàm thuần)
    exportPng.js           # vẽ lưới tuần ra ảnh PNG bằng Canvas (hàm thuần + tải file)
    freeTime.js            # tìm giờ trống chung (hàm thuần)
```
