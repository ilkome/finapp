import { convexWalletsToMap } from '~~/services/convex/api'
import { uniqueElementsBy } from '~~/utils/simple'

import type { CurrencyCode } from '~/components/currencies/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId, WalletItem, WalletItemComputed, Wallets, WalletsComputed } from '~/components/wallets/types'

import { getAmountInRate, getWalletsTotals } from '~/components/amount/getTotal'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDemo } from '~/components/demo/useDemo'
import { pushOfflineOp } from '~/components/offline/helpers'
import { isReplaying } from '~/components/offline/replay'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { createDebouncedPersist, handleMutationResult, mergeOfflineOps, pushDeleteOp, pushSaveOp } from '~/composables/useStoreSync'
import { createLogger } from '~/utils/logger'

const logger = createLogger('wallets')

export const useWalletsStore = defineStore('wallets', () => {
  const trnsStore = useTrnsStore()
  const currenciesStore = useCurrenciesStore()
  const { isDemo } = useDemo()

  const items = shallowRef<Wallets | null>(null)
  const hasItems = computed(() => Object.keys(items.value ?? {}).length > 0)

  async function initWallets() {
    try {
      const { api, client } = useConvexClientWithApi()
      const wallets = await client.query(api.wallets.list, {})
      let data: Wallets | null = wallets?.length ? convexWalletsToMap(wallets) : null

      if (data)
        data = await mergeOfflineOps(data, 'wallets')

      setWallets(data)
    }
    catch (e) {
      logger.error('init failed', e)
    }
  }

  const debouncedPersist = createDebouncedPersist<Wallets | null>(STORAGE_KEYS.wallets)

  function setWallets(values: Wallets | null) {
    items.value = values
    debouncedPersist(values)
  }

  function saveWallet({ id, values }: { id: WalletId, values: WalletItem }) {
    // Set default currency based on first created wallet
    if (!hasItems.value)
      useUserStore().saveUserBaseCurrency(values.currency)

    // Check before optimistic update so the new id isn't already in the store
    // Frontend IDs are always treated as new creates (server generates real ID)
    const isExisting = !isLocalId(id) && items.value && id in items.value

    if (!isExisting) {
      const maxOrder = Object.values(items.value ?? {}).reduce(
        (max, w) => Math.max(max, w.order ?? 0),
        -1,
      )
      values = { ...values, order: maxOrder + 1 }
    }

    setWallets({
      ...(items.value ?? {}),
      [id]: values,
    })

    if (!pushSaveOp({ entity: 'wallets', id, isDemo: !!isDemo.value, isExisting: !!isExisting, values }))
      return

    const { api, client } = useConvexClientWithApi()
    const action = isExisting ? 'update' : 'create'

    const walletData = {
      color: values.color,
      creditLimit: 'creditLimit' in values ? values.creditLimit : undefined,
      currency: values.currency,
      desc: values.desc || undefined,
      isArchived: values.isArchived,
      isExcludeInTotal: values.isExcludeInTotal,
      isWithdrawal: values.isWithdrawal,
      name: values.name,
      order: values.order,
      type: values.type,
    }

    const mutation = isExisting
      ? client.mutation(api.wallets.update, { id: asConvexId<'wallets'>(id), ...walletData })
      : client.mutation(api.wallets.create, walletData)

    return handleMutationResult({
      action,
      entity: 'wallets',
      errorMessage: 'wallets.errors.saveFailed',
      id,
      items,
      mutation,

    })
  }

  function saveWalletsOrder(ids: WalletId[]) {
    const updated = { ...(items.value ?? {}) } as Wallets
    for (let i = 0; i < ids.length; i++) {
      const walletId = ids[i]!
      if (updated[walletId])
        updated[walletId] = { ...updated[walletId]!, order: i }
    }
    setWallets(updated)

    if (isDemo.value)
      return

    // Save to offline queue immediately (skip during replay)
    logger.log('optimistic update: order')
    if (!isReplaying()) {
      for (const id of ids) {
        if (updated[id])
          pushOfflineOp({ data: updated[id], entity: 'wallets', id, type: 'update' })
      }
    }

    const { api, client } = useConvexClientWithApi()

    return handleMutationResult({
      action: 'update',
      entity: 'wallets',
      errorMessage: 'wallets.errors.orderFailed',
      id: ids,
      mutation: client.mutation(api.wallets.updateOrder, {
        orders: ids.map((walletId, index) => ({
          id: asConvexId<'wallets'>(walletId),
          order: index,
        })),
      }),
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

  // O(N) single pass over all trns — replaces O(W×N) per-wallet getWalletTotal
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

  function deleteWallet(id: WalletId, trnsIds?: TrnId[]) {
    const wallets = { ...(items.value ?? {}) }
    delete wallets[id]
    setWallets(wallets)

    if (trnsIds?.length)
      trnsStore.removeTrnsFromStore(trnsIds)

    if (!pushDeleteOp({ entity: 'wallets', id, isDemo: !!isDemo.value }))
      return

    const { api, client } = useConvexClientWithApi()
    return handleMutationResult({
      action: 'delete',
      entity: 'wallets',
      errorMessage: 'wallets.errors.deleteFailed',
      id,
      items,
      mutation: client.action(api.wallets.remove, { id: asConvexId<'wallets'>(id) }),

    })
  }

  return {
    currenciesUsed,
    deleteWallet,
    hasItems,
    initWallets,
    items,
    itemsComputed,
    recentWalletIds,
    saveWallet,
    saveWalletsOrder,
    setWallets,
    sortedIds,
  }
})
