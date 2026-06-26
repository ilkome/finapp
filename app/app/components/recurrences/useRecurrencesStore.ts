import type { Row } from '~~/services/powersync/transforms'

import { watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRow } from '~~/services/powersync/mutations'
import { recurrenceToRow, rowToRecurrence, trnToRow } from '~~/services/powersync/transforms'
import { generateId } from '~~/utils/generateId'

import type { RecurrenceEndMode, RecurrenceFreq, RecurrenceId, RecurrenceItem, Recurrences, RecurrenceStatus } from '~/components/recurrences/types'
import type { TrnItem } from '~/components/trns/types'

import { civilDayKey, todayCivilDayEpoch } from '~/components/date/utils'
import { useDemo } from '~/components/demo/useDemo'
import { buildOccurrenceTrn, generateForRule } from '~/components/recurrences/generate'
import { occurrenceTrnId } from '~/components/recurrences/occurrences'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { resolveWriteUid } from '~/composables/useAuthSession'
import { showErrorToast } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

// Config captured from the trn form's "Repeat" toggle (the trn supplies type/amount/wallet/category/date).
export type RepeatConfig = {
  autoCreate: boolean
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
    setItems({ ...(items.value ?? {}), [id]: withDate })
    if (isDemo.value)
      return
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
   * Primary creation path (the trn form "Repeat" toggle): turn the entered trn into a
   * recurrence whose first occurrence IS that trn (shared deterministic id, so generation
   * never double-creates it). See plans/recurrences.md §9.
   */
  function createFromTrn(trn: TrnItem, config: RepeatConfig): RecurrenceId | undefined {
    if (trn.type === TrnType.Transfer || !('amount' in trn))
      return undefined

    const anchorDate = trn.date
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
      // The entered trn is the first occurrence, so generation resumes after the anchor.
      lastGeneratedDate: anchorDate,
      monthLastDay: config.monthLastDay ?? false,
      skipDates: [],
      status: 'active',
      type: trn.type,
      updatedAt: Date.now(),
      walletId: trn.walletId,
    }

    const ruleId = saveRecurrence(rule)
    // Persist the entered trn under the deterministic id, linked to the rule.
    trnsStore.saveTrn({ id: occurrenceTrnId(ruleId, anchorDate), values: { ...trn, recurrenceId: ruleId } })
    // Fill any further due occurrences if the anchor is in the past (autoCreate).
    scheduleCatchUp()
    return ruleId
  }

  /** Delete the rule only; already-generated trns are kept. */
  function removeRecurrence(id: RecurrenceId) {
    const prev = items.value
    const next = { ...(items.value ?? {}) }
    delete next[id]
    setItems(next)
    if (isDemo.value)
      return
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
    confirmOccurrence,
    createFromTrn,
    hasItems,
    initRecurrences,
    isLoaded,
    isReady,
    items,
    removeRecurrence,
    runCatchUp,
    saveRecurrence,
    setItems,
    setStatus,
    skipOccurrence,
  }
})
