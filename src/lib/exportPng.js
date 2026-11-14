// Xuất lưới tuần ra ảnh PNG bằng Canvas 2D — không thêm dependency
// (không dùng html2canvas). Vẽ tay: tiêu đề, cột Thứ 2–CN, hàng tiết 1–16
// với giờ từ preset đang dùng, khối môn tô màu giống SessionCard.
import { DAY_NAMES, PERIOD_TIMES } from './time.js'
import { colorFor } from './colors.js'
import { download } from './download.js'

const CANVAS_W = 1600
const LABEL_W = 130
const HEADER_H = 110
const ROW_H = 64

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 3)
}

/**
 * Vẽ lưới tuần của `sessions` ra canvas 2x rồi tải về file PNG.
 * @param {Array} sessions - các buổi (day 0=T2..6=CN, start/end là tiết)
 * @param {Array} times - mảng 16 khung giờ "H:MM - H:MM" (preset đang dùng)
 * @param {string} semesterName - VD: "HK1"
 */
export function exportTimetablePng(sessions = [], times = PERIOD_TIMES, semesterName = '') {
  return new Promise((resolve) => {
    const colW = (CANVAS_W - LABEL_W) / 7
    const canvas = document.createElement('canvas')
    canvas.width = CANVAS_W
    canvas.height = HEADER_H + 16 * ROW_H + 60
    const ctx = canvas.getContext('2d')

    // Nền + tiêu đề.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#111827'
    ctx.font = '800 40px sans-serif'
    ctx.fillText(`SchedulingApp — Lịch học ${semesterName}`, 40, 58)
    ctx.fillStyle = '#6b7280'
    ctx.font = '400 22px sans-serif'
    ctx.fillText(`Xuất ngày ${new Date().toLocaleDateString('vi-VN')} · Thứ 2 – Chủ nhật × Tiết 1–16`, 40, 92)

    // Header các ngày.
    ctx.font = '700 22px sans-serif'
    ctx.textAlign = 'center'
    DAY_NAMES.forEach((d, i) => {
      ctx.fillStyle = '#374151'
      ctx.fillText(d, LABEL_W + colW * i + colW / 2, HEADER_H - 12)
    })
    ctx.textAlign = 'left'

    // Lưới: hàng tiết + ô trống.
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    for (let p = 0; p < 16; p++) {
      const y = HEADER_H + p * ROW_H
      ctx.fillStyle = '#4b5563'
      ctx.font = '700 20px sans-serif'
      ctx.fillText(`Tiết ${p + 1}`, 16, y + 26)
      ctx.fillStyle = '#9ca3af'
      ctx.font = '400 17px sans-serif'
      ctx.fillText(times[p] || '', 16, y + 50)
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(CANVAS_W, y)
      ctx.stroke()
      for (let d = 0; d < 7; d++) {
        ctx.strokeRect(LABEL_W + d * colW, y, colW, ROW_H)
      }
    }

    // Khối môn.
    for (const s of sessions) {
      const c = colorFor(s.subject)
      const x = LABEL_W + s.day * colW + 4
      const y = HEADER_H + (s.start - 1) * ROW_H + 4
      const w = colW - 8
      const h = (s.end - s.start + 1) * ROW_H - 8
      ctx.fillStyle = c.bg
      roundRect(ctx, x, y, w, h, 10)
      ctx.fill()
      ctx.fillStyle = c.border
      ctx.fillRect(x, y, 6, h)
      ctx.fillStyle = c.text
      ctx.font = '700 20px sans-serif'
      const lines = wrapText(ctx, s.subject, w - 24)
      lines.forEach((line, i) => ctx.fillText(line, x + 16, y + 28 + i * 24))
      ctx.font = '400 18px sans-serif'
      const metaY = y + 28 + lines.length * 24
      if (s.room) ctx.fillText(s.room, x + 16, metaY)
      if (s.type === 'Thi') {
        ctx.fillStyle = '#dc2626'
        ctx.font = '700 18px sans-serif'
        ctx.fillText('THI', x + 16, metaY + 24)
      }
    }

    // Chân trang.
    ctx.fillStyle = '#9ca3af'
    ctx.font = '400 18px sans-serif'
    ctx.fillText('SchedulingApp — xếp lịch học sau khi đăng ký học phần', 40, canvas.height - 22)

    canvas.toBlob((blob) => {
      if (!blob) { resolve(false); return }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'schedulingapp-lich-hoc.png'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
      resolve(true)
    }, 'image/png')
  })
}

// Hàm thuần phục vụ test: tính kích thước canvas từ số tiết.
export function timetablePngSize(periodCount = 16) {
  return { width: CANVAS_W, height: HEADER_H + periodCount * ROW_H + 60 }
}
