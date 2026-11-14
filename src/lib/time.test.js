import { describe, expect, it } from 'vitest'
import {
  PERIOD_TIMES, conflictIds, nextOccurrence, periodEndMinutes,
  periodStartMinutes, timeRange, validatePeriodTimes,
} from './time.js'

// Buổi thật của Lộc — Thứ 6 tiết 9 trùng nhau giữa Lập trình di động
// (tiết 7–9) và Tiếng Việt thực hành (tiết 9–10).
const MOBILE = { id: 'hk1-8', subject: 'Lập trình cho thiết bị di động', day: 4, start: 7, end: 9 }
const TIENG_VIET = { id: 'hk1-9', subject: 'Tiếng Việt thực hành', day: 4, start: 9, end: 10 }
const OTHER_DAY = { id: 'x', subject: 'Khác', day: 0, start: 7, end: 9 }

describe('PERIOD_TIMES (IUH — mặc định, không đổi)', () => {
  it('có đủ 16 tiết', () => {
    expect(PERIOD_TIMES).toHaveLength(16)
  })

  it('tiết 1 bắt đầu 6:30, tiết 16 kết thúc 21:30', () => {
    expect(periodStartMinutes(1)).toBe(6 * 60 + 30)
    expect(periodEndMinutes(16)).toBe(21 * 60 + 30)
    expect(timeRange(1, 3)).toBe('6:30 - 9:00')
  })

  it('custom times được dùng khi truyền vào', () => {
    const custom = Array.from({ length: 16 }, (_, i) => `7:${String(i).padStart(2, '0')} - 7:50`)
    expect(periodStartMinutes(1, custom)).toBe(7 * 60)
    expect(timeRange(1, 1, custom)).toBe('7:00 - 7:50')
  })
})

describe('trùng tiết', () => {
  it('phát hiện đúng cặp trùng Thứ 6 tiết 9 của Lộc', () => {
    expect(conflictIds([MOBILE, TIENG_VIET])).toEqual(new Set(['hk1-8', 'hk1-9']))
  })

  it('không báo trùng khi khác ngày hoặc không giao tiết', () => {
    expect(conflictIds([MOBILE, OTHER_DAY])).toEqual(new Set())
    expect(conflictIds([{ ...MOBILE, start: 1, end: 3 }, TIENG_VIET])).toEqual(new Set())
  })
})

describe('nextOccurrence', () => {
  it('trả về đúng thứ tiếp theo', () => {
    // Thứ 2 2026-11-16 06:00, buổi Thứ 2 tiết 1 (6:30) -> cùng ngày 06:30.
    const from = new Date(2026, 10, 16, 6, 0)
    const next = nextOccurrence({ day: 0, start: 1 }, from)
    expect(next.getDay()).toBe(1)
    expect(next.getHours()).toBe(6)
    expect(next.getMinutes()).toBe(30)
    // Đã qua giờ bắt đầu thì sang tuần sau.
    const late = nextOccurrence({ day: 0, start: 1 }, new Date(2026, 10, 16, 7, 0))
    expect(late.getDate()).toBe(23)
  })
})

describe('validatePeriodTimes', () => {
  it('chấp nhận khung IUH', () => {
    expect(validatePeriodTimes(PERIOD_TIMES)).toBeNull()
  })

  it('từ chối tiết kết thúc trước khi bắt đầu và tiết xếp ngược', () => {
    const bad = [...PERIOD_TIMES]
    bad[0] = '7:20 - 6:30'
    expect(validatePeriodTimes(bad)).toMatch(/Tiết 1/)
    const reversed = [...PERIOD_TIMES]
    reversed[1] = '7:00 - 7:50'
    expect(validatePeriodTimes(reversed)).toMatch(/Tiết 2/)
  })

  it('từ chối khi thiếu tiết', () => {
    expect(validatePeriodTimes(PERIOD_TIMES.slice(0, 15))).toMatch(/16 tiết/)
  })
})
