// Cấu hình học kỳ — mặc định 3 học kỳ (IUH), người dùng tự chỉnh
// được số học kỳ cho khớp trường mình (bạn Lộc có trường tới 6 học kỳ).
// Mỗi học kỳ: { id, label, start, end } với start/end là "MM-DD".
// Khoảng có thể quấn qua năm (vd HK1 09-01 -> 01-15).
// Lưu ở localStorage key 'schedulingapp-semesters-v1' (hook useSchedule).

export const SEMESTERS_STORAGE_KEY = 'schedulingapp-semesters-v1'
export const MAX_SEMESTERS = 8

// Mặc định 3 học kỳ (IUH: HK3 là học kỳ hè, không bắt buộc — học vượt /
// học lại). Các khoảng ngày là ƯỚC LƯỢNG hợp lý cho lịch đại học Việt
// Nam, KHÔNG phải ngày chính thức của IUH — người dùng sửa lại trong
// Cài đặt → Học kỳ nếu trường mình khác.
export const DEFAULT_SEMESTERS = [
  { id: 'hk1', label: 'HK1', start: '09-01', end: '01-15' },
  { id: 'hk2', label: 'HK2', start: '01-16', end: '05-31' },
  { id: 'hk3', label: 'HK3 · Hè', start: '06-01', end: '08-31' },
]

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export function daysInMonth(m) {
  return DAYS_IN_MONTH[m - 1] || 0
}

/** "MM-DD" -> { month, day } hoặc null nếu sai định dạng / ngày không tồn tại. */
export function parseMonthDay(str) {
  if (typeof str !== 'string') return null
  const m = str.trim().match(/^(\d{1,2})-(\d{1,2})$/)
  if (!m) return null
  const month = Number(m[1])
  const day = Number(m[2])
  if (month < 1 || month > 12) return null
  if (day < 1 || day > daysInMonth(month)) return null
  return { month, day }
}

/** Chuẩn hóa "9-1" -> "09-01". */
export function formatMonthDay(month, day) {
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function mdValue(md) {
  return md.month * 100 + md.day
}

/** Ngày (tháng-ngày) có nằm trong [start, end] không — xử lý khoảng quấn qua năm. */
export function inRange(md, start, end) {
  const v = mdValue(md)
  const s = mdValue(start)
  const e = mdValue(end)
  if (s <= e) return v >= s && v <= e
  return v >= s || v <= e
}

/**
 * Học kỳ "hiện tại" theo ngày cho trước (mặc định hôm nay).
 * - Ngày nằm trong khoảng của học kỳ nào thì lấy học kỳ đó.
 * - Rơi vào khoảng trống giữa các học kỳ thì lấy học kỳ SẮP TỚI gần
 *   nhất (tính lần bắt đầu tiếp theo của mỗi học kỳ, năm nay hoặc sang năm).
 * - Danh sách rỗng -> null.
 */
export function currentSemesterId(semesters, date = new Date()) {
  if (!Array.isArray(semesters) || !semesters.length) return null
  const md = { month: date.getMonth() + 1, day: date.getDate() }
  for (const s of semesters) {
    const start = parseMonthDay(s.start)
    const end = parseMonthDay(s.end)
    if (start && end && inRange(md, start, end)) return s.id
  }
  // Khoảng trống: học kỳ có ngày bắt đầu tiếp theo gần nhất.
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  let bestId = null
  let bestDays = Infinity
  for (const s of semesters) {
    const start = parseMonthDay(s.start)
    if (!start) continue
    let next = new Date(today.getFullYear(), start.month - 1, start.day)
    if (next < today) next = new Date(today.getFullYear() + 1, start.month - 1, start.day)
    const days = Math.round((next - today) / 86400000)
    if (days < bestDays) { bestDays = days; bestId = s.id }
  }
  return bestId
}

/**
 * Chuẩn hóa cấu hình học kỳ đọc từ localStorage/backup: chỉ giữ mục hợp
 * lệ (id + label khác rỗng, start/end đúng "MM-DD", start != end), bỏ
 * trùng id (giữ mục đầu), tối đa MAX_SEMESTERS. Sai hết / rỗng -> mặc định 3.
 */
export function normalizeSemesters(raw) {
  const cloneDefault = () => DEFAULT_SEMESTERS.map((s) => ({ ...s }))
  if (!Array.isArray(raw)) return cloneDefault()
  const seen = new Set()
  const out = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const id = typeof item.id === 'string' ? item.id.trim() : ''
    const label = typeof item.label === 'string' ? item.label.trim() : ''
    if (!id || !label || seen.has(id)) continue
    const start = parseMonthDay(item.start)
    const end = parseMonthDay(item.end)
    if (!start || !end || mdValue(start) === mdValue(end)) continue
    seen.add(id)
    out.push({ id, label, start: formatMonthDay(start.month, start.day), end: formatMonthDay(end.month, end.day) })
    if (out.length >= MAX_SEMESTERS) break
  }
  return out.length ? out : cloneDefault()
}

