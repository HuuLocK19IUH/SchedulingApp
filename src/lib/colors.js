// Màu cho từng môn — tự sinh từ tên môn, ổn định giữa các lần mở.
// Mỗi màu có bản sáng và bản tối (darkBg/darkText) để khối môn vẫn đọc
// được ở dark mode: nền đậm hơn, chữ sáng hơn.
export const PALETTE = [
  { bg: '#dcfce7', border: '#16a34a', text: '#14532d', darkBg: '#14532d', darkText: '#bbf7d0' },
  { bg: '#dbeafe', border: '#2563eb', text: '#1e3a8a', darkBg: '#1e3a8a', darkText: '#bfdbfe' },
  { bg: '#fef3c7', border: '#d97706', text: '#78350f', darkBg: '#78350f', darkText: '#fde68a' },
  { bg: '#fce7f3', border: '#db2777', text: '#831843', darkBg: '#831843', darkText: '#fbcfe8' },
  { bg: '#e0e7ff', border: '#4f46e5', text: '#312e81', darkBg: '#312e81', darkText: '#c7d2fe' },
  { bg: '#cffafe', border: '#0891b2', text: '#164e63', darkBg: '#164e63', darkText: '#a5f3fc' },
  { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d', darkBg: '#7f1d1d', darkText: '#fecaca' },
  { bg: '#ede9fe', border: '#7c3aed', text: '#4c1d95', darkBg: '#4c1d95', darkText: '#ddd6fe' },
]

export function colorFor(subject, dark = false) {
  let h = 0
  for (const ch of subject) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const p = PALETTE[h % PALETTE.length]
  if (!dark) return { bg: p.bg, border: p.border, text: p.text }
  return { bg: p.darkBg, border: p.border, text: p.darkText }
}

export const TYPE_STYLE = {
  'Học': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  'Thi': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Làm việc': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'Cá nhân': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
}

// ---------------------------------------------------------------------------
// Màu nền ô theo HÌNH THỨC (Part 9) — nền mã hóa LOẠI BUỔI, viền trái mã
// hóa MÔN (xem cellStyleFor). Lộc quy định: thực hành = xanh lá, lý
// thuyết = xám nhạt, thi = vàng nhạt.
// ---------------------------------------------------------------------------

// Nền theo hình thức: bản sáng dùng cho light mode, darkBg cho dark mode.
export const KIND_BG = {
  practice: { bg: '#dcfce7', darkBg: '#14532d' }, // xanh lá nhạt (green-100 / green-900)
  theory: { bg: '#f1f5f9', darkBg: '#334155' },   // xám nhạt (slate-100 / slate-700)
  exam: { bg: '#fef9c3', darkBg: '#78350f' },     // vàng nhạt (yellow-100 / amber-900)
}

export const MODE_LABELS = { theory: 'Lý thuyết', practice: 'Thực hành' }

export function modeLabel(mode) {
  return MODE_LABELS[mode] || MODE_LABELS.theory
}

// Quy tắc đoán hình thức khi chưa có mode ghi rõ — KHÔNG đoán bừa:
// chỉ tên môn chứa "thực hành" thì là thực hành, còn lại là lý thuyết.
// Lộc có thể sửa lại từng buổi trong form Sửa buổi.
export function inferMode(subject) {
  return /thực hành/i.test(String(subject || '')) ? 'practice' : 'theory'
}

// Hình thức hiệu lực của một buổi — chỉ có ý nghĩa khi type là 'Học'.
// Buổi cũ (localStorage / JSON backup cũ) chưa có mode -> dùng heuristic
// theo tên môn, không bao giờ crash, không tự nhận là thực hành.
export function resolveMode(session) {
  if (!session || session.type !== 'Học') return null
  if (session.mode === 'practice' || session.mode === 'theory') return session.mode
  return inferMode(session.subject)
}

// Chuẩn hóa mode trước khi lưu: buổi Học giữ mode hợp lệ (đã chọn rõ thì
// giữ, chưa có thì đoán theo tên môn); buổi không phải Học thì bỏ mode.
export function normalizeMode(session) {
  if (!session) return session
  if (session.type !== 'Học') {
    const { mode: _dropped, ...rest } = session
    return rest
  }
  const mode = session.mode === 'practice' || session.mode === 'theory'
    ? session.mode
    : inferMode(session.subject)
  return { ...session, mode }
}

// Màu đầy đủ của một ô buổi: { bg, border, text }.
// - Nền (bg): mã hóa HÌNH THỨC — thực hành xanh lá, lý thuyết xám nhạt,
//   thi vàng nhạt (xem KIND_BG). 'Làm việc' / 'Cá nhân' giữ nền theo môn
//   như trước (Lộc không yêu cầu đổi).
// - Viền trái (border): LUÔN là màu môn (colorFor) để các môn vẫn phân
//   biệt được với nhau dù nền đã theo hình thức.
// - Chữ (text): giữ màu chữ của palette môn — đã kiểm chứng tỉ lệ tương
//   phản WCAG trên cả 3 nền (sáng + tối): cặp tệ nhất 6.08:1, vẫn trên
//   chuẩn AA 4.5:1 (xem colors.test.js), nên không cần đổi sang màu cố định.
export function cellStyleFor(session, dark = false) {
  const subj = colorFor(session?.subject || '', dark)
  if (session?.type === 'Thi') {
    const k = KIND_BG.exam
    return { bg: dark ? k.darkBg : k.bg, border: subj.border, text: subj.text }
  }
  if (session?.type === 'Học') {
    const k = KIND_BG[resolveMode(session)]
    return { bg: dark ? k.darkBg : k.bg, border: subj.border, text: subj.text }
  }
  return subj
}
