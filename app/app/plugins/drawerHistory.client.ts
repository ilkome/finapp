import { installDrawerHistory } from '~/composables/useDrawerHistory'

// Wires the drawer Back-catcher (popstate + navigation guards) once the
// router exists. Client-only: it touches window.history.
export default defineNuxtPlugin(() => {
  installDrawerHistory(useRouter())
})
