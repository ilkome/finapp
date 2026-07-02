import { useRecurrenceReminders } from '~/components/recurrences/useRecurrenceReminders'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'

// Re-queue due-soon reminders whenever recurrence rules load or change (app open + realtime). The
// server cron (send-reminders) delivers them as Web Push, so they arrive even when the app is closed.
export default defineNuxtPlugin(() => {
  const recurrencesStore = useRecurrencesStore()
  const { sync } = useRecurrenceReminders()

  let timer: ReturnType<typeof setTimeout> | null = null
  watch(() => recurrencesStore.items, () => {
    if (timer)
      clearTimeout(timer)
    timer = setTimeout(() => {
      void sync()
    }, 800)
  }, { immediate: true })
})
