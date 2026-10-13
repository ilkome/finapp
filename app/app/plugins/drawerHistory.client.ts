import { installDrawerHistory } from '~/composables/useDrawerHistory'

// Wires the drawer Back-catcher's navigation guards once the router exists; its popstate
// listener is already registered by the import. Client-only: it touches window.history.
export default defineNuxtPlugin(() => {
  installDrawerHistory(useRouter())
})
