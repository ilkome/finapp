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

/**
 * Amount effective on `dayEpoch`: the latest price-history entry whose `from` is on/before the
 * day, falling back to the earliest known price (days before the first entry) or the scalar
 * `amount` when there is no history. See plans/recurrences.md (request 4).
 */
export function effectiveAmountFor(rule: RecurrenceItem, dayEpoch: number): number {
  const history = rule.amountHistory
  if (!history?.length)
    return rule.amount
  const day = civilDayStart(dayEpoch)
  const sorted = [...history].sort((a, b) => a.from - b.from)
  let amount = sorted[0]!.amount
  for (const entry of sorted) {
    if (civilDayStart(entry.from) <= day)
      amount = entry.amount
    else
      break
  }
  return amount
}

export type OccurrenceState = 'drift' | 'overdue' | 'paid' | 'upcoming'

export type OccurrenceStatus = {
  /** Amount of the materialized trn, when one exists. */
  actual?: number
  /** Price expected for the day (amount-history aware). */
  expected: number
  state: OccurrenceState
  /** Deterministic id of the trn that would (or does) materialize this day. */
  trnId: string
}

/**
 * Realized status of one occurrence day, joining the rule to already-materialized trns: paid (a trn
 * exists at the expected price), drift (paid but the amount differs from the price effective that
 * day - a silent price change or a manual edit), overdue (past, no trn) or upcoming (future). The
 * lookup uses the deterministic occurrence id, matching how the rest of the engine detects "paid".
 */
export function occurrenceStatus(
  rule: RecurrenceItem,
  ruleId: RecurrenceId,
  dayEpoch: number,
  // Accepts the raw store map (Trns includes transfers with no `amount`); we only read `amount`.
  trns: Record<string, unknown>,
  todayEpoch: number,
): OccurrenceStatus {
  const trnId = occurrenceTrnId(ruleId, dayEpoch)
  const expected = effectiveAmountFor(rule, dayEpoch)
  const trn = trns[trnId] as { amount?: number } | undefined
  if (trn && trn.amount != null)
    return { actual: trn.amount, expected, state: trn.amount === expected ? 'paid' : 'drift', trnId }
  return { expected, state: dayEpoch <= todayEpoch ? 'overdue' : 'upcoming', trnId }
}

/**
 * Native-currency total of the rule's occurrences in `range`, priced per occurrence via
 * `effectiveAmountFor` (amount-history aware) rather than a flat `amount * count`. Single source of
 * truth for "committed cost over a window" - the totals card, the per-subscription drill-down and
 * the "by cost" sort all call it, so a future-dated price change can't make them disagree.
 */
export function committedNativeInRange(rule: RecurrenceItem, range: Range): number {
  return occurrencesInRange(rule, range).reduce((sum, day) => sum + effectiveAmountFor(rule, day), 0)
}

/** Minimal trn shape needed to decide whether a trn realizes an occurrence. */
export type OccurrenceMatchTrn = {
  amount: number
  date: number
  id: string
  recurrenceId?: string
  type: number
}

/**
 * Occurrence days in `range` NOT yet realized by a trn, so committed-cost math counts each upcoming
 * bill once. An occurrence is realized when EITHER its deterministic trn exists (materialized or
 * confirmed - fast path), OR an unconsumed candidate matches it: a linked instance (`recurrenceId ===
 * ruleId` on the same civil day, e.g. a createFromExistingTrn anchor) or a hand-entered look-alike
 * (unlinked, same type, exact effective price). `candidates` must already be scoped to the rule's
 * category and `range`; `consumed` is shared across rules so one trn realizes at most one occurrence.
 * Fixes the budget double-count where a hand-entered bill was counted as spend AND as committed.
 * Deliberately conservative: a drift / different-currency amount stays unmatched (still committed)
 * rather than risk falsely releasing a genuinely-unpaid bill.
 */
export function unrealizedOccurrenceDays(
  rule: RecurrenceItem,
  ruleId: RecurrenceId,
  range: Range,
  trns: Record<string, unknown>,
  candidates: OccurrenceMatchTrn[],
  consumed: Set<string>,
): number[] {
  const out: number[] = []
  for (const day of occurrencesInRange(rule, range)) {
    if (trns[occurrenceTrnId(ruleId, day)])
      continue
    const dayStart = civilDayStart(day)
    const expected = effectiveAmountFor(rule, day)
    const match = candidates.find(t =>
      !consumed.has(t.id)
      && (
        (t.recurrenceId === ruleId && civilDayStart(t.date) === dayStart)
        || (t.recurrenceId == null && t.type === rule.type && t.amount === expected)
      ),
    )
    if (match) {
      consumed.add(match.id)
      continue
    }
    out.push(day)
  }
  return out
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
