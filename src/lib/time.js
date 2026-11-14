// Giờ học theo tiết — lấy từ bảng Excel HK2 của Lộc (IUH).
// Tiết 1-6: Sáng, 7-12: Chiều, 13-16: Tối.
export const PERIOD_TIMES = [
  '6:30 - 7:20', // 1
  '7:20 - 8:10', // 2
  '8:10 - 9:00', // 3
  '9:00 - 10:00', // 4
  '10:00 - 10:50', // 5
  '10:50 - 11:40', // 6
  '12:30 - 13:20', // 7
  '13:20 - 14:10', // 8
  '14:10 - 15:00', // 9
  '15:10 - 16:00', // 10
  '16:00 - 16:50', // 11
  '16:50 - 17:40', // 12
  '18:00 - 18:50', // 13
  '18:50 - 19:40', // 14
  '19:50 - 20:40', // 15
  '20:40 - 21:30', // 16
]

export const DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
export const DAY_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export const TYPES = ['Học', 'Thi', 'Làm việc', 'Cá nhân']

export function sessionLabel(period) {
  if (period <= 6) return 'Sáng'
  if (period <= 12) return 'Chiều'
  return 'Tối'
}

export function timeRange(start, end, times = PERIOD_TIMES) {
  const [s] = times[start - 1].split(' - ')
  const [, e] = times[end - 1].split(' - ')
  return `${s} - ${e}`
}

/**
 * Kiểm tra một mảng 16 khung giờ tiết dạng "H:MM - H:MM".
 * Trả về null nếu hợp lệ, ngược lại trả về chuỗi lỗi (tiếng Việt).
 * Quy tắc: đủ 16 tiết, mỗi tiết kết thúc sau khi bắt đầu, và các tiết
 * xếp theo thứ tự tăng dần (tiết sau bắt đầu không sớm hơn tiết trước kết thúc).
 */
export function validatePeriodTimes(times) {
  if (!Array.isArray(times) || times.length !== 16) return 'Cần đủ 16 tiết (tiết 1–16).'
  const parsed = []
  for (let i = 0; i < 16; i++) {
    const m = String(times[i] ?? '').trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/)
    if (!m) return `Tiết ${i + 1}: giờ chưa đúng dạng "H:MM - H:MM" (VD: 7:00 - 7:50).`
    const start = Number(m[1]) * 60 + Number(m[2])
    const end = Number(m[3]) * 60 + Number(m[4])
    if (Number(m[1]) > 23 || Number(m[3]) > 23 || Number(m[2]) > 59 || Number(m[4]) > 59) return `Tiết ${i + 1}: giờ không hợp lệ.`
    if (end <= start) return `Tiết ${i + 1}: giờ kết thúc phải sau giờ bắt đầu.`
    parsed.push({ start, end })
  }
  for (let i = 1; i < 16; i++) {
    if (parsed[i].start < parsed[i - 1].end) return `Tiết ${i + 1} bắt đầu (${times[i]}) sớm hơn tiết ${i} kết thúc — các tiết phải xếp theo thứ tự tăng dần.`
  }
  return null
}

/** Hai buổi trùng nhau nếu cùng ngày và khoảng tiết giao nhau. */
export function overlaps(a, b) {
  return a.day === b.day && a.start <= b.end && b.start <= a.end
}

export function findConflicts(session, sessions) {
  return sessions.filter((s) => s.id !== session.id && overlaps(s, session))
}

/** Trả về tập id của các buổi đang bị trùng tiết trong danh sách. */
export function conflictIds(sessions) {
  const ids = new Set()
  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      if (overlaps(sessions[i], sessions[j])) {
        ids.add(sessions[i].id)
        ids.add(sessions[j].id)
      }
    }
  }
  return ids
}

/** Chỉ số ngày theo quy ước của app: 0 = Thứ 2 ... 6 = Chủ nhật. */
export function todayIndex(date = new Date()) {
  const jsDay = date.getDay() // 0 = CN, 1 = T2, ...
  return jsDay === 0 ? 6 : jsDay - 1
}

// ---- Helpers cho nhắc lịch / đếm ngược / .ics (hàm thuần, test được) ----

/** "6:30" -> số phút từ 0h. */
export function minutesOf(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export function periodStartMinutes(period, times = PERIOD_TIMES) {
  return minutesOf(times[period - 1].split(' - ')[0])
}

export function periodEndMinutes(period, times = PERIOD_TIMES) {
  return minutesOf(times[period - 1].split(' - ')[1])
}

/** Chuyển chỉ số ngày của app (0 = Thứ 2) sang JS getDay (0 = CN). */
export function appDayToJsDay(appDay) {
  return (appDay + 1) % 7
}

/**
 * Lần học tiếp theo của một buổi, tính từ `from` (mặc định là bây giờ).
 * Nếu hôm nay đúng thứ đó và chưa tới giờ bắt đầu thì trả về hôm nay,
 * ngược lại là tuần sau cùng thứ đó. Giờ lấy theo giờ địa phương.
 */
export function nextOccurrence(session, from = new Date(), times = PERIOD_TIMES) {
  const startMin = periodStartMinutes(session.start, times)
  const d = new Date(from)
  d.setSeconds(0, 0)
  const targetJs = appDayToJsDay(session.day)
  let delta = (targetJs - d.getDay() + 7) % 7
  const todayStart = new Date(d)
  todayStart.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0)
  if (delta === 0 && d >= todayStart) delta = 7
  const next = new Date(d)
  next.setDate(d.getDate() + delta)
  next.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0)
  return next
}

/** Giờ kết thúc của một buổi vào ngày `date` (cùng ngày với lần học đó). */
export function sessionEndDate(session, date, times = PERIOD_TIMES) {
  const endMin = periodEndMinutes(session.end, times)
  const d = new Date(date)
  d.setHours(Math.floor(endMin / 60), endMin % 60, 0, 0)
  return d
}

/** Trạng thái của một buổi hôm nay: 'upcoming' | 'ongoing' | 'done'. */
export function sessionStatusToday(session, now = new Date(), times = PERIOD_TIMES) {
  if (session.day !== todayIndex(now)) return 'other-day'
  const start = periodStartMinutes(session.start, times)
  const end = periodEndMinutes(session.end, times)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  if (nowMin < start) return 'upcoming'
  if (nowMin < end) return 'ongoing'
  return 'done'
}

/** "2026-11-14" theo giờ địa phương (không dùng toISOString vì lệch múi giờ). */
export function formatDateLocal(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateLocal(yyyyMmDd) {
  const [y, m, d] = yyyyMmDd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Số ngày từ hôm nay tới ngày `yyyy-MM-dd`: 0 = hôm nay, 1 = ngày mai, âm = quá hạn. */
export function daysUntil(yyyyMmDd, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = parseDateLocal(yyyyMmDd)
  return Math.round((target - today) / 86400000)
}

/** Nhãn đếm ngược cho task có ngày hết hạn. */
export function countdownLabel(dueDate, now = new Date()) {
  if (!dueDate) return ''
  const diff = daysUntil(dueDate, now)
  if (diff < 0) return `Quá hạn ${-diff} ngày`
  if (diff === 0) return 'Hôm nay'
  if (diff === 1) return 'còn 1 ngày'
  return `còn ${diff} ngày`
}

/** "sau 25 phút" / "sau 1 giờ 10 phút" cho một thời điểm trong tương lai. */
export function inMinutesLabel(date, now = new Date()) {
  const mins = Math.max(0, Math.round((date - now) / 60000))
  if (mins < 60) return `sau ${mins} phút`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `sau ${h} giờ ${m} phút` : `sau ${h} giờ`
}

