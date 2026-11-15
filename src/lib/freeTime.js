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

/**
 * Khung trống DÀI NHẤT của MỖI ngày (mỗi ngày tối đa 1 khung, ≥ minPeriods
 * tiết), xếp theo độ dài giảm dần, hòa thì ngày sớm trước.
 * Khác findFreeSlots: không cắt top-N, nên ngày nào cũng có mặt nếu còn
 * khung đủ dài — Chủ nhật trống cả ngày không bao giờ bị rớt khỏi danh
 * sách chỉ vì 5 ngày khác cũng trống 16 tiết (lỗi cũ: FreeTimeFinder
 * lấy findFreeSlots rồi .slice(0, 5), mà 6 ngày trống 16 tiết xếp trước
 * Chủ nhật theo thứ tự ngày, nên Chủ nhật — ngày thứ 6 trong số đó —
 * bị cắt mất, cùng với Thứ 2).
 */
export function longestFreeSlotPerDay(mySessions = [], friendsSessions = [], opts = {}) {
  const minPeriods = opts.minPeriods || 2
  const all = findFreeSlots(mySessions, friendsSessions, { minPeriods })
  const best = new Map()
  for (const s of all) {
    const cur = best.get(s.day)
    if (!cur || s.periods > cur.periods || (s.periods === cur.periods && s.start < cur.start)) {
      best.set(s.day, s)
    }
  }
  return [...best.values()].sort((a, b) => b.periods - a.periods || a.day - b.day)
}
