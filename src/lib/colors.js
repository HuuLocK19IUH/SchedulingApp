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
