import type { ConvexClient } from 'convex/browser'
import type { FunctionReference } from 'convex/server'

import localforage from 'localforage'
import { convexTrnsToMap } from '~~/services/convex/api'
import { xorIdsHash } from '~~/utils/fnv1a'

import type { Range } from '~/components/date/types'
import type { TrnId, TrnItem, TrnItemFull, Trns, TrnsGetterProps } from '~/components/trns/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getEndOf, getStartOf } from '~/components/date/utils'
import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { filterTrnsIds } from '~/components/trns/getTrns'
import { TrnType } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { createDebouncedPersist, handleMutationResult, isInFlight, isPersistBlocked, mergeOfflineOps, pushDeleteOp, pushSaveOp } from '~/composables/useStoreSync'
import { createLogger } from '~/utils/logger'

/** Shape returned by Convex paginated queries (has _id, _creationTime, userId + entity fields). */
type ConvexTrnDoc = { [key: string]: unknown, _creationTime: number, _id: string, userId: string }

const logger = createLogger('trns')

async function fetchAllPages<T>(
  client: ConvexClient,
  queryFn: FunctionReference<'query'>,
  args: Record<string, unknown>,
  pageSize = 5000,
): Promise<T[]> {
  const allItems: T[] = []
  let cursor: string | null = null
  let isDone = false

  while (!isDone) {
    const result: { continueCursor: string, isDone: boolean, page: T[] } | null = await client.query(queryFn, {
      ...args,
      paginationOpts: { cursor, numItems: pageSize },
    })
    if (!result)
      return allItems
    allItems.push(...result.page)
    isDone = result.isDone
    cursor = result.continueCursor
  }

  return allItems
}

