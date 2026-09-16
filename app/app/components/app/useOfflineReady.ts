export type OfflineState = 'preparing' | 'ready' | 'unavailable' | 'updateReady' | 'updating'

// Module-level: one subscription for every menu that renders the status line.
const state = ref<OfflineState>('unavailable')
let registration: ServiceWorkerRegistration | null = null
let armed = false

function sync() {
  if (!registration)
    return
  // Workbox's install completes only once every precache entry is stored, so an `installed`
  // worker is a fully downloaded version. With registerType 'prompt' it waits for skipWaiting.
  if (registration.waiting)
    state.value = 'updateReady'
  else if (registration.installing)
    state.value = registration.active ? 'updating' : 'preparing'
  else
    state.value = registration.active ? 'ready' : 'preparing'
}

async function watchRegistration() {
  registration = await navigator.serviceWorker.ready
  sync()
  registration.addEventListener('updatefound', () => {
    sync()
    registration?.installing?.addEventListener('statechange', sync)
  })
}

/**
 * Whether the app shell can start without network, and whether a newer build is downloading or
 * ready. `navigator.serviceWorker.ready` resolves only after the first worker installed.
 */
export function useOfflineReady() {
  if (import.meta.client && !armed && !import.meta.dev && 'serviceWorker' in navigator) {
    armed = true
    state.value = 'preparing'
    watchRegistration()
  }

  /** Activate the waiting version and reload into it. */
  function applyUpdate() {
    if (!registration?.waiting)
      return
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true })
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }

  return { applyUpdate, offlineState: state }
}
