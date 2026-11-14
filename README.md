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
- Tab **Lịch thi** riêng (màu đỏ): buổi thi + task thi, có ngày thi thì
  đếm ngược.
- Xuất ảnh PNG lưới tuần để share nhóm, và **Tìm giờ trống chung** để
  tìm khung giờ cả nhóm cùng rảnh.

## Mô phỏng đăng ký

Bấm **Mô phỏng đăng ký** trên header để thử xếp lịch *trước* khi đăng ký
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
- **Task & deadline**: thẻ "Task & deadline" dưới widget Hôm nay — thêm
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
- **Lịch thi**: bấm tab **Lịch thi** trên header (màu đỏ). Liệt kê các
  buổi loại "Thi" và task loại "Thi": có ngày thi thì hiện ngày + đếm
  ngược ("còn X ngày" / "Hôm nay" / "Quá hạn"), chưa có ngày thì xếp
  sau theo thứ. Nhập ngày thi trong form thêm/sửa buổi khi chọn loại
  "Thi" (không bắt buộc, không tự bịa ngày). Buổi thi vẫn hiện trên
  lưới tuần bình thường.
- **Xuất ảnh PNG**: menu Cài đặt → "Xuất ảnh PNG" tải file
  `schedulingapp-lich-hoc.png` — lưới tuần vẽ bằng Canvas, tiêu đề +
  giờ theo preset đang dùng, khối môn tô màu như trên web.
- **Tìm giờ trống chung**: cuối trang Lịch học, mục "Tìm giờ trống
  chung". Thêm bạn bằng tên + dán lịch bận của bạn (cùng định dạng dán
  nhanh). App liệt kê 5 khung trống dài nhất (≥ 2 tiết) và bảng giờ
  trống theo ngày. Bạn bè lưu ở localStorage máy này
  (`schedulingapp-friends-v1`). Chia sẻ bằng cách bạn xuất lịch
  (CSV/JSON/.ics) rồi Lộc nhập vào — chưa có lịch chung trực tuyến vì
  app không có backend.

## Kiểm thử & CI

```bash
npm test        # Vitest — 24 test cho logic thuần (giờ tiết, trùng tiết,
                # chấm điểm phương án, import dán nhanh/CSV, xuất .ics, giờ trống)
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
- [ ] Tiếp theo: OCR ảnh chụp lịch, preset giờ thật của các trường khác
  (ghi rõ nguồn), đồng bộ đám mây khi cần (xem bên dưới).

## Có cần backend không?

**Không — với tất cả tính năng tới Phần 4, app vẫn chỉ cần frontend.**
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
  components/
    Header.jsx             # header: logo SchedulingApp + tên app + chuyển view
                           # Lịch học / Mô phỏng / Lịch thi + chuyển học kỳ + menu Cài đặt
                           # (nhắc lịch, xuất .ics, xuất PNG, cài app, khung giờ tiết)
    PresetSettings.jsx     # mục "Khung giờ tiết" trong menu Cài đặt (chọn preset / tự chỉnh)
    ExamList.jsx           # tab Lịch thi: buổi thi + task thi, đếm ngược
    FreeTimeFinder.jsx     # tìm giờ trống chung với bạn bè (lưu localStorage)
    StatsBar.jsx           # 4 ô thống kê: môn, buổi/tuần, ngày học, tiết/tuần
    ConflictBanner.jsx     # banner cảnh báo các buổi đang trùng tiết
    ReminderBanner.jsx     # banner vàng nhắc sắp học / sắp đến hạn
    TodayTomorrow.jsx      # widget "Hôm nay học gì" + Ngày mai (kèm đếm ngược)
    TasksPanel.jsx         # danh sách task & deadline + form thêm + đếm ngược thi
    Toolbar.jsx            # tìm kiếm + lọc theo loại + nút Thêm buổi / Nhập nhanh
    QuickImportModal.jsx   # khung dán nhanh: mỗi buổi một dòng
    WeekGrid.jsx           # lưới tuần desktop + xem theo ngày trên điện thoại
    SessionCard.jsx        # một khối môn trên lưới tuần
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
    colors.js              # bảng màu theo môn (PALETTE, colorFor, TYPE_STYLE)
    download.js            # tải chuỗi text xuống máy dưới dạng file
    ics.js                 # xuất file .ics cho Google Calendar (hàm thuần)
    planScore.js           # chấm điểm phương án + tìm cặp trùng (hàm thuần)
    importers.js           # parser dán web trường / dán nhanh / CSV-TSV (hàm thuần)
    exportPng.js           # vẽ lưới tuần ra ảnh PNG bằng Canvas (hàm thuần + tải file)
    freeTime.js            # tìm giờ trống chung (hàm thuần)
```
