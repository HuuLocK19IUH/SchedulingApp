import { describe, expect, it } from 'vitest'
import { findFreeSlots, longestFreeSlotPerDay } from './freeTime.js'
import { GENERIC_50_PRESET, IUH_PRESET, PRESETS } from '../data/presets.js'

describe('findFreeSlots', () => {
  it('trả về khoảng trống dài nhất trước, chỉ lấy khoảng ≥ 2 tiết', () => {
    const mine = [{ day: 0, start: 1, end: 3 }]
    const slots = findFreeSlots(mine, [], { minPeriods: 2 })
    const monday = slots.filter((s) => s.day === 0)
    expect(monday[0]).toMatchObject({ day: 0, start: 4, end: 16, periods: 13 })
    expect(slots.every((s) => s.periods >= 2)).toBe(true)
  })

  it('bạn bận thì khung đó không còn trống', () => {
    const mine = []
    const friend = [{ day: 2, start: 7, end: 9, friend: 'Khánh' }]
    const slots = findFreeSlots(mine, friend, { minPeriods: 2 })
    expect(slots.some((s) => s.day === 2 && s.start <= 9 && s.end >= 7)).toBe(false)
  })

  it('không còn chỗ trống thì trả về mảng rỗng', () => {
    const full = Array.from({ length: 7 }, (_, d) => ({ day: d, start: 1, end: 16 }))
    expect(findFreeSlots(full, [])).toHaveLength(0)
  })
})

describe('longestFreeSlotPerDay', () => {
  // Lịch thật của Lộc: Thứ 2 có 1 buổi Tiết 7–9 (Lập trình WWW Java),
  // Chủ nhật trống cả ngày. Danh sách phải có đủ 7 ngày, Chủ nhật
  // trống 16 tiết và Thứ 2 hiện khung dài nhất Tiết 10–16 (7 tiết).
  it('mỗi ngày đều có mặt, Chủ nhật trống 16 tiết không bị cắt', () => {
    const mine = [{ day: 0, start: 7, end: 9 }]
    const slots = longestFreeSlotPerDay(mine, [])
    expect(slots).toHaveLength(7)
    const sunday = slots.find((s) => s.day === 6)
    expect(sunday).toMatchObject({ day: 6, start: 1, end: 16, periods: 16 })
    const monday = slots.find((s) => s.day === 0)
    expect(monday).toMatchObject({ day: 0, start: 10, end: 16, periods: 7 })
    // 6 ngày trống 16 tiết xếp trước (theo thứ tự ngày), Thứ 2 xếp cuối.
    expect(slots.slice(0, 6).every((s) => s.periods === 16)).toBe(true)
    expect(slots[6].day).toBe(0)
  })

  it('bạn bận kín ngày đó thì ngày đó vắng mặt', () => {
    const mine = [{ day: 0, start: 7, end: 9 }]
    const friend = [{ day: 6, start: 1, end: 16, friend: 'Khánh' }]
    const slots = longestFreeSlotPerDay(mine, friend)
    expect(slots.some((s) => s.day === 6)).toBe(false)
    expect(slots).toHaveLength(6)
  })

  it('không còn chỗ trống thì trả về mảng rỗng', () => {
    const full = Array.from({ length: 7 }, (_, d) => ({ day: d, start: 1, end: 16 }))
    expect(longestFreeSlotPerDay(full, [])).toHaveLength(0)
  })
})

describe('presets', () => {
  it('IUH là mặc định, đủ 16 tiết, tiết 1 bắt đầu 6:30', () => {
    expect(PRESETS[0].id).toBe('iuh')
    expect(IUH_PRESET.times).toHaveLength(16)
    expect(IUH_PRESET.times[0]).toBe('6:30 - 7:20')
  })

  it('preset mẫu 50 phút đủ 16 tiết và ghi rõ là mẫu ví dụ', () => {
    expect(GENERIC_50_PRESET.times).toHaveLength(16)
    expect(GENERIC_50_PRESET.times[0]).toBe('7:00 - 7:50')
    expect(GENERIC_50_PRESET.note).toMatch(/Mẫu ví dụ/)
  })
})
