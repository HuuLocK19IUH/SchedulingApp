import { useEffect, useState } from 'react'

/**
 * Bắt sự kiện beforeinstallprompt để hiện nút "Cài đặt app" thật.
 * Nếu sự kiện không bao giờ tới (đã cài rồi / trình duyệt không hỗ trợ)
 * thì trả về canInstall=false — giao diện sẽ hướng dẫn cài bằng tay,
 * không giả vờ cài được.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState(null)

  useEffect(() => {
    function onPrompt(e) {
      e.preventDefault()
      setDeferred(e)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  async function promptInstall() {
    if (!deferred) return false
    deferred.prompt()
    const choice = await deferred.userChoice.catch(() => null)
    setDeferred(null)
    return choice?.outcome === 'accepted'
  }

  return { canInstall: !!deferred, promptInstall }
}
