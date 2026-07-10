import type { RecurrenceId, RecurrenceItem, Recurrences } from '~/components/recurrences/types'

import { addCivilDays, civilDayKey, civilDayStart } from '~/components/date/utils'
import { effectiveAmountFor, occurrencesInRange } from '~/components/recurrences/occurrences'

// Due-soon reminders (request 4): remind 3 days before, the day before, and on the day of each
// upcoming occurrence. The client computes these (it owns the occurrence engine) and queues them in
// `push_reminders`; the `send-reminders` edge cron delivers them as Web Push - so they arrive even
// when the app is closed.
export const REMINDER_OFFSETS = [3, 1, 0] as const
export type ReminderOffset = typeof REMINDER_OFFSETS[number]

// Lead time for the "first charge / free-trial ends" and "price going up" heads-up (request 10):
// give the user a week to cancel before the money leaves. Single knob for both kinds.
export const LEAD_TIME_DAYS = 7

const DAY_MS = 86_400_000

// How far ahead to pre-queue. Must exceed the largest offset with margin so a monthly series always
// has its next reminders queued between app opens.
export const REMINDER_HORIZON_DAYS = 45

export type ReminderKind = 'due' | 'firstCharge' | 'priceHike'

export type UpcomingReminder = {
  amount: number
  fireDate: number // civil day to notify (occurrence day minus offset)
  id: string // dedupe key: `${ruleId}:${occDayKey}:${offset}`
  kind: ReminderKind
  occ: number
  offset: number
  previousAmount?: number // priceHike only: the price before the increase
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
        out.push({ amount: effectiveAmountFor(rule, occ), fireDate, id: `${ruleId}:${civilDayKey(occ)}:${offset}`, kind: 'due', occ, offset, ruleId })
      }
    }
    const firstCharge = firstChargeReminder(ruleId, rule, todayEpoch, end)
    if (firstCharge)
      out.push(firstCharge)
    const priceHike = priceHikeReminder(ruleId, rule, todayEpoch, end)
    if (priceHike)
      out.push(priceHike)
  }
  return out
}

/**
 * Heads-up before the FIRST charge of a series (a free trial converting, or a just-signed-up
 * subscription): fires `LEAD_TIME_DAYS` before the anchor's first occurrence, clamped to today so a
 * near anchor still fires once. Only for series whose anchor is today or later (past anchors have
 * already started charging).
 */
function firstChargeReminder(ruleId: RecurrenceId, rule: RecurrenceItem, todayEpoch: number, end: number): UpcomingReminder | null {
  const anchor = civilDayStart(rule.anchorDate)
  if (anchor < todayEpoch)
    return null
  const firstOcc = occurrencesInRange(rule, { end, start: anchor }).at(0)
  if (firstOcc == null)
    return null
  const fireDate = Math.max(todayEpoch, addCivilDays(firstOcc, -LEAD_TIME_DAYS))
  const offset = Math.round((firstOcc - fireDate) / DAY_MS)
  return { amount: effectiveAmountFor(rule, firstOcc), fireDate, id: `${ruleId}:first:${civilDayKey(firstOcc)}`, kind: 'firstCharge', occ: firstOcc, offset, ruleId }
}

/**
 * Heads-up before a price INCREASE takes effect: compares the two latest amount-history entries and,
 * if the newer one is higher, fires `LEAD_TIME_DAYS` before the first occurrence charged at the new
 * price (clamped to today). Fires once per hike (keyed by the entry's `from`), only while that higher
 * charge is still upcoming.
 */
function priceHikeReminder(ruleId: RecurrenceId, rule: RecurrenceItem, todayEpoch: number, end: number): UpcomingReminder | null {
  const history = rule.amountHistory
  if (!history || history.length < 2)
    return null
  const sorted = [...history].sort((a, b) => a.from - b.from)
  const latest = sorted.at(-1)!
  const prev = sorted.at(-2)!
  if (latest.amount <= prev.amount)
    return null
  const from = civilDayStart(latest.from)
  const firstAtNew = occurrencesInRange(rule, { end, start: from }).at(0)
  if (firstAtNew == null || firstAtNew < todayEpoch)
    return null
  const fireDate = Math.max(todayEpoch, addCivilDays(firstAtNew, -LEAD_TIME_DAYS))
  const offset = Math.round((firstAtNew - fireDate) / DAY_MS)
  return { amount: latest.amount, fireDate, id: `${ruleId}:hike:${civilDayKey(from)}`, kind: 'priceHike', occ: firstAtNew, offset, previousAmount: prev.amount, ruleId }
}
