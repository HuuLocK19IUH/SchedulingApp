import { describe, expect, it } from 'vitest'
import { buildIcs } from './ics.js'

describe('buildIcs', () => {
  it('xuất VEVENT lặp hàng tuần với đúng tên môn', () => {
    // Thứ 2 2026-11-16 06:00 -> buổi Thứ 2 tiết 1 bắt đầu 6:30.
    const from = new Date(2026, 10, 16, 6, 0)
    const ics = buildIcs(
      [{ id: 'a', subject: 'Lập trình WWW (Java)', day: 0, start: 1, end: 3, room: 'H3.1.1', teacher: 'Đặng Thị Thu Hà' }],
      [],
      { from },
    )
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO;COUNT=15')
    expect(ics).toContain('Lập trình WWW (Java)')
    expect(ics).toContain('DTSTART:20261116T063000')
    expect(ics).toContain('LOCATION:H3.1.1')
  })

  it('task thi thành sự kiện cả ngày, task đã xong bị bỏ qua', () => {
    const ics = buildIcs([], [
      { id: 't1', title: 'Thi giữa kỳ', subject: 'Thống kê', type: 'Thi', dueDate: '2026-12-01', done: false },
      { id: 't2', title: 'Đã xong', subject: 'X', type: 'Thi', dueDate: '2026-12-02', done: true },
    ])
    expect(ics).toContain('[Thi] Thi giữa kỳ')
    expect(ics).not.toContain('Đã xong')
  })
})
