import { overlaps } from './time.js'

// Chấm điểm "lịch đẹp" cho một phương án — công thức minh bạch, hiển thị
// nguyên văn trong giao diện để Lộc tự kiểm tra được:
//   Điểm = 100
//        - 20 × (số cặp trùng tiết)
//        - 8  × (số ngày lên trường vượt quá 3 ngày)
//        - 3  × (số tiết buổi tối, tiết >= 13)
//        - 1  × (số tiết trống giữa các ca trong một ngày — chỉ tính khoảng
//                trống giữa buổi đầu và buổi cuối của ngày đó, không tính
//                trước buổi đầu / sau buổi cuối)
//   Điểm kẹp tối thiểu 0. Phương án càng ít ngày, ít tối, ít giờ trống,
//   không trùng thì điểm càng cao.

function validSessions(sessions) {
  return (sessions || []).filter(
    (s) => s && typeof s.day === 'number' && s.day >= 0 && s.day <= 6
      && typeof s.start === 'number' && typeof s.end === 'number'
      && s.start >= 1 && s.start <= 16 && s.end >= 1 && s.end <= 16 && s.end >= s.start,
  )
}

/** Các cặp buổi trùng nhau trong danh sách: [{ a, b }]. */
export function conflictPairs(sessions) {
  const list = validSessions(sessions)
  const pairs = []
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (overlaps(list[i], list[j])) pairs.push({ a: list[i], b: list[j] })
    }
  }
  return pairs
}

export function scorePlan(sessions) {
  const list = validSessions(sessions)
  const pairs = conflictPairs(list)
  const days = new Set(list.map((s) => s.day)).size
  const totalPeriods = list.reduce((sum, s) => sum + (s.end - s.start + 1), 0)
  const eveningPeriods = list.reduce((sum, s) => {
    const from = Math.max(s.start, 13)
    return sum + (s.end >= 13 ? s.end - from + 1 : 0)
  }, 0)
  // Giờ trống: mỗi ngày, sắp xếp các buổi theo tiết, cộng khoảng trống
  // giữa buổi trước (end) và buổi sau (start) — ví dụ tiết 1-3 rồi 7-9
  // thì trống 3 tiết (4, 5, 6).
  let gapPeriods = 0
  for (let d = 0; d < 7; d++) {
    const dayList = list.filter((s) => s.day === d).sort((a, b) => a.start - b.start)
    for (let i = 1; i < dayList.length; i++) {
      gapPeriods += Math.max(0, dayList[i].start - dayList[i - 1].end - 1)
    }
  }
  const daysOver = Math.max(0, days - 3)
  const score = Math.max(
    0,
    100 - 20 * pairs.length - 8 * daysOver - 3 * eveningPeriods - 1 * gapPeriods,
  )
  return {
    score,
    days,
    daysOver,
    eveningPeriods,
    totalPeriods,
    sessions: list.length,
    conflicts: pairs.length,
    gapPeriods,
  }
}

/** So sánh nhiều phương án: trả về mảng đã chấm điểm, xếp theo điểm giảm dần. */
export function comparePlans(plans) {
  return (plans || [])
    .map((plan) => ({ plan, ...scorePlan(plan.sessions) }))
    .sort((a, b) => b.score - a.score)
}