export const useTrnsStore = defineStore('trns', () => {
  const categoriesStore = useCategoriesStore()
  const walletsStore = useWalletsStore()
  const { isDemo } = useDemo()

  const items = shallowRef<Trns | null>(null)

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

  type TrnsSyncMeta = {
    idsHash: string
    lastSyncedAt: number
  }

  async function fullSync(retried = false): Promise<void> {
    const { api, client } = useConvexClientWithApi()
    const trns = await fetchAllPages<ConvexTrnDoc>(client, api.trns.list, {})
    let data: Trns | null = trns.length ? convexTrnsToMap(trns) : null

    // Verify local hash against server + get server timestamp
    const hashResult = await client.query(api.trns.idsHash, {}) as { hash: string, serverTime: number } | null
    const localHash = xorIdsHash(trns.map(t => t._id))

    if (hashResult && localHash !== hashResult.hash) {
      if (!retried) {
        logger.log('fullSync hash mismatch, retrying')
        return fullSync(true)
      }
      logger.log('fullSync hash still mismatched after retry, proceeding')
    }

    const lastSyncedAt = hashResult?.serverTime ?? Date.now()

    if (data)
      data = await mergeOfflineOps(data, 'trns')

    setTrns(data)

    const syncMeta: TrnsSyncMeta = {
      idsHash: hashResult?.hash ?? localHash,
      lastSyncedAt,
    }
    if (!isPersistBlocked())
      await localforage.setItem(STORAGE_KEYS.trnsSyncMeta, syncMeta)
    logger.log(`full sync: ${trns.length} trns`)
  }

  async function deltaSync(syncMeta: TrnsSyncMeta, cachedTrns: Trns): Promise<void> {
    const { api, client } = useConvexClientWithApi()

    const [changedTrns, hashResult] = await Promise.all([
      fetchAllPages<ConvexTrnDoc>(client, api.trns.delta, { since: syncMeta.lastSyncedAt }),
      client.query(api.trns.idsHash, {}) as Promise<{ hash: string, serverTime: number } | null>,
    ])

    if (hashResult === null) {
      setTrns(null)
      await localforage.removeItem(STORAGE_KEYS.trnsSyncMeta)
      return
    }

    const { hash: currentHash, serverTime } = hashResult

    let data: Trns = { ...cachedTrns }
    if (changedTrns.length > 0) {
      const changedMap = convexTrnsToMap(changedTrns)
      data = { ...data, ...changedMap }
    }

    const localHash = xorIdsHash(Object.keys(data).filter(id => !isLocalId(id)))
    if (localHash !== currentHash) {
      // Hash mismatch = deletions or missed changes → fallback to fullSync
      logger.log('hash mismatch after delta, falling back to fullSync')
      throw new Error('hash mismatch')
    }

    data = await mergeOfflineOps(data, 'trns')

    setTrns(Object.keys(data).length > 0 ? data : null)

    // Update sync metadata (use server time to avoid client clock skew)
    const newSyncMeta: TrnsSyncMeta = {
      idsHash: currentHash,
      lastSyncedAt: serverTime,
    }
    if (!isPersistBlocked())
      await localforage.setItem(STORAGE_KEYS.trnsSyncMeta, newSyncMeta)
    logger.log(`delta sync: ${changedTrns.length} changed`)
  }

  /**
   * Apply a realtime delta patch from a server subscription. Returns the
   * new `since` timestamp for the next subscription window, or null when
   * caller should fall back to a fullSync (truncated or no items).
   */
  async function applyRealtimePatch(patch: { deletedIds: string[], docs: ConvexTrnDoc[], serverTime: number, truncated: boolean }): Promise<number | null> {
    if (patch.truncated) {
      logger.log('realtime delta truncated — running fullSync')
      await fullSync()
      return null
    }

    const current = items.value ?? {}
    const updated: Trns = { ...current }
    let changed = false

    for (const doc of patch.docs) {
      if (isInFlight(doc._id))
        continue
      const existing = updated[doc._id]
      if (existing && typeof existing.updatedAt === 'number' && existing.updatedAt >= (doc.updatedAt as number))
        continue
      const { _creationTime: _ct, _id, userId: _u, ...rest } = doc
      updated[_id] = rest as unknown as Trns[string]
      changed = true
    }

    for (const id of patch.deletedIds) {
      if (isInFlight(id))
        continue
      if (id in updated) {
        delete updated[id]
        changed = true
      }
    }

    if (changed) {
      setTrns(Object.keys(updated).length > 0 ? updated : null)
      logger.log(`realtime: ${patch.docs.length} docs, ${patch.deletedIds.length} deletes`)
    }

    const syncMeta: TrnsSyncMeta = {
      idsHash: '',
      lastSyncedAt: patch.serverTime,
    }
    const existingMeta = await localforage.getItem<TrnsSyncMeta>(STORAGE_KEYS.trnsSyncMeta)
    if (existingMeta)
      syncMeta.idsHash = existingMeta.idsHash
    if (!isPersistBlocked())
      await localforage.setItem(STORAGE_KEYS.trnsSyncMeta, syncMeta)

    return patch.serverTime
  }

  async function initTrns() {
    try {
      const syncMeta = await localforage.getItem<TrnsSyncMeta>(STORAGE_KEYS.trnsSyncMeta)
      const cachedTrns = await localforage.getItem<Trns>(STORAGE_KEYS.trns)

      if (syncMeta && cachedTrns) {
        try {
          await deltaSync(syncMeta, cachedTrns)
          return
        }
        catch (e) {
          logger.log('delta sync failed, falling back to full sync', e)
        }
      }

      // Ensure syncMeta row exists before fullSync so subsequent idsHash queries are O(1)
      // Fire-and-forget: don't block fullSync if auth token isn't ready yet
      const { api, client } = useConvexClientWithApi()
      client.mutation(api.trns.ensureSyncMeta, {}).catch(() => {})

      await fullSync()
    }
    catch (e) {
      logger.error('init failed', e)
    }
  }

  const debouncedPersist = createDebouncedPersist<Trns | null>(STORAGE_KEYS.trns)

  function setTrns(values: Trns | null) {
    items.value = values
    debouncedPersist(values)
  }

  function saveTrn({ id, values }: { id: TrnId, values: TrnItem }) {
    const valuesWithEditDate = {
      ...values,
      updatedAt: Date.now(),
    }

    // Check before setTrns so the new id isn't already in the store
    // Frontend IDs are always treated as new creates (server generates real ID)
    const isExisting = !isLocalId(id) && items.value && id in items.value

    setTrns({ ...(items.value ?? {}), [id]: valuesWithEditDate })

    if (!pushSaveOp({ entity: 'trns', id, isDemo: !!isDemo.value, isExisting: !!isExisting, values }))
      return

    const { api, client } = useConvexClientWithApi()
    const action = isExisting ? 'update' : 'create'

    const base = {
      date: valuesWithEditDate.date,
      desc: valuesWithEditDate.desc || undefined,
      type: valuesWithEditDate.type,
    }

    const trnData = values.type === TrnType.Transfer
      ? {
          ...base,
          categoryId: 'transfer' as const,
          expenseAmount: values.expenseAmount,
          expenseWalletId: asConvexId<'wallets'>(values.expenseWalletId),
          incomeAmount: values.incomeAmount,
          incomeWalletId: asConvexId<'wallets'>(values.incomeWalletId),
        }
      : {
          ...base,
          amount: values.amount,
          categoryId: values.categoryId === 'adjustment'
            ? 'adjustment' as const
            : asConvexId<'categories'>(values.categoryId),
          walletId: asConvexId<'wallets'>(values.walletId),
        }

    const mutation = isExisting
      ? client.mutation(api.trns.update, { id: asConvexId<'trns'>(id), ...trnData })
      : client.mutation(api.trns.create, trnData)

    return handleMutationResult({
      action,
      entity: 'trns',
      errorMessage: 'trns.errors.saveFailed',
      id,
      items,
      mutation,

    })
  }

  function deleteTrn(id: TrnId) {
    // Optimistic UI
    const trns = { ...(items.value ?? {}) }
    delete trns[id]
    setTrns(trns)

    if (!pushDeleteOp({ entity: 'trns', id, isDemo: !!isDemo.value }))
      return

    const { api, client } = useConvexClientWithApi()
    return handleMutationResult({
      action: 'delete',
      entity: 'trns',
      errorMessage: 'trns.errors.deleteFailed',
      id,
      items,
      mutation: client.mutation(api.trns.remove, { id: asConvexId<'trns'>(id) }),

    })
  }

  /** Remove trns from store only. Does NOT fire mutations or push to offline queue. */
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
          ? { color: 'var(--text-2)', icon: 'lucide:arrow-left-right', name: 'Transfer', parentId: 0, showInLastUsed: false, showInQuickSelector: false }
          : { color: 'var(--text-2)', icon: 'lucide:scale', name: 'Adjustment', parentId: 0, showInLastUsed: false, showInQuickSelector: false }
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
    applyRealtimePatch,
    computeTrnItem,
    deleteTrn,
    getRange,
    getStoreTrnsIds,
    hasItems,
    initTrns,
    items,
    lastCreatedTrnItem,
    removeTrnsFromStore,
    saveTrn,
    setTrns,
  }
})
