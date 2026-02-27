import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, PrecacheController, PrecacheRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'

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

// Runtime caching for external resources
for (const origin of [
  'https://api.iconify.design',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
]) {
  registerRoute(({ url }) => url.origin === origin, new CacheFirst())
}

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
