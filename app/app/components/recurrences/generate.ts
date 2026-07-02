import type { RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { dueOccurrences, effectiveAmountFor, occurrenceTrnId } from '~/components/recurrences/occurrences'

// Idempotent generation shared by the client catch-up (on app open) and mirrored by the edge
// cron. Both compute the same deterministic trn ids, so concurrent/offline writes converge on
// one row via PowerSync last-write-wins. See plans/recurrences.md §5-6.

/** Build the trn that materializes one occurrence of a rule (deterministic id is set by caller). */
export function buildOccurrenceTrn(rule: RecurrenceItem, ruleId: RecurrenceId, dayEpoch: number, now: number): TrnItem {
  return {
    amount: effectiveAmountFor(rule, dayEpoch),
    categoryId: rule.categoryId,
    date: dayEpoch,
    ...(rule.desc ? { desc: rule.desc } : {}),
    enteredAt: now,
    recurrenceId: ruleId,
    type: rule.type,
    updatedAt: now,
    walletId: rule.walletId,
  } as TrnItem
}

export type GeneratedTrn = { id: TrnId, values: TrnItem }

export type GenerationResult = {
  lastGeneratedDate: number | null
  trns: GeneratedTrn[]
}

/**
 * Compute the trns to upsert for one autoCreate rule up to `todayEpoch`, plus the advanced
 * `lastGeneratedDate`. Pure: the caller performs the writes. Paused/manual/cancelled rules
 * generate nothing.
 */
export function generateForRule(rule: RecurrenceItem, ruleId: RecurrenceId, todayEpoch: number, now: number): GenerationResult {
  if (rule.status !== 'active' || !rule.autoCreate)
    return { lastGeneratedDate: rule.lastGeneratedDate ?? null, trns: [] }

  const occ = dueOccurrences(rule, todayEpoch)
  const trns = occ.map(day => ({
    id: occurrenceTrnId(ruleId, day),
    values: buildOccurrenceTrn(rule, ruleId, day, now),
  }))

  return {
    lastGeneratedDate: occ.length ? occ[occ.length - 1]! : (rule.lastGeneratedDate ?? null),
    trns,
  }
}
