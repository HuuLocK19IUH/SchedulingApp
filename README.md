# SchedulingApp — Xếp Lịch Học

Web xếp lịch học cá nhân cho sinh viên — làm để **dùng ngay sau khi đăng ký học phần xong**.
Không backend, không tài khoản, không database. Dữ liệu chỉ lưu trên trình duyệt của bạn (localStorage).

Sinh viên: Nguyễn Hữu Lộc — IUH.

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

Giờ từng tiết nằm ở `src/lib/time.js` (`PERIOD_TIMES`).

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
  components/
    Header.jsx             # header: logo SchedulingApp + tên app + chuyển view
                           # Lịch học / Mô phỏng + chuyển học kỳ + menu Cài đặt
    StatsBar.jsx           # 4 ô thống kê: môn, buổi/tuần, ngày học, tiết/tuần
    ConflictBanner.jsx     # banner cảnh báo các buổi đang trùng tiết
    TodayTomorrow.jsx      # 2 thẻ Hôm nay / Ngày mai
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
  lib/
    time.js                # giờ từng tiết, kiểm tra trùng tiết, ngày hôm nay
    colors.js              # bảng màu theo môn (PALETTE, colorFor, TYPE_STYLE)
    download.js            # tải chuỗi text xuống máy dưới dạng file
    planScore.js           # chấm điểm phương án + tìm cặp trùng (hàm thuần)
    importers.js           # parser dán web trường / dán nhanh / CSV-TSV (hàm thuần)
```
