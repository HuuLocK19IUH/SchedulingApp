// Tìm giờ trống chung — hàm thuần, không có UI.
// Một tiết được xem là bận nếu có bất kỳ buổi nào (của mình hoặc của bạn)
// trùng tiết đó trong ngày. Trả về các khoảng trống liên tiếp dài ít nhất
// `minPeriods` tiết, xếp theo độ dài giảm dần.
/**
 * @param {Array} mySessions - buổi của mình ({day, start, end})
 * @param {Array} friendsSessions - buổi của bạn bè, mỗi buổi có thêm `friend`
 * @param {{ minPeriods?: number }} opts
 * @returns {Array<{ day: number, start: number, end: number, periods: number }>}
 */
export function findFreeSlots(mySessions = [], friendsSessions = [], opts = {}) {
  const minPeriods = opts.minPeriods || 2
  const all = [...(mySessions || []), ...(friendsSessions || [])]
  const slots = []
  for (let day = 0; day < 7; day++) {
    const busy = new Array(17).fill(false) // index 1..16
    for (const s of all) {
      if (s.day !== day) continue
      for (let p = Math.max(1, s.start); p <= Math.min(16, s.end); p++) busy[p] = true
    }
    let start = null
    for (let p = 1; p <= 17; p++) {
      const isBusy = p <= 16 ? busy[p] : true
      if (!isBusy && start === null) start = p
      if (isBusy && start !== null) {
        const end = p - 1
        if (end - start + 1 >= minPeriods) slots.push({ day, start, end, periods: end - start + 1 })
        start = null
      }
    }
  }
  return slots.sort((a, b) => b.periods - a.periods || a.day - b.day || a.start - b.start)
}

/** Bảng giờ trống theo ngày: { day: [{start, end, periods}] } (kể cả khoảng 1 tiết). */
export function freeSlotsByDay(mySessions = [], friendsSessions = []) {
  const all = findFreeSlots(mySessions, friendsSessions, { minPeriods: 1 })
  const byDay = {}
  for (let d = 0; d < 7; d++) byDay[d] = []
  for (const s of all) byDay[s.day].push(s)
  return byDay
}
