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
- Xuất CSV, Backup JSON, Nhập JSON để chuyển máy, nút Khôi phục gốc.
- Điện thoại: xem theo ngày, bấm tab T2–CN.
- Thống kê: số môn, số buổi/tuần, số ngày học, số tiết/tuần.

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
  hooks/
    useSchedule.js         # trạng thái dữ liệu: localStorage, học kỳ, thêm/sửa/xóa,
                           # nhập nhanh bằng dán, xuất/nhập file, khôi phục gốc
  components/
    Header.jsx             # header: logo SchedulingApp + tên app + chuyển học kỳ + xuất/nhập
    StatsBar.jsx           # 4 ô thống kê: môn, buổi/tuần, ngày học, tiết/tuần
    ConflictBanner.jsx     # banner cảnh báo các buổi đang trùng tiết
    TodayTomorrow.jsx      # 2 thẻ Hôm nay / Ngày mai
    Toolbar.jsx            # tìm kiếm + lọc theo loại + nút Thêm buổi / Nhập nhanh
    QuickImportModal.jsx   # khung dán nhanh: mỗi buổi một dòng
    WeekGrid.jsx           # lưới tuần desktop + xem theo ngày trên điện thoại
    SessionCard.jsx        # một khối môn trên lưới tuần
    SessionDetailModal.jsx # modal xem chi tiết một buổi
    SessionFormModal.jsx   # form thêm / sửa buổi, có cảnh báo trùng tiết
    Modal.jsx              # khung modal dùng chung
    Row.jsx                # một dòng "nhãn: giá trị" trong modal chi tiết
    Field.jsx              # một field có nhãn trong form
  data/
    seed.js                # dữ liệu gốc HK1 + HK2, chuyển học kỳ
  lib/
    time.js                # giờ từng tiết, kiểm tra trùng tiết, ngày hôm nay
    colors.js              # bảng màu theo môn (PALETTE, colorFor, TYPE_STYLE)
    download.js            # tải chuỗi text xuống máy dưới dạng file
```
