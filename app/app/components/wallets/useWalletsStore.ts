import type { Row } from '~~/services/powersync/transforms'

import { watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRow, upsertRows } from '~~/services/powersync/mutations'
import { rowToWallet, walletToRow } from '~~/services/powersync/transforms'
import { uniqueElementsBy } from '~~/utils/simple'

import type { CurrencyCode } from '~/components/currencies/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId, WalletItem, WalletItemComputed, Wallets, WalletsComputed } from '~/components/wallets/types'

import { getAmountInRate, getWalletsTotals } from '~/components/amount/getTotal'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { persistStoreCache } from '~/composables/useStoreCache'
import { createDebouncedPersist, showErrorToast } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

const logger = createLogger('wallets')

function rowsToWallets(rows: Row[]): Wallets | null {
  if (!rows.length)
    return null
  const map: Wallets = {}
  for (const row of rows)
    map[row.id] = rowToWallet(row)
  return map
}

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
    watchController = watchTable<Row>('SELECT * FROM wallets', [], (rows) => {
      setWallets(rowsToWallets(rows))
      isLoaded.value = true
    })
    logger.log('watching wallets')
  }

  function saveWallet({ id, values }: { id: WalletId, values: WalletItem }) {
    // Set default currency based on first created wallet
    if (!hasItems.value)
      useUserStore().saveUserBaseCurrency(values.currency)

    // A new wallet is one whose id isn't already in the store.
    const isNew = !(items.value && id in items.value)

    if (isNew) {
      const maxOrder = Object.values(items.value ?? {}).reduce(
        (max, w) => Math.max(max, w.order ?? 0),
        -1,
      )
      values = { ...values, order: maxOrder + 1 }
    }

    const prev = items.value

    // Optimistic update (instant UI). In real mode the watch re-emits the same shape.
    setWallets({
      ...(items.value ?? {}),
      [id]: values,
    })

    if (isDemo.value)
      return

    upsertRow('wallets', id, walletToRow(values, uid.value ?? '')).catch((e) => {
      setWallets(prev) // roll back the optimistic update if the local write failed
      logger.error('saveWallet failed', e)
      showErrorToast('wallets.errors.saveFailed')
    })
  }

  function saveWalletsOrder(ids: WalletId[]) {
    const prev = items.value
    const updated = { ...(items.value ?? {}) } as Wallets
    for (let i = 0; i < ids.length; i++) {
      const walletId = ids[i]!
      if (updated[walletId])
        updated[walletId] = { ...updated[walletId]!, order: i }
    }
    setWallets(updated)

    if (isDemo.value)
      return

    upsertRows(
      'wallets',
      ids
        .filter(walletId => items.value?.[walletId])
        .map((walletId, index) => ({
          id: walletId,
          row: walletToRow({ ...items.value![walletId]!, order: index }, uid.value ?? ''),
        })),
    ).catch((e) => {
      setWallets(prev) // restore the previous order if the local write failed
      logger.error('saveWalletsOrder failed', e)
      showErrorToast('wallets.errors.orderFailed')
    })
  }

  const sortedIds = computed(() => {
    if (!hasItems.value)
      return []

    return Object.keys(items.value ?? {}).sort(
      (a, b) => (items.value![a]?.order ?? 0) - (items.value![b]?.order ?? 0),
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

      if (trn.type === TrnType.Transfer) {
        const existing1 = latestDateByWallet.get(trn.expenseWalletId)
        if (!existing1 || trn.date > existing1)
          latestDateByWallet.set(trn.expenseWalletId, trn.date)

        const existing2 = latestDateByWallet.get(trn.incomeWalletId)
        if (!existing2 || trn.date > existing2)
          latestDateByWallet.set(trn.incomeWalletId, trn.date)
      }
      else {
        const existing = latestDateByWallet.get(trn.walletId)
        if (!existing || trn.date > existing)
          latestDateByWallet.set(trn.walletId, trn.date)
      }
    }

    return [...latestDateByWallet.entries()]
      .toSorted(([, a], [, b]) => b - a)
      .map(([id]) => id)
      .filter(id => items.value?.[id])
  })

  // Wallet totals in a single pass over all trns.
  const walletTotals = computed(() =>
    getWalletsTotals({
      trnsItems: trnsStore.items ?? {},
      walletsItems: items.value ?? {},
    }),
  )

  const itemsComputed = computed<WalletsComputed>(() =>
    sortedIds.value.reduce((acc, id) => {
      const wallet = items.value?.[id]
      if (!wallet)
        return acc
      acc[id] = {
        ...wallet,
        amount: walletTotals.value.get(id) ?? 0,
        rate: getAmountInRate({
          amount: 1,
          baseCurrencyCode: currenciesStore.base,
          currencyCode: wallet.currency,
          rates: currenciesStore.rates,
        }),
      }
      return acc
    }, {} as Record<WalletId, WalletItemComputed>),
  )

  const currenciesUsed = computed<CurrencyCode[]>(() => uniqueElementsBy(itemsComputed.value, 'currency'))

  async function deleteWallet(id: WalletId, trnsIds?: TrnId[]) {
    const prevWallets = items.value
    const prevTrns = trnsStore.items
    const wallets = { ...(items.value ?? {}) }
    delete wallets[id]
    setWallets(wallets)

    if (trnsIds?.length)
      trnsStore.removeTrnsFromStore(trnsIds)

    if (isDemo.value)
      return

    // Real mode: the wallet's transactions must also be deleted from the DB,
    // otherwise the trns watch would re-add them after the optimistic removal.
    try {
      await Promise.all([
        deleteRow('wallets', id),
        ...(trnsIds ?? []).map(trnId => deleteRow('trns', trnId)),
      ])
    }
    catch (e) {
      // Roll back the wallet and its cascaded trns if the local write failed.
      setWallets(prevWallets)
      trnsStore.setTrns(prevTrns)
      logger.error('deleteWallet failed', e)
      showErrorToast('wallets.errors.deleteFailed')
    }
  }

  return {
    currenciesUsed,
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