/** id mới không đụng id nào đang có. */
export function newSemesterId(existingIds) {
  let id = `hk-${Date.now()}`
  let n = 1
  while (existingIds.includes(id)) { id = `hk-${Date.now()}-${n}`; n += 1 }
  return id
}

/** Nhãn mặc định cho học kỳ mới thêm ("HK4", "HK5"...). */
export function defaultLabel(semesters) {
  return `HK${semesters.length + 1}`
}

/**
 * Có xóa được học kỳ không? Trả về { ok: true } hoặc { ok: false, reason }.
 * - reason 'last': không xóa được học kỳ cuối cùng còn lại.
 * - reason 'has-sessions': học kỳ còn buổi học — xóa các buổi trước đã.
 */
export function canRemoveSemester(semesters, sessionCounts, id) {
  if (semesters.length <= 1) return { ok: false, reason: 'last' }
  const count = sessionCounts?.[id] || 0
  if (count > 0) return { ok: false, reason: 'has-sessions', count }
  return { ok: true }
}

/**
 * Phân biệt + chuẩn hóa file backup JSON (dùng cho importJSON).
 * - Dạng mới { version: 2, semesters, sessions }: trả về cấu hình học kỳ
 *   mới + dữ liệu mới.
 * - Dạng cũ { hk1: [...], hk2: [...] }: giữ cấu hình hiện tại, chỉ lấy
 *   dữ liệu (chuẩn hóa thêm hk3 []...).
 * - Còn lại (object lạ, mảng, null, chuỗi...) -> throw Error('bad'):
 *   file không phải backup của app — KHÔNG được lặng lẽ xóa lịch về
 *   rỗng. Không kiểm tra hình dạng từng buổi ở đây (hook kiểm tra sau).
 */
export function parseBackup(parsed, currentSemesters) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('bad')
  const isV2 = parsed.version === 2
    && parsed.sessions && typeof parsed.sessions === 'object' && !Array.isArray(parsed.sessions)
  if (isV2) {
    // semesters hỏng -> normalizeSemesters về mặc định 3 (không throw,
    // vì file vẫn là backup v2: có version + sessions).
    const semesters = normalizeSemesters(parsed.semesters)
    const data = normalizeDataMap(parsed, semesters)
    if (!data) throw new Error('bad')
    return { semesters, data }
  }
  if (Array.isArray(parsed.hk1) && Array.isArray(parsed.hk2)) {
    const data = normalizeDataMap(parsed, currentSemesters)
    if (!data) throw new Error('bad')
    return { semesters: currentSemesters, data }
  }
  throw new Error('bad')
}

/**
 * Chuẩn hóa map dữ liệu buổi học đọc từ localStorage/backup theo danh
 * sách học kỳ hiện tại. Chấp nhận cả 2 dạng:
 * - dạng cũ: { hk1: [...], hk2: [...] } (map trực tiếp)
 * - dạng mới: { version: 2, semesters: [...], sessions: {...} }
 * Trả về map id -> mảng (thêm [] cho học kỳ nào chưa có), giữ nguyên các
 * id lạ có mảng (không hiện nhưng không mất dữ liệu). Trả null nếu raw
 * không phải object (dữ liệu hỏng -> caller dùng seed).
 */
export function normalizeDataMap(raw, semesters) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const source = raw.version === 2 && raw.sessions && typeof raw.sessions === 'object' && !Array.isArray(raw.sessions)
    ? raw.sessions
    : raw
  const map = {}
  for (const s of semesters) {
    map[s.id] = Array.isArray(source[s.id]) ? source[s.id] : []
  }
  for (const [key, value] of Object.entries(source)) {
    if (!(key in map) && Array.isArray(value)) map[key] = value
  }
  return map
}
