import { describe, expect, it } from 'vitest'
import { conflictPairs, scorePlan } from './planScore.js'

const clean3Day = [
  { id: 'a', subject: 'A', day: 0, start: 1, end: 3 },
  { id: 'b', subject: 'B', day: 2, start: 1, end: 3 },
  { id: 'c', subject: 'C', day: 4, start: 1, end: 3 },
]

// Cặp trùng thật của Lộc — Thứ 6 tiết 9.
const mobile = { id: 'hk1-8', subject: 'Lập trình cho thiết bị di động', day: 4, start: 7, end: 9 }
const tiengViet = { id: 'hk1-9', subject: 'Tiếng Việt thực hành', day: 4, start: 9, end: 10 }

describe('scorePlan', () => {
  it('phương án sạch 3 ngày, không tối, không trống được 100 điểm', () => {
    const r = scorePlan(clean3Day)
    expect(r.score).toBe(100)
    expect(r.days).toBe(3)
    expect(r.conflicts).toBe(0)
  })

  it('một cặp trùng trừ đúng 20 điểm', () => {
    const without = scorePlan([mobile, { ...tiengViet, start: 10, end: 11 }])
    const withConflict = scorePlan([mobile, tiengViet])
    expect(conflictPairs([mobile, tiengViet])).toHaveLength(1)
    expect(withConflict.score).toBe(without.score - 20)
  })

  it('điểm không xuống dưới 0', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ id: `s${i}`, subject: 'X', day: i % 7, start: 13, end: 15 }))
    expect(scorePlan(many).score).toBeGreaterThanOrEqual(0)
  })
})
