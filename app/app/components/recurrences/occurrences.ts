import type { Range } from '~/components/date/types'
import type { RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'

import { addCivilDays, addCivilMonths, addCivilYears, civilDayKey, civilDayStart, lastDayOfMonthCivil } from '~/components/date/utils'

// Pure civil-date occurrence engine. Occurrences are NEVER stored; they are computed
// deterministically from the rule (no timezone involved). See plans/recurrences.md §4.

const DAY_MS = 86_400_000
// Hard caps so a malformed rule (e.g. interval 0 already rejected, but defensively) or a huge
// open-ended range can never spin forever.
const MAX_STEPS = 100_000
const MAX_RESULTS = 5000

/** Deterministic id of the trn materializing `dayEpoch` for `ruleId` (cron/devices converge). */
export function occurrenceTrnId(ruleId: RecurrenceId, dayEpoch: number): string {
  return `${ruleId}:${civilDayKey(dayEpoch)}`
}

/** The n-th occurrence civil day (n >= 0; n = 0 is the anchor), clamp/last-day aware. */
export function nthOccurrence(rule: RecurrenceItem, n: number): number {
  const anchor = civilDayStart(rule.anchorDate)
  const step = n * rule.interval
  switch (rule.freq) {
    case 'day':
      return addCivilDays(anchor, step)
    case 'week':
      return addCivilDays(anchor, step * 7)
    case 'month': {
      const base = addCivilMonths(anchor, step)
      return rule.monthLastDay ? lastDayOfMonthCivil(base) : base
    }
    case 'year':
      return addCivilYears(anchor, step)
  }
}

function monthsBetween(aMs: number, bMs: number): number {
  const a = new Date(aMs)
  const b = new Date(bMs)
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth())
}

// First index whose occurrence is >= ms (so callers don't linearly scan from the anchor over
// years of history). Approximate, then nudge to be exact.
function firstIndexOnOrAfter(rule: RecurrenceItem, ms: number): number {
  const anchor = civilDayStart(rule.anchorDate)
  if (ms <= anchor)
    return 0

  let approx = 0
  if (rule.freq === 'day')
    approx = Math.floor((ms - anchor) / (DAY_MS * rule.interval))
  else if (rule.freq === 'week')
    approx = Math.floor((ms - anchor) / (DAY_MS * 7 * rule.interval))
  else if (rule.freq === 'month')
    approx = Math.floor(monthsBetween(anchor, ms) / rule.interval)
  else
    approx = Math.floor((new Date(ms).getUTCFullYear() - new Date(anchor).getUTCFullYear()) / rule.interval)

  let n = Math.max(0, approx - 2)
  let steps = 0
  while (nthOccurrence(rule, n) < ms && steps++ < MAX_STEPS)
    n++
  return n
}

function endIndexExclusive(rule: RecurrenceItem): number {
  return rule.endMode === 'count' ? (rule.endCount ?? 0) : Number.POSITIVE_INFINITY
}

function endDateInclusive(rule: RecurrenceItem): number {
  return rule.endMode === 'date' ? (rule.endDate ?? Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY
}

/** Occurrence civil days within [range.start, range.end] (inclusive), skip-aware, end-aware. */
export function occurrencesInRange(rule: RecurrenceItem, range: Range): number[] {
  const result: number[] = []
  if (rule.status === 'cancelled')
    return result

  const skip = new Set(rule.skipDates ?? [])
  const maxN = endIndexExclusive(rule)
  const endDate = endDateInclusive(rule)

  for (let n = firstIndexOnOrAfter(rule, range.start); n < maxN; n++) {
    const occ = nthOccurrence(rule, n)
    if (occ > range.end || occ > endDate)
      break
    if (occ < range.start)
      continue
    if (skip.has(civilDayKey(occ)))
      continue
    result.push(occ)
    if (result.length >= MAX_RESULTS)
      break
  }

  return result
}

/** First occurrence strictly after `now` (skip-aware, end-aware), or undefined. */
export function nextOccurrence(rule: RecurrenceItem, now: number): number | undefined {
  if (rule.status === 'cancelled')
    return undefined

  const skip = new Set(rule.skipDates ?? [])
  const maxN = endIndexExclusive(rule)
  const endDate = endDateInclusive(rule)

  for (let n = firstIndexOnOrAfter(rule, now + 1); n < maxN; n++) {
    const occ = nthOccurrence(rule, n)
    if (occ > endDate)
      return undefined
    if (occ <= now)
      continue
    if (skip.has(civilDayKey(occ)))
      continue
    return occ
  }

  return undefined
}

/**
 * Due occurrences to materialize for an autoCreate rule: every occurrence strictly after
 * `lastGeneratedDate` (or the anchor on first run) through `todayEpoch` inclusive. Materializing
 * EVERY missed occurrence (not just the first) avoids the Actual Budget catch-up bug.
 */
export function dueOccurrences(rule: RecurrenceItem, todayEpoch: number): number[] {
  const start = rule.lastGeneratedDate != null
    ? addCivilDays(civilDayStart(rule.lastGeneratedDate), 1)
    : civilDayStart(rule.anchorDate)
  if (start > todayEpoch)
    return []
  return occurrencesInRange(rule, { end: todayEpoch, start })
}
