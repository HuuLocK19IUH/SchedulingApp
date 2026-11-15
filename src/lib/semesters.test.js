import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SEMESTERS,
  canRemoveSemester,
  currentSemesterId,
  normalizeDataMap,
  normalizeSemesters,
  parseBackup,
  parseMonthDay,
} from './semesters.js'

// new Date(y, m, d) dùng tháng 0-based, giờ địa phương — tránh lệch múi giờ.
const d = (y, m, day) => new Date(y, m - 1, day)

describe('currentSemesterId (mặc định 3 học kỳ IUH)', () => {
  it('15/11 -> HK1', () => {
    expect(currentSemesterId(DEFAULT_SEMESTERS, d(2026, 11, 15))).toBe('hk1')
  })
  it('15/01 -> HK1 (biên cuối)', () => {
    expect(currentSemesterId(DEFAULT_SEMESTERS, d(2027, 1, 15))).toBe('hk1')
  })
  it('16/01 -> HK2 (biên đầu)', () => {
    expect(currentSemesterId(DEFAULT_SEMESTERS, d(2027, 1, 16))).toBe('hk2')
  })
  it('01/02 -> HK2', () => {
    expect(currentSemesterId(DEFAULT_SEMESTERS, d(2026, 2, 1))).toBe('hk2')
  })
  it('01/07 -> HK3 hè', () => {
    expect(currentSemesterId(DEFAULT_SEMESTERS, d(2026, 7, 1))).toBe('hk3')
  })
  it('31/08 -> HK3 (biên cuối)', () => {
    expect(currentSemesterId(DEFAULT_SEMESTERS, d(2026, 8, 31))).toBe('hk3')
  })
  it('01/09 -> HK1', () => {
    expect(currentSemesterId(DEFAULT_SEMESTERS, d(2026, 9, 1))).toBe('hk1')
  })
  it('danh sách rỗng -> null', () => {
    expect(currentSemesterId([], d(2026, 11, 15))).toBeNull()
  })
})

describe('currentSemesterId — khoảng quấn qua năm', () => {
  const wrap = [
    { id: 'a', label: 'A', start: '11-01', end: '02-28' },
    { id: 'b', label: 'B', start: '03-01', end: '10-31' },
  ]
  it('15/12 -> A (phần cuối năm của khoảng quấn)', () => {
    expect(currentSemesterId(wrap, d(2026, 12, 15))).toBe('a')
  })
  it('20/01 -> A (phần đầu năm của khoảng quấn)', () => {
    expect(currentSemesterId(wrap, d(2027, 1, 20))).toBe('a')
  })
  it('28/02 -> A (biên cuối)', () => {
    expect(currentSemesterId(wrap, d(2027, 2, 28))).toBe('a')
  })
  it('01/03 -> B', () => {
    expect(currentSemesterId(wrap, d(2027, 3, 1))).toBe('b')
  })
})

describe('currentSemesterId — rơi vào khoảng trống thì lấy học kỳ sắp tới', () => {
  const gapped = [
    { id: 's1', label: 'S1', start: '01-01', end: '03-31' },
    { id: 's2', label: 'S2', start: '09-01', end: '12-31' },
  ]
  it('15/06 -> S2 (bắt đầu 01/09 gần hơn 01/01 năm sau)', () => {
    expect(currentSemesterId(gapped, d(2026, 6, 15))).toBe('s2')
  })
  it('15/04 -> S2 (01/09 gần hơn 01/01 năm sau)', () => {
    expect(currentSemesterId(gapped, d(2026, 4, 15))).toBe('s2')
  })
})

describe('currentSemesterId — cấu hình 6 học kỳ', () => {
  const six = [
    { id: 'k1', label: 'Kỳ 1', start: '01-01', end: '02-28' },
    { id: 'k2', label: 'Kỳ 2', start: '03-01', end: '04-15' },
    { id: 'k3', label: 'Kỳ 3', start: '04-16', end: '05-31' },
    { id: 'k4', label: 'Kỳ 4', start: '06-01', end: '07-15' },
    { id: 'k5', label: 'Kỳ 5', start: '07-16', end: '08-31' },
    { id: 'k6', label: 'Kỳ 6', start: '09-01', end: '12-31' },
  ]
  it('20/07 -> Kỳ 5', () => {
    expect(currentSemesterId(six, d(2026, 7, 20))).toBe('k5')
  })
  it('05/09 -> Kỳ 6', () => {
    expect(currentSemesterId(six, d(2026, 9, 5))).toBe('k6')
  })
  it('28/02 -> Kỳ 1', () => {
    expect(currentSemesterId(six, d(2026, 2, 28))).toBe('k1')
  })
})

describe('parseMonthDay', () => {
  it('nhận "09-01", chuẩn hóa "9-1"', () => {
    expect(parseMonthDay('09-01')).toEqual({ month: 9, day: 1 })
    expect(parseMonthDay('9-1')).toEqual({ month: 9, day: 1 })
  })
  it('từ chối tháng/ngày không tồn tại', () => {
    expect(parseMonthDay('13-01')).toBeNull()
    expect(parseMonthDay('02-30')).toBeNull()
    expect(parseMonthDay('04-31')).toBeNull()
    expect(parseMonthDay('x')).toBeNull()
    expect(parseMonthDay('')).toBeNull()
  })
})

