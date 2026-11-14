import { describe, expect, it } from 'vitest'
import { parseCsvTsv, parseIuhPaste, parseQuickPaste } from './importers.js'

describe('parseQuickPaste', () => {
  it('đọc đúng một dòng hợp lệ', () => {
    const { sessions, failed } = parseQuickPaste('Lập trình WWW (Java) | Thứ 2 | 4-6 | H3.1.1 | Đặng Thị Thu Hà')
    expect(failed).toHaveLength(0)
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toMatchObject({ subject: 'Lập trình WWW (Java)', day: 0, start: 4, end: 6, room: 'H3.1.1' })
  })

  it('dòng thiếu thứ vào failed, không tự đoán', () => {
    const { sessions, failed } = parseQuickPaste('Môn X |  | 1-3')
    expect(sessions).toHaveLength(0)
    expect(failed).toHaveLength(1)
  })
})

describe('parseIuhPaste', () => {
  const block = [
    'Thứ 2',
    'Đảm bảo chất lượng và Kiểm thử phần mềm',
    'DHKTPM19BTT - 422000402302',
    'Tiết: 1 - 3',
    'Phòng: V12.01',
    'GV: Châu Thị Bảo Hà',
  ].join('\n')

  it('đọc đúng khối dán từ web trường', () => {
    const { sessions, failed } = parseIuhPaste(block)
    expect(failed).toHaveLength(0)
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toMatchObject({
      subject: 'Đảm bảo chất lượng và Kiểm thử phần mềm',
      day: 0, start: 1, end: 3, room: 'V12.01',
      teacher: 'Châu Thị Bảo Hà', code: '422000402302',
    })
  })

  it('khối thiếu Thứ vào failed và không bịa ngày', () => {
    const { sessions, failed } = parseIuhPaste(block.replace('Thứ 2\n', ''))
    expect(sessions).toHaveLength(0)
    expect(failed).toHaveLength(1)
    expect(failed[0].reason).toMatch(/Thứ/)
  })
})

describe('parseCsvTsv', () => {
  it('đọc đúng tiêu đề + một dòng CSV', () => {
    const text = 'Môn,Thứ,Tiết bắt đầu,Tiết kết thúc,Phòng,GV,Mã\nThống kê,Thứ 5,10,12,V10.04,Phan Hồng Tín,422000435002'
    const { sessions, failed } = parseCsvTsv(text)
    expect(failed).toHaveLength(0)
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toMatchObject({ subject: 'Thống kê', day: 3, start: 10, end: 12 })
  })
})
