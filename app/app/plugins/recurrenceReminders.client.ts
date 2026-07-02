import { useRecurrenceReminders } from '~/components/recurrences/useRecurrenceReminders'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'

// Fire local due-soon reminders whenever recurrence rules load or change (app open + realtime).
// Delivery while the app is closed is a follow-up (plans/push-notifications.md).
export default defineNuxtPlugin(() => {
  const recurrencesStore = useRecurrencesStore()
  const { run } = useRecurrenceReminders()

  let timer: ReturnType<typeof setTimeout> | null = null
  watch(() => recurrencesStore.items, () => {
    if (timer)
      clearTimeout(timer)
    timer = setTimeout(() => {
      void run()
    }, 500)
  }, { immediate: true })
})
