import type { Row } from '~~/services/powersync/transforms'

import { watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRow } from '~~/services/powersync/mutations'
import { recurrenceToRow, rowToRecurrence, trnToRow } from '~~/services/powersync/transforms'
import { generateId } from '~~/utils/generateId'

import type { RecurrenceEndMode, RecurrenceFreq, RecurrenceId, RecurrenceItem, Recurrences, RecurrenceStatus } from '~/components/recurrences/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { addCivilDays, civilDayKey, civilDayStart, todayCivilDayEpoch } from '~/components/date/utils'
import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { buildOccurrenceTrn, generateForRule } from '~/components/recurrences/generate'
import { effectiveAmountFor, occurrencesInRange, occurrenceTrnId, pendingConfirmOccurrences } from '~/components/recurrences/occurrences'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { resolveWriteUid } from '~/composables/useAuthSession'
import { createDebouncedPersist, showErrorToast } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

// Config captured from the trn form's "Repeat" toggle (the trn supplies type/amount/wallet/category/date).
export type RepeatConfig = {
  autoCreate: boolean
  // Past start only: create every occurrence from the start date up to today. When false, no past
  // transactions are created - the subscription is only tracked going forward.
  backfill?: boolean
  endCount?: number | null
  endDate?: number | null
  endMode: RecurrenceEndMode
  freq: RecurrenceFreq
  interval: number
  monthLastDay?: boolean
}

const logger = createLogger('recurrences')

