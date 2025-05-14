import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import { getDataAndWatch, removeData, saveData, unsubscribeData, updateData } from '~~/services/firebase/api'
import { uniqueElementsBy } from '~~/utils/simple'

import type { CurrencyCode } from '~/components/currencies/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId, WalletItem, WalletItemComputed, Wallets, WalletsComputed } from '~/components/wallets/types'

import { getAmountInRate, getTotal } from '~/components/amount/getTotal'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDemo } from '~/components/demo/useDemo'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { normalizeWallets } from '~/components/wallets/utils'

export const useWalletsStore = defineStore('wallets', () => {
  const trnsStore = useTrnsStore()
  const userStore = useUserStore()
  const currenciesStore = useCurrenciesStore()
  const { deleteDemoWallet, isDemo, sortDemoWallets } = useDemo()

  const items = ref<Wallets | null | false>(false)
  const hasItems = computed(() => Object.keys(items.value ?? {}).length > 0)

  function initWallets() {
    getDataAndWatch(`users/${userStore.uid}/accounts`, (wallets: Wallets) => setWallets(wallets || null))
  }

  function setWallets(values: Wallets | null) {
    const wallets = values ? normalizeWallets(values) : null
    items.value = wallets
    localforage.setItem('finapp.wallets', deepUnref(wallets))
  }

  async function createOrUpdateWallet({ id, values }: { id: WalletId, values: WalletItem }) {
    // Set default currency based on first created wallet
    if (!hasItems.value)
      currenciesStore.updateBase(values.currency)

    if (isDemo.value) {
      items.value = {
        ...items.value,
        [id]: values,
      }
      localforage.setItem('finapp.wallets', deepUnref(items.value))
      return
    }

    await saveData(`users/${userStore.uid}/accounts/${id}`, values)
  }

  async function saveWalletsOrder(ids: WalletId[]) {
    if (isDemo.value) {
      return await sortDemoWallets(ids, items.value ?? {})
    }

    const updates = ids.reduce(
      (acc, walletId, index) => {
        acc[`${walletId}/order`] = index
        return acc
      },
      {} as Record<string, number>,
    )

    let result: string | null = null

    await updateData(`users/${userStore.uid}/accounts`, updates)
      .then(() => result = 'ok')
      .catch(error => result = error)

    return result
  }

  function getWalletTotal(walletId: WalletId) {
    const trnsIds = trnsStore.getStoreTrnsIds({
      walletsIds: [walletId],
    })

    const { sum, sumTransfers } = getTotal({
      trnsIds,
      trnsItems: trnsStore.items ?? {},
      walletsIds: [walletId],
      walletsItems: items.value ?? {},
    })

    return sum + sumTransfers
  }

  function unsubscribeWallets() {
    unsubscribeData(`users/${userStore.uid}/accounts`)
    setWallets(null)
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

  async function deleteWallet(id: WalletId, trnsIds?: TrnId[]) {
    if (isDemo.value) {
      deleteDemoWallet(id, trnsIds)
    }
    else {
      await removeData(`users/${userStore.uid}/accounts/${id}`)
      if (trnsIds)
        await trnsStore.deleteTrnsByIds(trnsIds)
    }
  }

  return {
    createOrUpdateWallet,
    currenciesUsed,
    deleteWallet,
    getWalletTotal,
    hasItems,
    initWallets,
    items,
    itemsComputed,
    saveWalletsOrder,
    setWallets,
    sortedIds,
    unsubscribeWallets,
  }
})
