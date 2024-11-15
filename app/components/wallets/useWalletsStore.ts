import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import { useCurrenciesStore } from '../currencies/useCurrenciesStore'
import { getDataAndWatch, saveData, unsubscribeData, updateData } from '~~/services/firebase/api'
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItem, WalletItemWithAmount, Wallets } from '~/components/wallets/types'
import { getTotal } from '~/components/amount/getTotal'
import { uniqueElementsBy } from '~~/utils/simple'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { normalizeWallets } from '~/components/wallets/utils'
import { useDemo } from '~/components/demo/useDemo'

export const useWalletsStore = defineStore('wallets', () => {
  const trnsStore = useTrnsStore()
  const userStore = useUserStore()
  const currenciesStore = useCurrenciesStore()
  const { isDemo, sortDemoWallets } = useDemo()

  const items = ref<Wallets | null>(null)
  const hasItems = computed(() => Object.keys(items.value ?? {}).length > 0)

  function initWallets() {
    getDataAndWatch(`users/${userStore.uid}/accounts`, (wallets: Wallets) => {
      setWallets(wallets || null)
    })
  }

  function setWallets(values: Wallets | null) {
    if (values) {
      const formattedWallets = normalizeWallets(values)
      items.value = formattedWallets
      localforage.setItem('finapp.wallets', deepUnref(formattedWallets))
      return
    }

    items.value = null
    localforage.setItem('finapp.wallets', null)
  }

  async function addWallet({ id, values }: { id: WalletId, values: WalletItem }) {
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
      return await sortDemoWallets(ids, items.value)
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
      trnsItems: trnsStore.items,
      walletsIds: [walletId],
      walletsItems: items.value,
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

  const itemsWithAmount = computed(() =>
    sortedIds.value.reduce((acc, id) => {
      acc[id] = {
        ...items.value[id],
        amount: getWalletTotal(id),
      }
      return acc
    }, {} as Record<WalletId, WalletItemWithAmount>),
  )

  const currenciesUsed = computed<CurrencyCode[]>(() => uniqueElementsBy(items.value, 'currency'))

  return {
    addWallet,
    currenciesUsed,
    getWalletTotal,
    hasItems,
    initWallets,
    items,
    itemsWithAmount,
    saveWalletsOrder,
    setWallets,
    sortedIds,
    unsubscribeWallets,
  }
})
