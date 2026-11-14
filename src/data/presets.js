// Khung giờ tiết theo trường — không hardcode IUH nữa.
// Mỗi preset là một mảng 16 chuỗi "H:MM - H:MM" (tiết 1–16).
// IUH là preset mặc định và giữ nguyên đúng giờ trong bảng Excel của Lộc,
// nên dữ liệu cũ của Lộc không đổi gì.
// Preset "Chuẩn 50 phút" chỉ là MẪU VÍ DỤ (tiết 50 phút, nghỉ 10 phút,
// nghỉ trưa dài sau tiết 6) — KHÔNG phải khung giờ thật của trường nào.
import { PERIOD_TIMES } from '../lib/time.js'

export const IUH_PRESET = {
  id: 'iuh',
  name: 'IUH — Đại học Công nghiệp TP.HCM',
  note: 'Khung giờ mặc định của Lộc (lấy từ bảng Excel HK2).',
  times: PERIOD_TIMES,
}

// Sinh khung giờ mẫu: tiết 50 phút, nghỉ 10 phút giữa các tiết,
// nghỉ trưa 70 phút sau tiết 6 (12:50 → 14:00).
function buildGeneric50() {
  const times = []
  let start = 7 * 60 // 7:00
  for (let i = 0; i < 16; i++) {
    const end = start + 50
    const fmt = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
    times.push(`${fmt(start)} - ${fmt(end)}`)
    // Sau tiết 6 nghỉ trưa dài (70 phút thay vì 10 phút).
    start = end + (i === 5 ? 70 : 10)
  }
  return times
}

export const GENERIC_50_PRESET = {
  id: 'generic50',
  name: 'Chuẩn 50 phút (mẫu ví dụ)',
  note: 'Mẫu ví dụ thôi — tiết 50 phút, nghỉ 10 phút, nghỉ trưa sau tiết 6. Không phải giờ thật của trường nào.',
  times: buildGeneric50(),
}

export const PRESETS = [IUH_PRESET, GENERIC_50_PRESET]

export function presetById(id) {
  return PRESETS.find((p) => p.id === id) || IUH_PRESET
}
