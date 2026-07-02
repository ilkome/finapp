import type { RecurrenceId, Recurrences } from '~/components/recurrences/types'

import { addCivilDays, civilDayKey } from '~/components/date/utils'
import { effectiveAmountFor, occurrencesInRange } from '~/components/recurrences/occurrences'

// Due-soon reminders (request 4): remind 3 days before, the day before, and on the day of each
// upcoming occurrence. The client computes these (it owns the occurrence engine) and queues them in
// `push_reminders`; the `send-reminders` edge cron delivers them as Web Push - so they arrive even
// when the app is closed.
export const REMINDER_OFFSETS = [3, 1, 0] as const
export type ReminderOffset = typeof REMINDER_OFFSETS[number]

// How far ahead to pre-queue. Must exceed the largest offset with margin so a monthly series always
// has its next reminders queued between app opens.
export const REMINDER_HORIZON_DAYS = 45

export type UpcomingReminder = {
  amount: number
  fireDate: number // civil day to notify (occurrence day minus offset)
  id: string // dedupe key: `${ruleId}:${occDayKey}:${offset}`
  occ: number
  offset: ReminderOffset
  ruleId: RecurrenceId
}

/** Reminders to queue for active rules over the next `horizonDays`, skipping any already in the past. */
export function upcomingReminders(rules: Recurrences, todayEpoch: number, horizonDays = REMINDER_HORIZON_DAYS): UpcomingReminder[] {
  const out: UpcomingReminder[] = []
  const end = addCivilDays(todayEpoch, horizonDays)
  for (const [ruleId, rule] of Object.entries(rules)) {
    if (rule.status !== 'active')
      continue
    for (const occ of occurrencesInRange(rule, { end, start: todayEpoch })) {
      for (const offset of REMINDER_OFFSETS) {
        const fireDate = addCivilDays(occ, -offset)
        if (fireDate < todayEpoch)
          continue
        out.push({ amount: effectiveAmountFor(rule, occ), fireDate, id: `${ruleId}:${civilDayKey(occ)}:${offset}`, occ, offset, ruleId })
      }
    }
  }
  return out
}
