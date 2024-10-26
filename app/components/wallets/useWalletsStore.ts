import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import { getDataAndWatch, unsubscribeData, updateData } from '~~/services/firebase/api'
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItemWithAmount, Wallets } from '~/components/wallets/types'
import { getTotal } from '~/components/amount/getTotal'
import { uniqueElementsBy } from '~~/utils/simple'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { normalizeWallets } from '~/components/wallets/utils'

export const useWalletsStore = defineStore('wallets', () => {
  const trnsStore = useTrnsStore()
  const userStore = useUserStore()

  const items = ref<Wallets | null>(null)

  function initWallets() {
    getDataAndWatch(`users/${userStore.uid}/accounts`, (wallets: Wallets) => {
      setWallets(wallets || null)
    })
  }

  function setWallets(values: Wallets | null) {
    if (values) {
      const formattedWallets = normalizeWallets(values)
      console.log('formattedWallets', formattedWallets)

      items.value = formattedWallets
      localforage.setItem('finapp.wallets', deepUnref(formattedWallets))
      return
    }

    items.value = null
    localforage.setItem('finapp.wallets', null)
  }

  async function saveWalletsOrder(ids: WalletId[]) {
    const updates = ids.reduce(
      (acc, walletId, index) => {
        acc[`${walletId}/order`] = index
        return acc
      },
      {} as Record<string, number>,
    )

    let result: string | null = null

    await updateData(`users/${userStore.uid}/accounts`, updates)
      .then(() => {
        result = 'ok'
      })
      .catch((error) => {
        result = error
      })

    return result
  }

  function unsubscribeWallets() {
    unsubscribeData(`users/${userStore.uid}/accounts`)
    setWallets(null)
  }

  const hasItems = computed(() => Object.keys(items.value ?? {}).length > 0)

  const sortedIds = computed(() => {
    if (!hasItems.value)
      return []

    return Object.keys(items.value ?? {}).sort(
      (a, b) => items.value[a].order - items.value[b].order,
    )
  })

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

  const totals = computed(() => {
    if (items.value) {
      return Object.keys(items.value).reduce(
        (acc, walletId) => {
          acc[walletId] = getWalletTotal(walletId)
          return acc
        },
        {} as Record<WalletId, WalletItemWithAmount['amount']>,
      )
    }

    return null
  })

  const sortedItems = computed(() =>
    sortedIds.value.reduce(
      (acc, id) => {
        acc[id] ??= {
          ...items.value[id],
          amount: totals.value[id],
        }
        return acc
      },
      {} as Record<WalletId, WalletItemWithAmount>,
    ),
  )

  const currenciesUsed = computed<CurrencyCode[]>(() => uniqueElementsBy(items.value, 'currency'))

  return {
    currenciesUsed,
    getWalletTotal,
    hasItems,
    initWallets,
    items,
    saveWalletsOrder,
    setWallets,
    sortedIds,
    sortedItems,
    totals,
    unsubscribeWallets,
  }
})
