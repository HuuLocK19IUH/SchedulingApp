import { describe, expect, it } from 'vitest'
import { findFreeSlots } from './freeTime.js'
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
