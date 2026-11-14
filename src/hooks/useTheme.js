import { useCallback, useEffect, useState } from 'react'
import { backgroundStyle } from '../lib/theme.js'

export const THEME_KEY = 'schedulingapp-theme-v1'

const DEFAULT_THEME = { mode: 'system', background: 'default', customColor: '#4f46e5' }

function loadTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    if (!raw) return DEFAULT_THEME
    const p = JSON.parse(raw)
    return {
      mode: ['light', 'dark', 'system'].includes(p.mode) ? p.mode : 'system',
      background: typeof p.background === 'string' ? p.background : 'default',
      customColor: typeof p.customColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(p.customColor) ? p.customColor : '#4f46e5',
    }
  } catch { return DEFAULT_THEME }
}

/**
 * Giao diện sáng/tối + nền dashboard.
 * - mode: 'light' | 'dark' | 'system' (system theo OS, nghe thay đổi live).
 * - dark: đang tối thật hay không — dùng để chọn màu nền / màu khối môn.
 * - background / customColor: nền dashboard, lưu cùng key.
 * Hook tự gắn/gỡ class 'dark' trên <html> và nền cho <body>.
 */
export function useTheme() {
  const [settings, setSettings] = useState(loadTheme)
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, JSON.stringify(settings)) } catch { /* bỏ qua */ }
  }, [settings])

  const dark = settings.mode === 'dark' || (settings.mode === 'system' && systemDark)
  const bg = backgroundStyle(settings.background, settings.customColor, dark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.body.style.background = bg
    return () => { document.body.style.background = '' }
  }, [dark, bg])

  const setMode = useCallback((mode) => setSettings((s) => ({ ...s, mode })), [])
  const cycleMode = useCallback(() => {
    setSettings((s) => ({ ...s, mode: s.mode === 'light' ? 'dark' : s.mode === 'dark' ? 'system' : 'light' }))
  }, [])
  const setBackground = useCallback((background) => setSettings((s) => ({ ...s, background })), [])
  const setCustomColor = useCallback((customColor) => setSettings((s) => ({ ...s, customColor })), [])

  return {
    ...settings,
    dark,
    backgroundCss: bg,
    setMode,
    cycleMode,
    setBackground,
    setCustomColor,
  }
}
