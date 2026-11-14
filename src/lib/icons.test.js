import { describe, expect, it } from 'vitest'
import { iconFor, ICON_OPTIONS, DEFAULT_ICON_BY_TYPE } from './icons.js'

describe('iconFor — icon mặc định theo loại, icon đã chọn thắng', () => {
  it('buổi Học không icon thì dùng 📚, Thi dùng 📝, Làm việc dùng 💼, Cá nhân dùng ⭐', () => {
    expect(iconFor({ type: 'Học' })).toBe('📚')
    expect(iconFor({ type: 'Thi' })).toBe('📝')
    expect(iconFor({ type: 'Làm việc' })).toBe('💼')
    expect(iconFor({ type: 'Cá nhân' })).toBe('⭐')
  })

  it('icon đã chọn thì thắng icon mặc định theo loại', () => {
    expect(iconFor({ type: 'Học', icon: '💻' })).toBe('💻')
    expect(iconFor({ type: 'Thi', icon: '🧮' })).toBe('🧮')
  })

  it('loại lạ hoặc không có buổi thì về ⭐, và danh sách icon có đủ lựa chọn', () => {
    expect(iconFor({ type: 'Không biết' })).toBe('⭐')
    expect(iconFor(null)).toBe('⭐')
    expect(ICON_OPTIONS.length).toBeGreaterThanOrEqual(10)
    expect(ICON_OPTIONS.map((o) => o.emoji)).toContain('💻')
    expect(Object.keys(DEFAULT_ICON_BY_TYPE)).toEqual(
      expect.arrayContaining(['Học', 'Thi', 'Làm việc', 'Cá nhân']),
    )
  })
})
