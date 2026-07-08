import { installSheetHistory } from '~/composables/useSheetHistory'

// Wires the bottom-sheet Back-catcher (popstate + navigation guards) once the
// router exists. Client-only: it touches window.history.
export default defineNuxtPlugin(() => {
  installSheetHistory(useRouter())
})
