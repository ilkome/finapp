import type { Row } from '~~/services/powersync/transforms'

import { watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRow } from '~~/services/powersync/mutations'
import { recurrenceToRow, rowToRecurrence, trnToRow } from '~~/services/powersync/transforms'
import { generateId } from '~~/utils/generateId'

import type { OccurrenceMatchTrn } from '~/components/recurrences/occurrences'
import type { AmountChange, RecurrenceEndMode, RecurrenceFreq, RecurrenceId, RecurrenceItem, Recurrences, RecurrenceStatus } from '~/components/recurrences/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { addCivilDays, civilDayKey, civilDayStart, todayCivilDayEpoch } from '~/components/date/utils'
import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { buildOccurrenceTrn, generateForRule } from '~/components/recurrences/generate'
import { effectiveAmountFor, matchExistingOccurrences, occurrencesInRange, occurrenceTrnId, pendingConfirmOccurrences, remainingEndCount } from '~/components/recurrences/occurrences'
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

  const pendingAdoption = shallowRef<{ candidateIds: TrnId[], preselectedIds: TrnId[], ruleId: RecurrenceId } | null>(null)

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

  function linkTrnAsOccurrence(ruleId: RecurrenceId, day: number, trnId: TrnId, trn: TrnItem) {
    const newId = occurrenceTrnId(ruleId, day)
    if (newId === trnId) {
      trnsStore.saveTrn({ id: trnId, values: { ...trn, recurrenceId: ruleId } })
      return
    }
    trnsStore.saveTrn({ id: newId, values: { ...trn, recurrenceId: ruleId } })
    trnsStore.deleteTrn(trnId)
  }

  function createFromExistingTrn(trnId: TrnId, trn: TrnItem, config: RepeatConfig): RecurrenceId | undefined {
    if (trn.type === TrnType.Transfer || !('amount' in trn))
      return undefined
    if (trn.recurrenceId && items.value?.[trn.recurrenceId])
      return trn.recurrenceId

    const anchorDate = trn.date
    // Generate forward only: resume from today (so months between an old trn and now are NOT
    // backfilled as look-alike duplicates), but never before the anchor (whose occurrence is the
    // re-keyed existing trn, not a freshly generated one).
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
    linkTrnAsOccurrence(ruleId, civilDayStart(anchorDate), trnId, trn)
    scheduleCatchUp()
    return ruleId
  }

  /**
   * After converting an existing trn (openAdoption(ruleId, anchorTrnId)), gather the other already-
   * created look-alikes (same category + type, unlinked, not future) and match them to the rule's
   * occurrence days (drift-tolerant). Opens the "Link past payments?" sheet only when there is
   * something to adopt; price-stable matches are pre-selected.
   */
  function openAdoption(ruleId: RecurrenceId, anchorTrnId: TrnId) {
    const rule = items.value?.[ruleId]
    if (!rule) {
      pendingAdoption.value = null
      return
    }
    const today = todayCivilDayEpoch()
    const trns = trnsStore.items ?? {}
    const candidates: OccurrenceMatchTrn[] = []
    for (const [id, t] of Object.entries(trns)) {
      if (id === anchorTrnId || !('amount' in t) || t.recurrenceId != null)
        continue
      if (t.categoryId !== rule.categoryId || t.type !== rule.type || civilDayStart(t.date) > today)
        continue
      candidates.push({ amount: t.amount, date: t.date, id, recurrenceId: t.recurrenceId, type: t.type })
    }
    const matches = matchExistingOccurrences(rule, candidates)
    if (!matches.length) {
      pendingAdoption.value = null
      return
    }
    const preselectedIds = matches
      .filter(m => (trns[m.trnId] as { amount?: number }).amount === effectiveAmountFor(rule, m.day))
      .map(m => m.trnId)
    pendingAdoption.value = { candidateIds: matches.map(m => m.trnId), preselectedIds, ruleId }
  }

  /**
   * Adopt the user-chosen past trns into the series: re-key each to its occurrence and advance
   * generation past the latest adopted day (so a paid-early current period is never re-created).
   */
  function adoptOccurrences(ruleId: RecurrenceId, selectedTrnIds: TrnId[]) {
    pendingAdoption.value = null
    const rule = items.value?.[ruleId]
    if (!rule)
      return
    const trns = trnsStore.items ?? {}
    const candidates: OccurrenceMatchTrn[] = []
    for (const id of selectedTrnIds) {
      const t = trns[id]
      if (t && 'amount' in t)
        candidates.push({ amount: t.amount, date: t.date, id, recurrenceId: t.recurrenceId, type: t.type })
    }
    const matches = matchExistingOccurrences(rule, candidates)
    if (!matches.length)
      return
    let maxDay = rule.lastGeneratedDate ?? 0
    for (const { day, trnId } of matches) {
      const trn = trns[trnId]
      if (!trn)
        continue
      linkTrnAsOccurrence(ruleId, day, trnId, trn)
      if (day > maxDay)
        maxDay = day
    }
    writeRecurrence(ruleId, { ...rule, lastGeneratedDate: maxDay })
    scheduleCatchUp()
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
    setAmountHistory(id, history)
  }

  /**
   * Replace the whole price history - used to correct a mistaken effective-from date or drop an
   * erroneous change. Normalizes/sorts entries, re-derives the scalar `amount`, and reprices every
   * already-generated occurrence to its now-effective amount. Collapsing to a single base price
   * clears the history (the rule is "never changed" again).
   */
  function setAmountHistory(id: RecurrenceId, history: AmountChange[]) {
    const rule = items.value?.[id]
    if (!rule)
      return
    const normalized = history
      .filter(e => e.amount > 0)
      .map(e => ({ amount: e.amount, from: civilDayStart(e.from) }))
      .sort((a, b) => a.from - b.from)

    // Derive the scalar from the full history (base entry included) BEFORE collapsing, so deleting
    // the last change reverts `amount` to the base price rather than keeping the stale changed one.
    const amount = effectiveAmountFor({ ...rule, amountHistory: normalized }, todayCivilDayEpoch())
    const next: RecurrenceItem = { ...rule, amount, amountHistory: normalized.length > 1 ? normalized : undefined }
    writeRecurrence(id, next)

    // Reprice every already-generated occurrence - editing a date can shift prices in both
    // directions, so we can't scope to a single cutoff like the append path once could.
    const trns = trnsStore.items ?? {}
    for (const [trnId, trn] of Object.entries(trns)) {
      if (trn.recurrenceId !== id || !('amount' in trn))
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
    // An endMode='count' quota is counted from the anchor, so a bare re-anchor would reset it and
    // silently extend the series; keep only the not-yet-paid remainder.
    const endCount = remainingEndCount(rule, id, trnsStore.items ?? {}, anchorDate) ?? rule.endCount
    // Resume generation from just before the new anchor so it (and only it onward) can fire.
    writeRecurrence(id, { ...rule, anchorDate, endCount, lastGeneratedDate: addCivilDays(anchorDate, -1) })
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
        for (const t of trns) {
          // Skip already-materialized days so an early-paid trn (possibly edited) isn't clobbered.
          if (trnsStore.items?.[t.id])
            continue
          await upsertRow('trns', t.id, trnToRow(t.values, writeUid))
        }
        writeRecurrence(id, { ...rule, lastGeneratedDate })
      }
      catch (e) {
        logger.error('catch-up failed for rule', id, e)
      }
    }
  }

  return {
    activeItems,
    adoptOccurrences,
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
    openAdoption,
    pendingAdoption,
    removeRecurrence,
    rescheduleFrom,
    runCatchUp,
    saveRecurrence,
    setAmountHistory,
    setItems,
    setStatus,
    skipOccurrence,
  }
})
