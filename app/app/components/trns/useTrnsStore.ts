import type { Row } from '~~/services/powersync/transforms'

import { watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRow } from '~~/services/powersync/mutations'
import { trnToRow } from '~~/services/powersync/transforms'

import type { Range } from '~/components/date/types'
import type { TrnId, TrnItem, TrnItemFull, Trns, TrnsGetterProps } from '~/components/trns/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getEndOf, getStartOf } from '~/components/date/utils'
import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { filterTrnsIds } from '~/components/trns/getTrns'
import { reconcileTrns, rowsToTrns } from '~/components/trns/reconcile'
import { TrnType } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { resolveWriteUid } from '~/composables/useAuthSession'
import { persistStoreCache } from '~/composables/useStoreCache'
import { createDebouncedPersist, showErrorToast } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

const logger = createLogger('trns')

// trns is the largest table, so its watch coalesces more aggressively than the 30ms default;
// the optimistic write already updated the UI, so the delayed re-query echo is imperceptible.
const TRNS_WATCH_THROTTLE_MS = 120

export const useTrnsStore = defineStore('trns', () => {
  const categoriesStore = useCategoriesStore()
  const walletsStore = useWalletsStore()
  const { isDemo } = useDemo()
  const { uid } = useSupabaseAuth()

  const items = shallowRef<Trns | null>(null)
  // True after the first local-SQLite emission; reset on (re)subscribe so a new user waits for theirs.
  const isLoaded = ref(false)

  let watchController: AbortController | null = null

  function getStoreTrnsIds(props: TrnsGetterProps) {
    return filterTrnsIds({
      ...props,
      categoriesIds: props.categoriesIds?.length
        ? categoriesStore.getTransactibleIds(props.categoriesIds)
        : props.categoriesIds,
      trnsItems: items.value ?? undefined,
    })
  }

  function getRange(trnsIds: TrnId[]): Range {
    if (!items.value || !trnsIds.length) {
      return {
        end: getEndOf(new Date(), 'day').getTime(),
        start: getStartOf(new Date(), 'day').getTime(),
      }
    }

    let min = Infinity
    let max = -Infinity
    for (const id of trnsIds) {
      const date = items.value[id]?.date
      if (date != null) {
        if (date < min)
          min = date
        if (date > max)
          max = date
      }
    }

    return {
      end: max !== -Infinity ? max : getEndOf(new Date(), 'day').getTime(),
      start: min !== Infinity ? min : getStartOf(new Date(), 'day').getTime(),
    }
  }

  const hasItems = computed(() => Object.keys(items.value ?? {}).length > 0)

  const lastCreatedTrnId = computed<TrnId | undefined>(() => {
    if (!hasItems.value)
      return undefined

    let latestId: TrnId | undefined
    let latestDate = -1

    for (const trnId of Object.keys(items.value!)) {
      const trn = items.value![trnId]
      if (!trn || trn.type === TrnType.Transfer || trn.categoryId === 'adjustment')
        continue
      if (trn.date > latestDate) {
        latestDate = trn.date
        latestId = trnId
      }
    }

    return latestId
  })

  const lastCreatedTrnItem = computed<TrnItem | undefined>(() => lastCreatedTrnId.value ? items.value?.[lastCreatedTrnId.value] : undefined)

  const debouncedPersist = createDebouncedPersist<Trns | null>(STORAGE_KEYS.trns)

  function setTrns(values: Trns | null) {
    items.value = values
    // Demo persists to localforage; real mode mirrors into the per-user cold-start blob
    // (PowerSync SQLite stays the source of truth).
    if (isDemo.value)
      debouncedPersist(values)
    else
      persistStoreCache('trns', values)
  }

  /** Cold-start paint: seed items from the snapshot before the watch emits (no-op once it has). */
  function primeFromCache(data: Trns | null): void {
    if (isDemo.value || !data || isLoaded.value)
      return
    items.value = data
  }

  /** Real mode: subscribe to local SQLite. Fires immediately and on every sync/local write. */
  function initTrns(): void {
    if (isDemo.value)
      return
    watchController?.abort()
    isLoaded.value = false // re-subscribe (e.g. different user) waits for a fresh emission
    let isFirstEmit = true
    watchController = watchTable<Row>('SELECT * FROM trns', [], (rows) => {
      const isFirst = isFirstEmit
      isFirstEmit = false
      isLoaded.value = true
      // An empty FIRST emission means local SQLite hasn't received the first sync yet
      // (fresh device) - keep the primed cache. Later empty emissions are genuine wipes.
      if (isFirst && !rows.length && hasItems.value)
        return
      const prev = items.value
      // Cold-start instrumentation: per-row materialize+transform cost vs the SQLite scan
      // (`ps:watch:trns` measure) - feeds the blob-cache architecture decision.
      const transformStart = isFirst ? performance.now() : 0
      const next = prev ? reconcileTrns(prev, rows) : rowsToTrns(rows)
      if (isFirst)
        performance.measure('trns:first-transform', { duration: performance.now() - transformStart, start: transformStart })
      // reconcileTrns returns `prev` (same ref) when nothing changed - skip the rebuild
      // (this is the echo of our own optimistic write).
      if (next !== prev)
        setTrns(next)
    }, TRNS_WATCH_THROTTLE_MS)
    logger.log('watching trns')
  }

  function saveTrn({ id, values }: { id: TrnId, values: TrnItem }) {
    const valuesWithEditDate = { ...values, updatedAt: Date.now() }
    const prev = items.value

    // Optimistic update (instant UI). In real mode the watch re-emits the same shape.
    setTrns({ ...(items.value ?? {}), [id]: valuesWithEditDate })

    if (isDemo.value)
      return

    upsertRow('trns', id, trnToRow(valuesWithEditDate, resolveWriteUid(uid.value))).catch((e) => {
      setTrns(prev) // roll back the optimistic update if the local write failed
      logger.error('saveTrn failed', e)
      showErrorToast('trns.errors.saveFailed')
    })
  }

  function deleteTrn(id: TrnId) {
    const prev = items.value
    const trns = { ...(items.value ?? {}) }
    delete trns[id]
    setTrns(trns)

    if (isDemo.value)
      return

    deleteRow('trns', id).catch((e) => {
      setTrns(prev) // restore the deleted trn if the local write failed
      logger.error('deleteTrn failed', e)
      showErrorToast('trns.errors.deleteFailed')
    })
  }

  /** Remove trns from the in-memory store only (used when a wallet/category is deleted). */
  function removeTrnsFromStore(trnsIds: TrnId[]) {
    if (!items.value)
      return

    const trns = { ...items.value }
    for (const id of trnsIds)
      delete trns[id]
    setTrns(trns)
  }

  function computeTrnItem(id: TrnId): TrnItemFull | null {
    if (!items.value || !walletsStore.items || !categoriesStore.items)
      return null

    const trn = items.value[id]
    if (!trn)
      return null

    // Category (synthetic for special categoryIds)
    let category = categoriesStore.items[trn.categoryId]
    let categoryParent: typeof category | undefined

    if (!category) {
      if (trn.categoryId === 'transfer' || trn.categoryId === 'adjustment') {
        category = trn.categoryId === 'transfer'
          ? { color: '', icon: 'lucide:arrow-left-right', name: 'Transfer', parentId: 0, showInLastUsed: false, showInQuickSelector: false }
          : { color: '', icon: 'lucide:scale', name: 'Adjustment', parentId: 0, showInLastUsed: false, showInQuickSelector: false }
      }
      else {
        return null
      }
    }
    else if (category.parentId) {
      categoryParent = categoriesStore.items[category.parentId]
      if (!categoryParent)
        return null
    }

    if (trn.type === TrnType.Transfer) {
      const expenseWallet = walletsStore.items[trn.expenseWalletId]
      if (!expenseWallet)
        return null

      const incomeWallet = walletsStore.items[trn.incomeWalletId]
      if (!incomeWallet)
        return null

      return {
        id,
        ...trn,
        category,
        categoryParent,
        expenseWallet,
        incomeWallet,
      }
    }

    const wallet = walletsStore.items[trn.walletId]
    if (!wallet)
      return null

    return {
      id,
      ...trn,
      category,
      categoryParent,
      wallet,
    }
  }

  return {
    computeTrnItem,
    deleteTrn,
    getRange,
    getStoreTrnsIds,
    hasItems,
    initTrns,
    isLoaded,
    items,
    lastCreatedTrnItem,
    primeFromCache,
    removeTrnsFromStore,
    saveTrn,
    setTrns,
  }
})
