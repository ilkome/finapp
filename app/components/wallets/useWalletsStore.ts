import { convexWalletsToMap } from '~~/services/convex/api'
import { uniqueElementsBy } from '~~/utils/simple'

import type { CurrencyCode } from '~/components/currencies/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId, WalletItem, WalletItemComputed, Wallets, WalletsComputed } from '~/components/wallets/types'

import { getAmountInRate, getTotal } from '~/components/amount/getTotal'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDemo } from '~/components/demo/useDemo'
import { pushOfflineOp } from '~/components/offline/helpers'
import { isReplaying } from '~/components/offline/replay'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
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

    // Set order to max+1 for new wallets
    if (!isExisting) {
      const maxOrder = Object.values(items.value ?? {}).reduce(
        (max, w) => Math.max(max, w.order ?? 0),
        -1,
      )
      values = { ...values, order: maxOrder + 1 }
    }

    // Optimistic UI
    setWallets({
      ...(items.value ?? {}),
      [id]: values,
    })

    if (!pushSaveOp({ entity: 'wallets', id, isDemo: isDemo.value, isExisting: !!isExisting, values: values as unknown as Record<string, unknown> }))
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

    // Fire-and-forget mutation, cleanup on success
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
    // Optimistic update
    const updated = { ...(items.value ?? {}) } as Wallets
    for (let i = 0; i < ids.length; i++) {
      if (updated[ids[i]])
        updated[ids[i]] = { ...updated[ids[i]], order: i }
    }
    setWallets(updated)

    if (isDemo.value)
      return

    // Save to offline queue immediately (skip during replay)
    logger.log('optimistic update: order')
    if (!isReplaying()) {
      for (const id of ids) {
        if (updated[id])
          pushOfflineOp({ data: updated[id] as unknown as Record<string, unknown>, entity: 'wallets', id, type: 'update' })
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

  function getWalletTotal(walletId: WalletId) {
    const trnsIds = trnsStore.getStoreTrnsIds({
      walletsIds: [walletId],
    })

    const { adjustment, sum, sumTransfers } = getTotal({
      trnsIds,
      trnsItems: trnsStore.items ?? {},
      walletsIds: [walletId],
      walletsItems: items.value ?? {},
    })

    return sum + sumTransfers + adjustment
  }

  const sortedIds = computed(() => {
    if (!hasItems.value)
      return []

    return Object.keys(items.value ?? {}).sort(
      (a, b) => items.value[a].order - items.value[b].order,
    )
  })

  const itemsComputed = computed<WalletsComputed>(() =>
    sortedIds.value.reduce((acc, id) => {
      acc[id] = {
        ...items.value[id],
        amount: getWalletTotal(id),
        rate: getAmountInRate({
          amount: 1,
          baseCurrencyCode: currenciesStore.base,
          currencyCode: items.value?.[id]?.currency,
          rates: currenciesStore.rates,
        }),
      }
      return acc
    }, {} as Record<WalletId, WalletItemComputed>),
  )

  const currenciesUsed = computed<CurrencyCode[]>(() => uniqueElementsBy(itemsComputed.value, 'currency'))

  function deleteWallet(id: WalletId, trnsIds?: TrnId[]) {
    // Optimistic UI
    const wallets = { ...(items.value ?? {}) }
    delete wallets[id]
    setWallets(wallets)

    // Optimistic: remove trns from store immediately (backend cascade handles actual deletion)
    if (trnsIds?.length)
      trnsStore.removeTrnsFromStore(trnsIds)

    if (!pushDeleteOp({ entity: 'wallets', id, isDemo: isDemo.value }))
      return

    // Fire-and-forget mutation, cleanup on success
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
    cancelPersist: () => debouncedPersist.cancel?.(),
    currenciesUsed,
    deleteWallet,
    hasItems,
    initWallets,
    items,
    itemsComputed,
    saveWallet,
    saveWalletsOrder,
    setWallets,
    sortedIds,
  }
})
