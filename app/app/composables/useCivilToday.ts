import type { Ref } from 'vue'

import { startOfTomorrow } from 'date-fns'
import { readonly, ref } from 'vue'
import { todayCivilDayEpoch } from '~~/utils/date/civil'

/**
 * Reactive civil "today", so computeds reading it (loan due/overdue status, etc.)
 * update at midnight instead of staying stale until an unrelated store mutation.
 * Module-level singleton: one midnight timer per tab, not per composable call site.
 */
const today = ref(todayCivilDayEpoch())

function scheduleMidnightRefresh() {
  // Local midnight: the civil day epoch is UTC midnight, which is hours off the device's day change.
  const delay = Math.max(startOfTomorrow().getTime() - Date.now(), 1000)
  setTimeout(() => {
    today.value = todayCivilDayEpoch()
    scheduleMidnightRefresh()
  }, delay)
}

if (import.meta.client) {
  scheduleMidnightRefresh()
  // Background tabs throttle setTimeout, so also refresh on becoming visible again.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible')
      today.value = todayCivilDayEpoch()
  })
}

export function useCivilToday(): Readonly<Ref<number>> {
  return readonly(today)
}
