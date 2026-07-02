// Pulled into the Workbox SW via workbox.importScripts (nuxt.config.ts).

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  }
  catch {
    data = { body: event.data ? event.data.text() : '', title: 'Finapp' }
  }

  const title = data.title || 'Finapp'
  const options = {
    // Android status-bar icon: must be a monochrome silhouette, not the color icon.
    badge: '/badge-96x96.png',
    body: data.body || '',
    data: { url: data.url || '/dashboard' },
    icon: data.icon || '/pwa-192x192.png',
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || '/dashboard'

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
      for (const client of clients) {
        // Focus an existing window and route it to the target instead of opening a new tab.
        if ('focus' in client) {
          client.navigate(target)
          return client.focus()
        }
      }
      if (self.clients.openWindow)
        return self.clients.openWindow(target)
    }),
  )
})
