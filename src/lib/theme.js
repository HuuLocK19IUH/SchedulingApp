// Nền dashboard + giao diện sáng/tối. Nền là gradient CSS (không ảnh),
// áp qua style inline trên wrapper chính + body, nên đổi là thấy ngay
// và không cần load thêm gì.

export const BACKGROUND_OPTIONS = [
  { id: 'default', label: 'Mặc định' },
  { id: 'sunset', label: 'Hoàng hôn' },
  { id: 'forest', label: 'Rừng xanh' },
  { id: 'ocean', label: 'Biển' },
  { id: 'custom', label: 'Màu tự chọn' },
]

function hexToRgb(hex) {
  const h = (hex || '').replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

// Trộn một màu hex về phía trắng (amount > 0) hoặc đen (amount < 0),
// amount trong khoảng -1..1. Dùng để làm gradient nhạt/đậm từ màu tự chọn.
export function shade(hex, amount) {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const target = amount >= 0 ? 255 : 0
  const a = Math.abs(amount)
  const mixed = rgb.map((v) => Math.round(v + (target - v) * a))
  return `#${mixed.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

// Trả về giá trị CSS background cho nền đã chọn. Ở dark mode mọi nền đều
// là bản tối để chữ vẫn đọc được — không đặt gradient sáng sau chữ tối.
export function backgroundStyle(background, customColor, dark) {
  if (dark) {
    switch (background) {
      case 'sunset': return 'linear-gradient(135deg, #431407 0%, #4c0519 55%, #451a03 100%)'
      case 'forest': return 'linear-gradient(135deg, #052e16 0%, #064e3b 55%, #022c22 100%)'
      case 'ocean': return 'linear-gradient(135deg, #082f49 0%, #134e4a 55%, #1e1b4b 100%)'
      case 'custom': return `linear-gradient(135deg, ${shade(customColor, -0.75)} 0%, ${shade(customColor, -0.55)} 100%)`
      default: return 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)'
    }
  }
  switch (background) {
    case 'sunset': return 'linear-gradient(135deg, #ffedd5 0%, #fecdd3 55%, #fde68a 100%)'
    case 'forest': return 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 55%, #fef9c3 100%)'
    case 'ocean': return 'linear-gradient(135deg, #dbeafe 0%, #cffafe 55%, #e0e7ff 100%)'
    case 'custom': return `linear-gradient(135deg, ${shade(customColor, 0.75)} 0%, ${shade(customColor, 0.55)} 100%)`
    default: return 'linear-gradient(180deg, #eef2ff 0%, #f6f7fb 100%)'
  }
}

export const THEME_MODES = [
  { id: 'light', label: '☀️ Sáng', icon: '☀️' },
  { id: 'dark', label: '🌙 Tối', icon: '🌙' },
  { id: 'system', label: '💻 Theo hệ thống', icon: '💻' },
]
