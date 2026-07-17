import { useRecurrenceReminders } from '~/components/recurrences/useRecurrenceReminders'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

// Re-queue due-soon reminders whenever recurrence rules or trns load or change (app open + realtime).
// The server cron (send-reminders) delivers them as Web Push, so they arrive even when the app is
// closed. Trns matter because a materialized occurrence (paid early, confirmed, auto-created) must
// drop its queued reminders; sync itself no-ops when the resulting rows are unchanged.
//
// The translator comes from the global i18n instance (nuxtApp.$i18n): this runs outside a component
// setup, where useI18n() would throw MUST_BE_CALL_SETUP_TOP.
export default defineNuxtPlugin((nuxtApp) => {
  const recurrencesStore = useRecurrencesStore()
  const trnsStore = useTrnsStore()
  const { sync } = useRecurrenceReminders()

  let timer: ReturnType<typeof setTimeout> | null = null
  watch(() => [recurrencesStore.items, trnsStore.items], () => {
    if (timer)
      clearTimeout(timer)
    timer = setTimeout(() => {
      const i18n = nuxtApp.$i18n as { t: (key: string, params?: Record<string, unknown>) => string } | undefined
      if (i18n?.t)
        void sync((key, params) => i18n.t(key, params))
    }, 800)
  }, { immediate: true })
})
