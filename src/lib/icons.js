// Icon trang trí cho từng buổi học — emoji, không cần thư viện icon.
// Buổi nào chưa chọn icon thì dùng icon mặc định theo loại (xem iconFor).
export const ICON_OPTIONS = [
  { emoji: '', label: 'Không icon' },
  { emoji: '📚', label: 'Học chung' },
  { emoji: '💻', label: 'Lập trình' },
  { emoji: '🧮', label: 'Toán / Thống kê' },
  { emoji: '🧪', label: 'Thí nghiệm' },
  { emoji: '📝', label: 'Thi / Kiểm tra' },
  { emoji: '🎨', label: 'Thiết kế' },
  { emoji: '🗣️', label: 'Ngoại ngữ / Tiếng Việt' },
  { emoji: '⚽', label: 'Thể thao' },
  { emoji: '💼', label: 'Việc làm' },
  { emoji: '🎵', label: 'Âm nhạc' },
  { emoji: '🔬', label: 'Khoa học' },
  { emoji: '📖', label: 'Đọc' },
  { emoji: '🧑‍🏫', label: 'Giảng dạy' },
  { emoji: '💡', label: 'Ý tưởng' },
  { emoji: '⭐', label: 'Khác' },
]

export const DEFAULT_ICON_BY_TYPE = {
  'Học': '📚',
  'Thi': '📝',
  'Làm việc': '💼',
  'Cá nhân': '⭐',
}

// Icon hiển thị cho một buổi: icon đã chọn, không thì mặc định theo loại,
// loại lạ thì ⭐. Buổi cũ chưa có trường icon vẫn hiển thị đúng — không
// cần migrate dữ liệu.
export function iconFor(session) {
  if (!session) return '⭐'
  if (session.icon) return session.icon
  return DEFAULT_ICON_BY_TYPE[session.type] || '⭐'
}
