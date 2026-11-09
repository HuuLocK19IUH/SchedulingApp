// Màu cho từng môn — tự sinh từ tên môn, ổn định giữa các lần mở.
export const PALETTE = [
  { bg: '#dcfce7', border: '#16a34a', text: '#14532d' },
  { bg: '#dbeafe', border: '#2563eb', text: '#1e3a8a' },
  { bg: '#fef3c7', border: '#d97706', text: '#78350f' },
  { bg: '#fce7f3', border: '#db2777', text: '#831843' },
  { bg: '#e0e7ff', border: '#4f46e5', text: '#312e81' },
  { bg: '#cffafe', border: '#0891b2', text: '#164e63' },
  { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d' },
  { bg: '#ede9fe', border: '#7c3aed', text: '#4c1d95' },
]

export function colorFor(subject) {
  let h = 0
  for (const ch of subject) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export const TYPE_STYLE = {
  'Học': 'bg-emerald-100 text-emerald-800',
  'Thi': 'bg-red-100 text-red-800',
  'Làm việc': 'bg-amber-100 text-amber-800',
  'Cá nhân': 'bg-sky-100 text-sky-800',
}
