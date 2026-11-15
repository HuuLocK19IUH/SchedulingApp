import { describe, expect, it } from 'vitest'
import {
  PALETTE, KIND_BG, cellStyleFor, inferMode, modeLabel, normalizeMode, resolveMode,
} from './colors.js'

const hoc = (over = {}) => ({ subject: 'Lập trình WWW (Java)', type: 'Học', ...over })

describe('inferMode — đoán hình thức theo tên môn', () => {
  it('tên chứa "thực hành" -> practice', () => {
    expect(inferMode('Tiếng Việt thực hành')).toBe('practice')
    expect(inferMode('THỰC HÀNH điện tử')).toBe('practice')
    expect(inferMode('Thực hành')).toBe('practice')
  })
  it('tên khác -> theory', () => {
    expect(inferMode('Lập trình WWW (Java)')).toBe('theory')
    expect(inferMode('QLDA')).toBe('theory')
    expect(inferMode('')).toBe('theory')
    expect(inferMode(null)).toBe('theory')
  })
})

describe('resolveMode', () => {
  it('mode ghi rõ thì giữ nguyên', () => {
    expect(resolveMode(hoc({ mode: 'practice' }))).toBe('practice')
    expect(resolveMode(hoc({ mode: 'theory' }))).toBe('theory')
  })
  it('buổi cũ chưa có mode -> đoán theo tên môn, không crash', () => {
    expect(resolveMode(hoc())).toBe('theory')
    expect(resolveMode(hoc({ subject: 'Tiếng Việt thực hành' }))).toBe('practice')
    expect(resolveMode(hoc({ subject: 'Tiếng Việt thực hành', mode: 'nonsense' }))).toBe('practice')
  })
  it('buổi không phải Học thì không có hình thức', () => {
    expect(resolveMode({ subject: 'Thi cuối kỳ', type: 'Thi' })).toBe(null)
    expect(resolveMode({ subject: 'Làm thêm', type: 'Làm việc' })).toBe(null)
    expect(resolveMode(null)).toBe(null)
  })
})

describe('modeLabel', () => {
  it('practice -> Thực hành, theory/mặc định -> Lý thuyết', () => {
    expect(modeLabel('practice')).toBe('Thực hành')
    expect(modeLabel('theory')).toBe('Lý thuyết')
    expect(modeLabel(undefined)).toBe('Lý thuyết')
  })
})

describe('normalizeMode', () => {
  it('buổi Học chưa có mode thì điền theo tên môn', () => {
    expect(normalizeMode(hoc())).toMatchObject({ mode: 'theory' })
    expect(normalizeMode(hoc({ subject: 'Tiếng Việt thực hành' }))).toMatchObject({ mode: 'practice' })
  })
  it('buổi Học đã có mode hợp lệ thì giữ', () => {
    expect(normalizeMode(hoc({ mode: 'practice' }))).toMatchObject({ mode: 'practice' })
  })
  it('buổi không phải Học thì bỏ mode', () => {
    expect(normalizeMode({ subject: 'X', type: 'Thi', mode: 'practice' })).not.toHaveProperty('mode')
  })
})

describe('cellStyleFor — nền theo hình thức, viền theo môn', () => {
  it('thực hành -> nền xanh lá', () => {
    expect(cellStyleFor(hoc({ mode: 'practice' }))).toMatchObject({ bg: KIND_BG.practice.bg })
    expect(cellStyleFor(hoc({ mode: 'practice' }), true)).toMatchObject({ bg: KIND_BG.practice.darkBg })
  })
  it('lý thuyết -> nền xám nhạt', () => {
    expect(cellStyleFor(hoc())).toMatchObject({ bg: KIND_BG.theory.bg })
    expect(cellStyleFor(hoc(), true)).toMatchObject({ bg: KIND_BG.theory.darkBg })
  })
  it('thi -> nền vàng nhạt, bất kể mode', () => {
    const exam = { subject: 'Thi cuối kỳ', type: 'Thi', mode: 'practice' }
    expect(cellStyleFor(exam)).toMatchObject({ bg: KIND_BG.exam.bg })
    expect(cellStyleFor(exam, true)).toMatchObject({ bg: KIND_BG.exam.darkBg })
  })
  it('Làm việc / Cá nhân -> giữ nền theo môn như trước', () => {
    const work = { subject: 'Làm thêm', type: 'Làm việc' }
    expect(cellStyleFor(work).bg).not.toBe(KIND_BG.practice.bg)
    expect(cellStyleFor(work).bg).not.toBe(KIND_BG.theory.bg)
    expect(cellStyleFor(work).bg).not.toBe(KIND_BG.exam.bg)
  })
  it('viền trái luôn là màu môn, kể cả khi nền đổi theo hình thức', () => {
    const a = hoc({ subject: 'Môn A', mode: 'practice' })
    const b = hoc({ subject: 'Môn A', mode: 'theory' })
    expect(cellStyleFor(a).border).toBe(cellStyleFor(b).border)
    expect(cellStyleFor(a).border).toBeTruthy()
  })
  it('bản tối khác bản sáng cho cả 3 loại', () => {
    for (const k of ['practice', 'theory', 'exam']) {
      expect(KIND_BG[k].darkBg).not.toBe(KIND_BG[k].bg)
    }
  })
})

// Tỉ lệ tương phản WCAG của màu chữ palette môn trên cả 3 nền hình thức
// (sáng + tối): tất cả phải >= 4.5:1 (chuẩn AA) thì mới giữ màu chữ
// palette như hiện tại thay vì đổi sang màu cố định.
function luminance(hex) {
  const c = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('tương phản chữ trên nền theo hình thức', () => {
  it('mọi màu chữ palette đều đạt >= 4.5:1 trên cả 3 nền, sáng và tối', () => {
    for (const kind of Object.values(KIND_BG)) {
      for (const p of PALETTE) {
        expect(contrast(p.text, kind.bg)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(p.darkText, kind.darkBg)).toBeGreaterThanOrEqual(4.5)
      }
    }
  })
})
