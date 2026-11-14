import { useEffect, useState } from 'react'
import { PERIOD_TIMES, validatePeriodTimes } from '../lib/time.js'
import { PRESETS, presetById } from '../data/presets.js'

export const PRESET_KEY = 'schedulingapp-preset-v1'

function loadPreset() {
  try {
    const raw = localStorage.getItem(PRESET_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p.presetId === 'custom' && validatePeriodTimes(p.customTimes) === null) {
        return { presetId: 'custom', customTimes: p.customTimes }
      }
      if (PRESETS.some((x) => x.id === p.presetId)) return { presetId: p.presetId, customTimes: null }
    }
  } catch { /* dùng mặc định */ }
  return { presetId: 'iuh', customTimes: null }
}

/**
 * Khung giờ tiết đang dùng.
 * - presetId: 'iuh' | 'generic50' | 'custom'
 * - times: mảng 16 chuỗi "H:MM - H:MM" đang có hiệu lực.
 * - setPreset(id): chọn preset có sẵn.
 * - setCustom(times): lưu khung giờ tự chỉnh — chỉ lưu khi hợp lệ,
 *   ngược lại trả về chuỗi lỗi và không đổi gì.
 * - resetToIuh(): về lại khung giờ IUH.
 */
export function usePreset() {
  const [state, setState] = useState(loadPreset)

  useEffect(() => {
    try { localStorage.setItem(PRESET_KEY, JSON.stringify(state)) } catch { /* bỏ qua */ }
  }, [state])

  const times = state.presetId === 'custom'
    ? state.customTimes
    : presetById(state.presetId).times

  function setPreset(id) {
    if (id === 'custom') {
      // Vào chế độ tùy chỉnh với khung giờ hiện tại làm điểm bắt đầu.
      setState({ presetId: 'custom', customTimes: times })
      return
    }
    setState({ presetId: id, customTimes: null })
  }

  function setCustom(nextTimes) {
    const err = validatePeriodTimes(nextTimes)
    if (err) return err
    setState({ presetId: 'custom', customTimes: [...nextTimes] })
    return null
  }

  function resetToIuh() {
    setState({ presetId: 'iuh', customTimes: null })
  }

  return {
    presetId: state.presetId,
    customTimes: state.customTimes,
    times: times || PERIOD_TIMES,
    presets: PRESETS,
    setPreset,
    setCustom,
    resetToIuh,
  }
}
