import type { Range } from '~/components/date/types'
import type { AmountChange, RecurrenceEndMode, RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'

import { addCivilDays, addCivilMonths, addCivilYears, civilDayKey, civilDayStart, epochToCivilParts, lastDayOfMonthCivil } from '~/components/date/utils'

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

export type PriceHistoryEntry = AmountChange & { deltaPct?: number }

/**
 * Full price timeline ascending by `from`, each entry annotated with its %-change vs the previous
 * price. A rule with no history is seeded as a single entry from the scalar `amount` at the anchor,
 * so callers always get at least one row. The first entry has no `deltaPct`.
 */
export function priceHistoryTimeline(rule: RecurrenceItem): PriceHistoryEntry[] {
  const base = rule.amountHistory?.length ? [...rule.amountHistory] : [{ amount: rule.amount, from: civilDayStart(rule.anchorDate) }]
  const sorted = base.sort((a, b) => a.from - b.from)
  return sorted.map((entry, i) => {
    const prev = sorted[i - 1]
    const deltaPct = prev && prev.amount !== 0 ? (entry.amount - prev.amount) / prev.amount : undefined
    return { ...entry, deltaPct }
  })
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

// Rough length of one interval in days, deliberately OVER-estimating month/year so the
// "recent periods" window can never clip an occurrence. Matches the no-default switch of nthOccurrence.
function intervalDays(rule: RecurrenceItem): number {
  switch (rule.freq) {
    case 'day':
      return rule.interval
    case 'week':
      return rule.interval * 7
    case 'month':
      return rule.interval * 31
    case 'year':
      return rule.interval * 366
  }
}

/**
 * Cancel candidate: an active confirm-each rule whose 2 most recent already-due occurrences both went
 * unrealized (no trn). autoCreate rules are excluded - the catch-up runner always self-materializes
 * them, so they can't genuinely go stale. Skip-aware (skipped days aren't "due"). Requires >= 2 due
 * occurrences so a brand-new rule is never flagged.
 */
export function isStaleSubscription(rule: RecurrenceItem, ruleId: RecurrenceId, trns: Record<string, unknown>, todayEpoch: number): boolean {
  if (rule.status !== 'active' || rule.autoCreate)
    return false
  const start = addCivilDays(todayEpoch, -intervalDays(rule) * 3)
  const due = occurrencesInRange(rule, { end: todayEpoch, start })
  if (due.length < 2)
    return false
  return due.slice(-2).every(day => occurrenceStatus(rule, ruleId, day, trns, todayEpoch).state === 'overdue')
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

export type PeriodProgress = { paidCount: number, paidNative: number, totalCount: number, totalNative: number }

/**
 * Paid-vs-scheduled split of the rule's occurrences in `range`, native currency only (the caller
 * converts to base). "Paid" means a trn already materializes the day (drift counted as paid at its
 * ACTUAL amount, not the expected price), so `totalNative` = paid actuals + still-scheduled expecteds.
 */
export function periodProgress(rule: RecurrenceItem, ruleId: RecurrenceId, range: Range, trns: Record<string, unknown>, todayEpoch: number): PeriodProgress {
  let paidCount = 0
  let paidNative = 0
  let totalCount = 0
  let totalNative = 0
  for (const day of occurrencesInRange(rule, range)) {
    const status = occurrenceStatus(rule, ruleId, day, trns, todayEpoch)
    const amount = status.actual ?? status.expected
    totalCount++
    totalNative += amount
    if (status.state === 'paid' || status.state === 'drift') {
      paidCount++
      paidNative += amount
    }
  }
  return { paidCount, paidNative, totalCount, totalNative }
}

/**
 * How many of the rule's occurrences in `range` are already materialized by a trn carrying an
 * amount (i.e. paid). A drift / re-priced trn still counts as paid - it realizes the day via the
 * deterministic occurrence id, same as the rest of the engine.
 */
export function paidCountInRange(rule: RecurrenceItem, ruleId: RecurrenceId, range: Range, trns: Record<string, unknown>): number {
  let n = 0
  for (const day of occurrencesInRange(rule, range)) {
    const trn = trns[occurrenceTrnId(ruleId, day)] as { amount?: number } | undefined
    if (trn?.amount != null)
      n++
  }
  return n
}

/**
 * Remaining charge quota when an endMode='count' series is re-anchored to `newAnchor`: the total
 * quota minus charges already REALIZED before the new anchor. Unpaid (overdue) occurrences do not
 * consume quota - re-anchoring collapses them into the new schedule, so the user still gets the
 * charges they paid for. Returns null for other end modes (nothing to adjust).
 */
export function remainingEndCount(rule: RecurrenceItem, ruleId: RecurrenceId, trns: Record<string, unknown>, newAnchor: number): number | null {
  if (rule.endMode !== 'count' || rule.endCount == null)
    return null
  const start = civilDayStart(rule.anchorDate)
  const end = addCivilDays(civilDayStart(newAnchor), -1)
  if (end < start)
    return rule.endCount
  return Math.max(0, rule.endCount - paidCountInRange(rule, ruleId, { end, start }, trns))
}

/** Default end-date when a user switches to "ends on a date" without picking one: one year out. */
export const DEFAULT_END_DATE_MONTHS = 12

/**
 * The end field a mode implies when it is still unset, so the editor commits the default it already
 * SHOWS (the count stepper's '1', a concrete end date) instead of persisting null. A 'count' rule
 * with null endCount generates zero occurrences (endIndexExclusive -> 0), and a 'date' rule with
 * null endDate never ends (endDateInclusive -> +Infinity); both silently contradict the user. Only
 * the active mode's field is seeded, and only when null, so a real value is never overwritten.
 */
export function seedEndField(
  mode: RecurrenceEndMode,
  current: { endCount: number | null, endDate: number | null },
  now: number,
): { endCount: number | null, endDate: number | null } {
  if (mode === 'count' && current.endCount == null)
    return { ...current, endCount: 1 }
  if (mode === 'date' && current.endDate == null)
    return { ...current, endDate: addCivilMonths(civilDayStart(now), DEFAULT_END_DATE_MONTHS) }
  return current
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
  const a = epochToCivilParts(aMs)
  const b = epochToCivilParts(bMs)
  return (b.year - a.year) * 12 + (b.month - a.month)
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
    approx = Math.floor((epochToCivilParts(ms).year - epochToCivilParts(anchor).year) / rule.interval)

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
 * Earliest next occurrence (strictly after `now`) across `entries`, plus every rule landing on that
 * day (so same-day paydays aggregate instead of hiding one). Delegates to nextOccurrence, so it is
 * skip-aware, end-aware and cancelled-safe for free. Deliberately type-agnostic - callers filter by
 * rule type (e.g. income-only for the payday caption).
 */
export function earliestNextOccurrence(
  entries: [RecurrenceId, RecurrenceItem][],
  now: number,
): { day: number, rules: [RecurrenceId, RecurrenceItem][] } | undefined {
  let day: number | undefined
  let rules: [RecurrenceId, RecurrenceItem][] = []
  for (const entry of entries) {
    const occ = nextOccurrence(entry[1], now)
    if (occ == null)
      continue
    if (day == null || occ < day) {
      day = occ
      rules = [entry]
    }
    else if (occ === day) {
      rules.push(entry)
    }
  }
  return day == null ? undefined : { day, rules }
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

export type PendingOccurrence = { day: number, id: RecurrenceId, rule: RecurrenceItem }

/**
 * Manual (confirm-each) occurrences due through `todayEpoch` (inclusive - due-today counts)
 * with no materializing trn yet, ascending by day. Single source of truth for the Payments
 * "due to confirm" list and the menu badge, so the badge always equals the list it opens.
 */
export function pendingConfirmOccurrences(
  rules: [RecurrenceId, RecurrenceItem][],
  trns: Record<string, unknown>,
  todayEpoch: number,
): PendingOccurrence[] {
  const out: PendingOccurrence[] = []
  for (const [id, rule] of rules) {
    if (rule.status !== 'active' || rule.autoCreate)
      continue
    for (const day of dueOccurrences(rule, todayEpoch)) {
      if (!trns[occurrenceTrnId(id, day)])
        out.push({ day, id, rule })
    }
  }
  return out.sort((a, b) => a.day - b.day)
}
