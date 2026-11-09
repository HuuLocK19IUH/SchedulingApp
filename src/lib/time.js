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

export function timeRange(start, end) {
  const [s] = PERIOD_TIMES[start - 1].split(' - ')
  const [, e] = PERIOD_TIMES[end - 1].split(' - ')
  return `${s} - ${e}`
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
export function todayIndex() {
  const jsDay = new Date().getDay() // 0 = CN, 1 = T2, ...
  return jsDay === 0 ? 6 : jsDay - 1
}