describe('normalizeSemesters', () => {
  it('không phải mảng / rỗng -> mặc định 3', () => {
    expect(normalizeSemesters(null)).toEqual(DEFAULT_SEMESTERS)
    expect(normalizeSemesters([])).toEqual(DEFAULT_SEMESTERS)
    expect(normalizeSemesters('x')).toEqual(DEFAULT_SEMESTERS)
  })
  it('bỏ mục sai, trùng id, start == end; chuẩn hóa "9-1" -> "09-01"', () => {
    const out = normalizeSemesters([
      { id: 'a', label: ' A ', start: '9-1', end: '12-31' },
      { id: 'a', label: 'Trùng', start: '01-01', end: '02-01' },
      { id: 'b', label: '', start: '01-01', end: '02-01' },
      { id: 'c', label: 'C', start: '02-30', end: '03-01' },
      { id: 'd', label: 'D', start: '05-01', end: '05-01' },
    ])
    expect(out).toEqual([{ id: 'a', label: 'A', start: '09-01', end: '12-31' }])
  })
  it('tối đa 8 học kỳ', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      id: `s${i}`, label: `S${i}`, start: '01-01', end: '12-31',
    }))
    expect(normalizeSemesters(many)).toHaveLength(8)
  })
})

describe('canRemoveSemester', () => {
  const two = [
    { id: 'a', label: 'A', start: '01-01', end: '06-30' },
    { id: 'b', label: 'B', start: '07-01', end: '12-31' },
  ]
  it('học kỳ cuối cùng -> không xóa', () => {
    expect(canRemoveSemester([two[0]], {}, 'a')).toEqual({ ok: false, reason: 'last' })
  })
  it('học kỳ còn buổi -> không xóa, kèm số buổi', () => {
    expect(canRemoveSemester(two, { a: 3, b: 0 }, 'a')).toEqual({ ok: false, reason: 'has-sessions', count: 3 })
  })
  it('học kỳ trống và còn học kỳ khác -> xóa được', () => {
    expect(canRemoveSemester(two, { a: 0, b: 0 }, 'a')).toEqual({ ok: true })
  })
})

describe('parseBackup — phân biệt file backup', () => {
  const s1 = { id: 'x', subject: 'Môn X', day: 0, start: 1, end: 2 }
  it('dạng mới v2 -> cấu hình + dữ liệu mới', () => {
    const out = parseBackup(
      { version: 2, semesters: [{ id: 'a', label: 'A', start: '01-01', end: '06-30' }], sessions: { a: [s1] } },
      DEFAULT_SEMESTERS,
    )
    expect(out.semesters).toEqual([{ id: 'a', label: 'A', start: '01-01', end: '06-30' }])
    expect(out.data).toEqual({ a: [s1] })
  })
  it('dạng mới v2 nhưng semesters hỏng -> về mặc định 3', () => {
    const out = parseBackup({ version: 2, semesters: 'x', sessions: { hk1: [s1] } }, DEFAULT_SEMESTERS)
    expect(out.semesters).toEqual(DEFAULT_SEMESTERS)
    expect(out.data.hk1).toEqual([s1])
  })
  it('dạng cũ {hk1, hk2} -> giữ cấu hình hiện tại, thêm hk3 []', () => {
    const out = parseBackup({ hk1: [s1], hk2: [] }, DEFAULT_SEMESTERS)
    expect(out.semesters).toBe(DEFAULT_SEMESTERS)
    expect(out.data).toEqual({ hk1: [s1], hk2: [], hk3: [] })
  })
  it('object lạ / mảng / null / chuỗi -> throw (không lặng lẽ xóa lịch)', () => {
    expect(() => parseBackup({ foo: 1 }, DEFAULT_SEMESTERS)).toThrow('bad')
    expect(() => parseBackup([1, 2], DEFAULT_SEMESTERS)).toThrow('bad')
    expect(() => parseBackup(null, DEFAULT_SEMESTERS)).toThrow('bad')
    expect(() => parseBackup('x', DEFAULT_SEMESTERS)).toThrow('bad')
  })
  it('dạng cũ thiếu hk2 -> throw (đúng độ chặt cũ)', () => {
    expect(() => parseBackup({ hk1: [s1] }, DEFAULT_SEMESTERS)).toThrow('bad')
  })
  it('v2 thiếu sessions -> throw', () => {
    expect(() => parseBackup({ version: 2, semesters: [] }, DEFAULT_SEMESTERS)).toThrow('bad')
  })
})

describe('normalizeDataMap — migration dữ liệu cũ', () => {
  const s1 = { id: 'x', subject: 'Môn X', day: 0, start: 1, end: 2 }
  it('dạng cũ {hk1, hk2} -> giữ cả hai + thêm hk3 []', () => {
    const out = normalizeDataMap({ hk1: [s1], hk2: [] }, DEFAULT_SEMESTERS)
    expect(out).toEqual({ hk1: [s1], hk2: [], hk3: [] })
  })
  it('dạng mới {version: 2, sessions} -> dùng sessions', () => {
    const out = normalizeDataMap({ version: 2, semesters: [], sessions: { hk1: [s1] } }, DEFAULT_SEMESTERS)
    expect(out).toEqual({ hk1: [s1], hk2: [], hk3: [] })
  })
  it('id lạ có mảng thì giữ (không hiện, không mất)', () => {
    const out = normalizeDataMap({ hk1: [], hk9: [s1] }, DEFAULT_SEMESTERS)
    expect(out.hk9).toEqual([s1])
    expect(out.hk3).toEqual([])
  })
  it('không phải object -> null (dữ liệu hỏng)', () => {
    expect(normalizeDataMap(null, DEFAULT_SEMESTERS)).toBeNull()
    expect(normalizeDataMap('x', DEFAULT_SEMESTERS)).toBeNull()
    expect(normalizeDataMap([1, 2], DEFAULT_SEMESTERS)).toBeNull()
  })
})
