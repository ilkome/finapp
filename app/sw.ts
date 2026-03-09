import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute, setCatchHandler } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()

// Precache static assets (JS, CSS, fonts, images) immediately on install
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Only cache 200 OK responses (skip redirects, opaque, error responses)
const cacheOkOnly = {
  cacheWillUpdate: async ({ response }: { response: Response }) =>
    response.status === 200 ? response : null,
}

// Navigation: serve cached HTML instantly, update in background
registerRoute(new NavigationRoute(new StaleWhileRevalidate({
  cacheName: 'pages',
  plugins: [cacheOkOnly],
})))

// i18n locale messages: serve cached, update in background
registerRoute(
  ({ url }) => url.pathname.startsWith('/_i18n/'),
  new StaleWhileRevalidate({ cacheName: 'i18n', plugins: [cacheOkOnly] }),
)

// Runtime caching for external resources
for (const origin of [
  'https://api.iconify.design',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
]) {
  registerRoute(({ url }) => url.origin === origin, new CacheFirst())
}

// Prevent uncaught errors when network fails offline
setCatchHandler(async () => Response.error())
