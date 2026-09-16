// Module-level: one subscription for every menu that renders the status line.
const state = ref<'preparing' | 'ready' | 'unavailable'>('unavailable')
let armed = false

/**
 * Whether the app shell can start without network. `navigator.serviceWorker.ready` resolves only
 * after the worker's install step, and Workbox's install completes only once every precache entry
 * is stored, so "ready" means the full offline bundle is on the device.
 */
export function useOfflineReady() {
  if (import.meta.client && !armed && !import.meta.dev && 'serviceWorker' in navigator) {
    armed = true
    state.value = 'preparing'
    navigator.serviceWorker.ready.then(() => {
      state.value = 'ready'
    })
  }
  return { offlineState: state }
}
