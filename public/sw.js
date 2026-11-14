// Service worker tối giản, viết tay — không dùng plugin.
// Chỉ cache app shell; dữ liệu lịch vẫn nằm trong localStorage của từng máy.
const CACHE = 'schedulingapp-v1'
const SHELL = [
  '/',
  '/index.html',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png',
  '/manifest.webmanifest',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {}),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  // Chỉ xử lý request cùng origin (không cache font Google, CDN...).
  if (url.origin !== self.location.origin) return
  const isShell = SHELL.some((p) => url.pathname === p || url.pathname.endsWith(p))
  if (isShell) {
    // App shell: ưu tiên cache, offline vẫn mở được.
    event.respondWith(
      caches.match(event.request).then((hit) => hit || fetch(event.request)),
    )
    return
  }
  // Còn lại: ưu tiên mạng, rớt mạng thì dùng cache nếu có.
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {})
        return res
      })
      .catch(() => caches.match(event.request)),
  )
})
