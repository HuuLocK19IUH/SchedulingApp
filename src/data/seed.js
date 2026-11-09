// Dữ liệu thật của Lộc — chép đúng từ ảnh chụp web sv.iuh.edu.vn
// (tuần 05/10/2026) và file Excel HK2 2026-2027. Không bịa thêm môn nào.
// day: 0 = Thứ 2, 1 = Thứ 3, 2 = Thứ 4, 3 = Thứ 5, 4 = Thứ 6, 5 = Thứ 7, 6 = Chủ nhật
// start/end: tiết bắt đầu / tiết kết thúc (1-16)

export const SEMESTERS = [
  { id: 'hk1', name: 'HK1 — 2026-2027', note: 'Lịch thật từ web trường, tuần 05/10/2026' },
  { id: 'hk2', name: 'HK2 — 2026-2027', note: 'Bản nháp từ Excel — chỉ có mã môn, chưa có tên đầy đủ / phòng / GV' },
]

export const SEED = {
  hk1: [
    {
      id: 'hk1-1',
      subject: 'Đảm bảo chất lượng và Kiểm thử phần mềm',
      code: '422000402302',
      className: 'DHKTPM19BTT',
      day: 0, start: 1, end: 3,
      room: 'V12.01 (V CS1)', teacher: 'Châu Thị Bảo Hà', note: '', type: 'Học',
    },
    {
      id: 'hk1-2',
      subject: 'Lập trình WWW (Java)',
      code: '422000395002',
      className: 'DHKTPM19BTT',
      day: 0, start: 4, end: 6,
      room: 'H3.1.1 (H CS1)', teacher: 'Đặng Thị Thu Hà', note: '', type: 'Học',
    },
    {
      id: 'hk1-3',
      subject: 'Lập trình WWW (Java)',
      code: '422000395002',
      className: 'DHKTPM19BTT',
      day: 0, start: 7, end: 9,
      room: 'V7.01 (V CS1)', teacher: 'Đặng Thị Thu Hà', note: '', type: 'Học',
    },
    {
      id: 'hk1-4',
      subject: 'Tiếng Việt thực hành',
      code: '422000363305',
      className: 'DHKTPM19BTT',
      day: 1, start: 7, end: 9,
      room: 'TT.TEAMS', teacher: 'Nguyễn Thị Đức', note: 'Team code: 27adb02', type: 'Học',
    },
    {
      id: 'hk1-5',
      subject: 'Đảm bảo chất lượng và Kiểm thử phần mềm',
      code: '422000402302',
      className: 'DHKTPM19BTT',
      day: 3, start: 1, end: 3,
      room: 'H5.1.1 (H CS1)', teacher: 'Châu Thị Bảo Hà', note: '', type: 'Học',
    },
    {
      id: 'hk1-6',
      subject: 'Thống kê máy tính và ứng dụng',
      code: '422000435002',
      className: 'DHCNTT18ATT',
      day: 3, start: 10, end: 12,
      room: 'V10.04 (V CS1)', teacher: 'Phan Hồng Tín', note: '', type: 'Học',
    },
    {
      id: 'hk1-7',
      subject: 'Thống kê máy tính và ứng dụng',
      code: '422000435002',
      className: 'DHCNTT18ATT',
      day: 3, start: 13, end: 15,
      room: 'H8.1.2 (H CS1)', teacher: 'Giảng viên tạm CNTT 010', note: 'GV: Trần Tấn Thành', type: 'Học',
    },
    {
      id: 'hk1-8',
      subject: 'Lập trình cho thiết bị di động',
      code: '422000181702',
      className: 'DHKTPM19BTT',
      day: 4, start: 7, end: 9,
      room: 'V11.02 (V CS1)', teacher: 'Nguyễn Minh Hải', note: '', type: 'Học',
    },
    // ⚠️ Trùng thật: tiết 9 chồng với buổi hk1-8 (tiết 7-9) — giữ nguyên để
    // Lộc đối chiếu lại với web trường, app sẽ cảnh báo chứ không tự sửa.
    {
      id: 'hk1-9',
      subject: 'Tiếng Việt thực hành',
      code: '422000363305',
      className: 'DHKTPM19BTT',
      day: 4, start: 9, end: 10,
      room: 'A3.01', teacher: '', note: 'Nhóm ()', type: 'Học',
    },
    {
      id: 'hk1-10',
      subject: 'Lập trình cho thiết bị di động',
      code: '422000181702',
      className: 'DHKTPM19BTT',
      day: 5, start: 7, end: 9,
      room: 'H9.1.1 (H CS1)', teacher: 'Nguyễn Minh Hải', note: '', type: 'Học',
    },
  ],

  // HK2: chỉ có mã môn trong Excel, dùng mã làm tên và đánh dấu nháp.
  // Lộc bổ sung tên đầy đủ / phòng / GV sau khi đăng ký học phần xong.
  hk2: [
    { id: 'hk2-1', subject: 'QLDA', code: 'QLDA', className: '', day: 4, start: 1, end: 6, room: '', teacher: '', note: 'Bản nháp HK2 — chưa có tên đầy đủ', type: 'Học' },
    { id: 'hk2-2', subject: 'CNMOI', code: 'CNMOI', className: '', day: 1, start: 4, end: 6, room: '', teacher: '', note: 'Bản nháp HK2 — chưa có tên đầy đủ', type: 'Học' },
    { id: 'hk2-3', subject: 'CNMOI', code: 'CNMOI', className: '', day: 2, start: 10, end: 12, room: '', teacher: '', note: 'Bản nháp HK2 — chưa có tên đầy đủ', type: 'Học' },
    { id: 'hk2-4', subject: 'AUTOMAT', code: 'AUTOMAT', className: '', day: 3, start: 4, end: 6, room: '', teacher: '', note: 'Bản nháp HK2 — chưa có tên đầy đủ', type: 'Học' },
    { id: 'hk2-5', subject: 'KTTKPM', code: 'KTTKPM', className: '', day: 5, start: 7, end: 9, room: '', teacher: '', note: 'Bản nháp HK2 — chưa có tên đầy đủ', type: 'Học' },
    { id: 'hk2-6', subject: 'KTTKPM', code: 'KTTKPM', className: '', day: 4, start: 13, end: 15, room: '', teacher: '', note: 'Bản nháp HK2 — chưa có tên đầy đủ', type: 'Học' },
  ],
}
