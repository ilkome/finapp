import type { Row } from '~~/services/powersync/transforms'

import { watchTable } from '~~/services/powersync/db'
import { deleteRow, deleteRows, upsertRow, upsertRows } from '~~/services/powersync/mutations'
import { rowToWallet, walletToRow } from '~~/services/powersync/transforms'

import type { CurrencyCode } from '~/components/currencies/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId, WalletItem, WalletItemComputed, Wallets, WalletsComputed } from '~/components/wallets/types'

import { getWalletsTotals } from '~/components/amount/getTotal'
import { useBankReportsStore } from '~/components/bankReports/useBankReportsStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDemo } from '~/components/demo/useDemo'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { reconcileRows } from '~/components/trns/reconcile'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { isCreditProduct } from '~/components/wallets/types'
import { resolveWriteUid } from '~/composables/useAuthSession'
import { persistStoreCache } from '~/composables/useStoreCache'
import { createDebouncedPersist, persistOptimistic } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

const logger = createLogger('wallets')

export const useWalletsStore = defineStore('wallets', () => {
  const trnsStore = useTrnsStore()
  const currenciesStore = useCurrenciesStore()
  const { isDemo } = useDemo()
  const { uid } = useSupabaseAuth()

  const items = shallowRef<Wallets | null>(null)
  const hasItems = computed(() => Object.keys(items.value ?? {}).length > 0)
  // True after the first local-SQLite emission; drives the onboarding gate. Reset on
  // (re)subscribe so a new user waits for theirs. Demo skips the watch (see useInitApp).
  const isLoaded = ref(false)

  let watchController: AbortController | null = null

  const debouncedPersist = createDebouncedPersist<Wallets | null>(STORAGE_KEYS.wallets)

  function setWallets(values: Wallets | null) {
    items.value = values
    // Demo persists to localforage; real mode mirrors into the per-user cold-start blob
    // (PowerSync SQLite stays the source of truth).
    if (isDemo.value)
      debouncedPersist(values)
    else
      persistStoreCache('wallets', values)
  }

  /** Cold-start paint from the per-user snapshot before the SQLite watch emits. See trns store. */
  function primeFromCache(data: Wallets | null): void {
    if (isDemo.value || !data || isLoaded.value)
      return
    items.value = data
  }

  /** Real mode: subscribe to local SQLite. Fires immediately and on every sync/local write. */
  function initWallets(): void {
    if (isDemo.value)
      return
    watchController?.abort()
    isLoaded.value = false // re-subscribe (e.g. different user) waits for a fresh emission
    let isFirstEmit = true
    watchController = watchTable<Row>('SELECT * FROM wallets', [], (rows) => {
      const isFirst = isFirstEmit
      isFirstEmit = false
      isLoaded.value = true
      // An empty FIRST emission means local SQLite hasn't received the first sync yet
      // (fresh device) - keep the primed cache. Later empty emissions are genuine wipes.
      if (isFirst && !rows.length && hasItems.value)
        return
      const next = reconcileRows(items.value, rows, rowToWallet)
      if (next !== items.value)
        setWallets(next)
    })
    logger.log('watching wallets')
  }

  function saveWallet({ id, values }: { id: WalletId, values: WalletItem }) {
    if (!hasItems.value)
      useUserStore().saveUserBaseCurrency(values.currencyCode)

    const isNew = !(items.value && id in items.value)

    if (isNew) {
      const maxOrder = Object.values(items.value ?? {}).reduce(
        (max, w) => Math.max(max, w.sortOrder ?? 0),
        -1,
      )
      values = { ...values, sortOrder: maxOrder + 1 }
    }

    const prev = items.value

    // Retyped away from a credit product: its loan has nothing left to track.
    if (isCreditProduct(prev?.[id]?.type) && !isCreditProduct(values.type)) {
      const loansStore = useLoansStore()
      const loanId = loansStore.loanIdByWalletId.get(id)
      if (loanId)
        loansStore.deleteLoan(loanId)
    }

    // Optimistic update (instant UI). In real mode the watch re-emits the same shape.
    setWallets({
      ...(items.value ?? {}),
      [id]: values,
    })

    if (isDemo.value)
      return

    void persistOptimistic(upsertRow('wallets', id, walletToRow(values, resolveWriteUid(uid.value))), {
      errorKey: 'wallets.errors.saveFailed',
      label: 'saveWallet',
      logger,
      rollback: () => setWallets(prev),
    })
  }

  function saveWalletsOrder(ids: WalletId[]) {
    const prev = items.value
    const updated = { ...(items.value ?? {}) } as Wallets
    for (let i = 0; i < ids.length; i++) {
      const walletId = ids[i]!
      if (updated[walletId])
        updated[walletId] = { ...updated[walletId]!, sortOrder: i }
    }
    setWallets(updated)

    if (isDemo.value)
      return

    void persistOptimistic(upsertRows(
      'wallets',
      ids
        .filter(walletId => items.value?.[walletId])
        .map((walletId, index) => ({
          id: walletId,
          row: walletToRow({ ...items.value![walletId]!, sortOrder: index }, resolveWriteUid(uid.value)),
        })),
    ), {
      errorKey: 'wallets.errors.orderFailed',
      label: 'saveWalletsOrder',
      logger,
      rollback: () => setWallets(prev),
    })
  }

  const sortedIds = computed(() => {
    if (!hasItems.value)
      return []

    return Object.keys(items.value ?? {}).sort(
      (a, b) => (items.value![a]?.sortOrder ?? 0) - (items.value![b]?.sortOrder ?? 0),
    )
  })

  const recentWalletIds = computed<WalletId[]>(() => {
    if (!hasItems.value || !trnsStore.hasItems)
      return []

    const trnsItems = trnsStore.items
    const latestDateByWallet = new Map<WalletId, number>()

    for (const trnId in trnsItems) {
      const trn = trnsItems[trnId]
      if (!trn)
        continue

      for (const walletId of [trn.fromWalletId, trn.toWalletId]) {
        if (!walletId)
          continue
        const existing = latestDateByWallet.get(walletId)
        if (!existing || trn.date > existing)
          latestDateByWallet.set(walletId, trn.date)
      }
    }

    return [...latestDateByWallet.entries()]
      .toSorted(([, a], [, b]) => b - a)
      .map(([id]) => id)
      .filter(id => items.value?.[id])
  })

  const walletTotals = computed(() =>
    getWalletsTotals({
      trnsItems: trnsStore.items ?? {},
      walletsItems: items.value ?? {},
    }),
  )

  // Reuse a wallet's previous object when nothing it shows changed, so a trn save re-renders only
  // the rows of the wallets it touched instead of every wallet row.
  let prevComputed = new Map<WalletId, { source: WalletItem, value: WalletItemComputed }>()
  const itemsComputed = computed<WalletsComputed>(() => {
    const next = new Map<WalletId, { source: WalletItem, value: WalletItemComputed }>()
    const result = sortedIds.value.reduce((acc, id) => {
      const wallet = items.value?.[id]
      if (!wallet)
        return acc
      const amount = walletTotals.value.get(id) ?? 0
      const rate = currenciesStore.toBase(1, wallet.currencyCode)
      const prev = prevComputed.get(id)
      const value = prev && prev.source === wallet && prev.value.amount === amount && prev.value.rate === rate
        ? prev.value
        : { ...wallet, amount, rate }
      next.set(id, { source: wallet, value })
      acc[id] = value
      return acc
    }, {} as Record<WalletId, WalletItemComputed>)
    prevComputed = next
    return result
  })

  const currenciesUsed = computed<CurrencyCode[]>(() => [...new Set(sortedIds.value.map(id => items.value![id]!.currencyCode))])

  async function deleteWallet(id: WalletId, trnsIds?: TrnId[]) {
    const prevWallets = items.value
    const prevTrns = trnsStore.items
    const wallets = { ...(items.value ?? {}) }
    delete wallets[id]
    setWallets(wallets)

    if (trnsIds?.length)
      trnsStore.removeTrnsFromStore(trnsIds)

    // Cascade to a credit wallet's loan so it doesn't survive the wallet it belongs to.
    const loansStore = useLoansStore()
    const loanId = loansStore.loanIdByWalletId.get(id)
    if (loanId)
      loansStore.deleteLoan(loanId)
    useBankReportsStore().deleteBankReport(id)

    if (isDemo.value)
      return

    // Real mode: the wallet's transactions must also be deleted from the DB,
    // otherwise the trns watch would re-add them after the optimistic removal.
    await persistOptimistic(Promise.all([deleteRow('wallets', id), deleteRows('transactions', trnsIds ?? [])]), {
      errorKey: 'wallets.errors.deleteFailed',
      label: 'deleteWallet',
      logger,
      rollback: () => {
        setWallets(prevWallets)
        trnsStore.setTrns(prevTrns)
      },
    })
  }

  /** A wallet missing for a tick (deleted, not yet synced) reads as the base currency. */
  function currencyOf(walletId: WalletId): CurrencyCode {
    return items.value?.[walletId]?.currencyCode ?? currenciesStore.base
  }

  return {
    currenciesUsed,
    currencyOf,
    deleteWallet,
    hasItems,
    initWallets,
    isLoaded,
    items,
    itemsComputed,
    primeFromCache,
    recentWalletIds,
    saveWallet,
    saveWalletsOrder,
    setWallets,
    sortedIds,
  }
})
