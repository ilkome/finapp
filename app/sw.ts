import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, PrecacheController, PrecacheRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute, setCatchHandler } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()

// Set up precache controller with build manifest (injected by vite-plugin-pwa)
// Using addToCacheList (NOT precache) — does NOT register install/activate listeners
const pc = new PrecacheController()
pc.addToCacheList(self.__WB_MANIFEST)

// Route: serve precached files when available
registerRoute(new PrecacheRoute(pc))

// Cleanup caches from previous SW versions
cleanupOutdatedCaches()

// Only cache 200 OK responses (skip redirects, opaque, error responses)
const cacheOkOnly = {
  cacheWillUpdate: async ({ response }: { response: Response }) =>
    response.status === 200 ? response : null,
}

// Navigation: network-first with offline fallback to cached HTML
registerRoute(new NavigationRoute(new NetworkFirst({
  cacheName: 'pages',
  plugins: [cacheOkOnly],
})))

// i18n locale messages: network-first for offline support
registerRoute(
  ({ url }) => url.pathname.startsWith('/_i18n/'),
  new NetworkFirst({ cacheName: 'i18n', plugins: [cacheOkOnly] }),
)

// Runtime caching for external resources
for (const origin of [
  'https://api.iconify.design',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
]) {
  registerRoute(({ url }) => url.origin === origin, new CacheFirst())
}

// Prevent uncaught errors when precache or network fails (e.g. offline before precaching completes)
setCatchHandler(async () => Response.error())

// Defer precaching until app signals auth is ready
let precached = false
self.addEventListener('message', (event) => {
  if (event.data?.type === 'PRECACHE_APP' && !precached) {
    precached = true
    event.waitUntil(
      pc.install(event).then(() => pc.activate(event)),
    )
  }
})
