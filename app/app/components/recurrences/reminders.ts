import type { RecurrenceId, Recurrences } from '~/components/recurrences/types'

import { addCivilDays, civilDayKey } from '~/components/date/utils'
import { effectiveAmountFor, occurrencesInRange } from '~/components/recurrences/occurrences'

// Due-soon reminders (request 4): remind at 3 days ahead, tomorrow, and today. Newest first so
// the nearest reminder is emitted last (most prominent). See plans/push-notifications.md for the
// Web Push backend that delivers these while the app is closed - currently local-only.
export const REMINDER_OFFSETS = [3, 1, 0] as const
export type ReminderOffset = typeof REMINDER_OFFSETS[number]

export type DueReminder = {
  amount: number
  day: number
  offset: ReminderOffset
  ruleId: RecurrenceId
}

/** Occurrences of active rules falling exactly 3 / 1 / 0 civil days after `todayEpoch`. */
export function dueReminders(rules: Recurrences, todayEpoch: number): DueReminder[] {
  const out: DueReminder[] = []
  for (const [ruleId, rule] of Object.entries(rules)) {
    if (rule.status !== 'active')
      continue
    for (const offset of REMINDER_OFFSETS) {
      const day = addCivilDays(todayEpoch, offset)
      if (occurrencesInRange(rule, { end: day, start: day }).length)
        out.push({ amount: effectiveAmountFor(rule, day), day, offset, ruleId })
    }
  }
  return out
}

/** Stable per-(rule, day, offset) key so a reminder fires once. */
export function reminderKey(r: DueReminder): string {
  return `${r.ruleId}:${civilDayKey(r.day)}:${r.offset}`
}