export const useRecurrencesStore = defineStore('recurrences', () => {
  const { isDemo } = useDemo()
  const { uid } = useSupabaseAuth()
  const trnsStore = useTrnsStore()

  const items = shallowRef<Recurrences | null>(null)
  const isLoaded = ref(false)
  let watchController: AbortController | null = null

  // Demo mode has no backend: persist rule mutations to localforage (matches trns/budgets).
  const persistRecurrences = createDebouncedPersist<Recurrences>(STORAGE_KEYS.recurrences)

  const hasItems = computed(() => Object.keys(items.value ?? {}).length > 0)

  // Render gate that avoids the empty-state flash during PowerSync hydration. Demo bypasses the
  // watch (isLoaded never flips), so it counts as ready immediately.
  const isReady = computed(() => isLoaded.value || isDemo.value)

  const activeItems = computed(() => {
    const out: Recurrences = {}
    for (const [id, r] of Object.entries(items.value ?? {})) {
      if (r.status === 'active')
        out[id] = r
    }
    return out
  })

  // Menu badge: due-to-confirm occurrences of active manual rules, via the same helper as the
  // Payments list so they can never disagree. todayCivilDayEpoch() is non-reactive by design
  // (same pattern as every other consumer): the count refreshes on any rules/trns change or reload.
  const dueConfirmCount = computed(() =>
    pendingConfirmOccurrences(Object.entries(items.value ?? {}), trnsStore.items ?? {}, todayCivilDayEpoch()).length,
  )

  function setItems(values: Recurrences | null) {
    items.value = values
  }

  // Coalesce catch-up requests (watch emits + local saves) into one deferred run, off the
  // watch callback's write lock. Idempotent generation makes extra runs harmless.
  let catchUpTimer: ReturnType<typeof setTimeout> | null = null
  function scheduleCatchUp() {
    if (isDemo.value)
      return
    if (catchUpTimer)
      clearTimeout(catchUpTimer)
    catchUpTimer = setTimeout(() => {
      catchUpTimer = null
      void runCatchUp()
    }, 0)
  }

  function initRecurrences(): void {
    if (isDemo.value)
      return
    watchController?.abort()
    isLoaded.value = false
    let isFirstEmit = true
    watchController = watchTable<Row>('SELECT * FROM recurrences', [], (rows) => {
      const isFirst = isFirstEmit
      isFirstEmit = false
      isLoaded.value = true
      if (isFirst && !rows.length && hasItems.value)
        return
      const map: Recurrences = {}
      for (const row of rows)
        map[row.id] = rowToRecurrence(row)
      setItems(map)
      // Run catch-up once rules are present (covers app reopen and fresh-login sync arrival).
      if (rows.length)
        scheduleCatchUp()
    })
    logger.log('watching recurrences')
  }

  function writeRecurrence(id: RecurrenceId, values: RecurrenceItem) {
    const withDate = { ...values, updatedAt: Date.now() }
    const prev = items.value
    const next = { ...(items.value ?? {}), [id]: withDate }
    setItems(next)
    if (isDemo.value) {
      persistRecurrences(next)
      return
    }
    upsertRow('recurrences', id, recurrenceToRow(withDate, resolveWriteUid(uid.value))).catch((e) => {
      setItems(prev)
      logger.error('saveRecurrence failed', e)
      showErrorToast('recurrences.errors.saveFailed')
    })
  }

  /** Create or update a rule. Returns the id (generated when omitted). */
  function saveRecurrence(values: RecurrenceItem, id?: RecurrenceId): RecurrenceId {
    const ruleId = id ?? generateId()
    writeRecurrence(ruleId, values)
    if (values.status === 'active' && values.autoCreate)
      scheduleCatchUp()
    return ruleId
  }

  /**
   * Primary creation path (the trn form "Repeat" toggle): turn the entered trn into a recurrence
   * whose START DATE is the trn's date. Behavior by start date (requests 1 & 3):
   *
   * - Future start: nothing is materialized now. The first occurrence appears on its date via
   *   catch-up (auto) or the pending list (manual) - stays out of history/balances until due.
   * - Today start: today's occurrence is created now.
   * - Past start with backfill: every occurrence from the start through today is created now
   *   (the full history), regardless of autoCreate.
   * - Past start without backfill: nothing is created now; the subscription is only tracked from
   *   its next future occurrence (the start date still fixes the cadence phase).
   *
   * Occurrences use the deterministic occurrence id, so ongoing catch-up / the edge cron never
   * double-create them.
   */
  function createFromTrn(trn: TrnItem, config: RepeatConfig): RecurrenceId | undefined {
    if (trn.type === TrnType.Transfer || !('amount' in trn))
      return undefined

    const anchorDate = civilDayStart(trn.date)
    const today = todayCivilDayEpoch()
    const isFuture = anchorDate > today
    const isPast = anchorDate < today
    const backfill = config.backfill ?? true
    // Create occurrences now for a today start, or a past start when backfilling.
    const materializeNow = !isFuture && (!isPast || backfill)

    const rule: RecurrenceItem = {
      amount: trn.amount,
      anchorDate,
      autoCreate: config.autoCreate,
      categoryId: trn.categoryId,
      ...(trn.desc ? { desc: trn.desc } : {}),
      ...(config.endCount != null ? { endCount: config.endCount } : {}),
      ...(config.endDate != null ? { endDate: config.endDate } : {}),
      endMode: config.endMode,
      freq: config.freq,
      interval: config.interval,
      // Future / materialize-now: null so the anchor (and range) generate. Past without backfill:
      // today, so only future occurrences are ever created.
      lastGeneratedDate: (isFuture || materializeNow) ? null : today,
      monthLastDay: config.monthLastDay ?? false,
      skipDates: [],
      status: 'active',
      type: trn.type,
      updatedAt: Date.now(),
      walletId: trn.walletId,
    }

    const ruleId = saveRecurrence(rule)

    if (materializeNow) {
      // Create the anchor and, for a backfilled past start, every occurrence through today.
      const days = occurrencesInRange(rule, { end: today, start: anchorDate })
      const now = Date.now()
      for (const day of days)
        trnsStore.saveTrn({ id: occurrenceTrnId(ruleId, day), values: buildOccurrenceTrn(rule, ruleId, day, now) })
      if (days.length)
        writeRecurrence(ruleId, { ...rule, lastGeneratedDate: days[days.length - 1]! })
    }
    // Keep ongoing catch-up going for future auto-create occurrences.
    scheduleCatchUp()
    return ruleId
  }

  /**
   * Convert an EXISTING trn into a recurring one (request 2): create a rule from the trn's
   * values and keep the trn as the first occurrence (its id is preserved and linked). Generation
   * resumes strictly after this occurrence, so the anchor is never re-created under another id.
   */
  function createFromExistingTrn(trnId: TrnId, trn: TrnItem, config: RepeatConfig): RecurrenceId | undefined {
    if (trn.type === TrnType.Transfer || !('amount' in trn))
      return undefined
    // The trn is already an occurrence of a series: never spawn a second rule (which would orphan
    // the first and re-link the trn). Schedule changes go through the rule editor (RecurrenceLink).
    if (trn.recurrenceId && items.value?.[trn.recurrenceId])
      return trn.recurrenceId

    const anchorDate = trn.date
    // Generate forward only: resume from today (so months between an old trn and now are NOT
    // backfilled as look-alike duplicates), but never before the anchor (so the existing trn -
    // which keeps its own id - is not re-created under a deterministic occurrence id).
    const lastGeneratedDate = Math.max(civilDayStart(anchorDate), todayCivilDayEpoch())
    const rule: RecurrenceItem = {
      amount: trn.amount,
      anchorDate,
      autoCreate: config.autoCreate,
      categoryId: trn.categoryId,
      ...(trn.desc ? { desc: trn.desc } : {}),
      ...(config.endCount != null ? { endCount: config.endCount } : {}),
      ...(config.endDate != null ? { endDate: config.endDate } : {}),
      endMode: config.endMode,
      freq: config.freq,
      interval: config.interval,
      lastGeneratedDate,
      monthLastDay: config.monthLastDay ?? false,
      skipDates: [],
      status: 'active',
      type: trn.type,
      updatedAt: Date.now(),
      walletId: trn.walletId,
    }

    const ruleId = saveRecurrence(rule)
    // Keep the original trn (and its id); just link it to the new rule.
    trnsStore.saveTrn({ id: trnId, values: { ...trn, recurrenceId: ruleId } })
    scheduleCatchUp()
    return ruleId
  }

  /** Delete the rule only; already-generated trns are kept. */
  function removeRecurrence(id: RecurrenceId) {
    const prev = items.value
    const next = { ...(items.value ?? {}) }
    delete next[id]
    setItems(next)
    if (isDemo.value) {
      persistRecurrences(next)
      return
    }
    deleteRow('recurrences', id).catch((e) => {
      setItems(prev)
      logger.error('removeRecurrence failed', e)
      showErrorToast('recurrences.errors.deleteFailed')
    })
  }

  function setStatus(id: RecurrenceId, status: RecurrenceStatus) {
    const rule = items.value?.[id]
    if (!rule)
      return
    writeRecurrence(id, { ...rule, status })
  }

  /** Skip a single occurrence day (also called when a generated trn is deleted). */
  function skipOccurrence(id: RecurrenceId, dayEpoch: number) {
    const rule = items.value?.[id]
    if (!rule)
      return
    const key = civilDayKey(dayEpoch)
    if (rule.skipDates.includes(key))
      return
    writeRecurrence(id, { ...rule, skipDates: [...rule.skipDates, key] })
  }

  /** Materialize one occurrence as a real trn (manual confirm; amount editable). */
  function confirmOccurrence(id: RecurrenceId, dayEpoch: number, amount?: number) {
    const rule = items.value?.[id]
    if (!rule)
      return
    const values = buildOccurrenceTrn(rule, id, dayEpoch, Date.now())
    if (amount != null && 'amount' in values)
      (values as Extract<TrnItem, { amount: number }>).amount = amount
    trnsStore.saveTrn({ id: occurrenceTrnId(id, dayEpoch), values })
  }

  /**
   * Change the series price effective from `fromDay` (request 4). Records the change in the
   * price history (seeding the original price on first change), updates the scalar `amount` to
   * whatever is effective today, and rewrites already-generated occurrences on/after `fromDay`
   * to the new price (occurrences before it keep their old price).
   */
  function changeAmount(id: RecurrenceId, newAmount: number, fromDay: number) {
    const rule = items.value?.[id]
    if (!rule || !(newAmount > 0))
      return
    const from = civilDayStart(fromDay)
    const history = rule.amountHistory?.length
      ? [...rule.amountHistory]
      : [{ amount: rule.amount, from: civilDayStart(rule.anchorDate) }]
    const existing = history.findIndex(e => civilDayStart(e.from) === from)
    if (existing >= 0)
      history[existing] = { amount: newAmount, from }
    else
      history.push({ amount: newAmount, from })
    history.sort((a, b) => a.from - b.from)

    const next: RecurrenceItem = { ...rule, amountHistory: history }
    next.amount = effectiveAmountFor(next, todayCivilDayEpoch())
    writeRecurrence(id, next)

    // Rewrite already-generated, on/after-`from` occurrences to the newly-effective price.
    const trns = trnsStore.items ?? {}
    for (const [trnId, trn] of Object.entries(trns)) {
      if (trn.recurrenceId !== id || !('amount' in trn) || civilDayStart(trn.date) < from)
        continue
      const amount = effectiveAmountFor(next, trn.date)
      if (trn.amount !== amount)
        trnsStore.saveTrn({ id: trnId, values: { ...trn, amount } })
    }
  }

  /**
   * Move the next charge to `newDay` and continue the cadence from there (request 4, simple
   * re-anchor). Already-generated occurrences stay; future ones follow the new phase. See
   * plans/recurrences-schedule-history.md for the richer dated-schedule alternative.
   */
  function rescheduleFrom(id: RecurrenceId, newDay: number) {
    const rule = items.value?.[id]
    if (!rule)
      return
    const anchorDate = civilDayStart(newDay)
    // Resume generation from just before the new anchor so it (and only it onward) can fire.
    writeRecurrence(id, { ...rule, anchorDate, lastGeneratedDate: addCivilDays(anchorDate, -1) })
    scheduleCatchUp()
  }

  /**
   * Idempotent client catch-up (offline immediacy): materialize all due occurrences for active
   * autoCreate rules up to the device's civil today. Safe to run repeatedly and alongside the
   * edge cron (deterministic ids converge). See plans/recurrences.md §6.
   */
  async function runCatchUp() {
    if (isDemo.value || !items.value)
      return
    const today = todayCivilDayEpoch()
    const now = Date.now()
    const writeUid = resolveWriteUid(uid.value)

    for (const [id, rule] of Object.entries(items.value)) {
      const { lastGeneratedDate, trns } = generateForRule(rule, id, today, now)
      if (!trns.length)
        continue
      try {
        for (const t of trns)
          await upsertRow('trns', t.id, trnToRow(t.values, writeUid))
        writeRecurrence(id, { ...rule, lastGeneratedDate })
      }
      catch (e) {
        logger.error('catch-up failed for rule', id, e)
      }
    }
  }

  return {
    activeItems,
    changeAmount,
    confirmOccurrence,
    createFromExistingTrn,
    createFromTrn,
    dueConfirmCount,
    hasItems,
    initRecurrences,
    isLoaded,
    isReady,
    items,
    removeRecurrence,
    rescheduleFrom,
    runCatchUp,
    saveRecurrence,
    setItems,
    setStatus,
    skipOccurrence,
  }
})
