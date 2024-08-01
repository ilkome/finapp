import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItemWithAmount, Wallets } from '~/components/wallets/types'
import { getDataAndWatch, unsubscribeData, updateData } from '../../../services/firebase/api'
import { getTotal } from '~/components/amount/getTotal'
import { uniqueElementsBy } from '~/utils/simple'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUser'

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
    if (!values) {
      items.value = {}
      localforage.setItem('finapp.wallets', {})
      return
    }

    items.value = values
    localforage.setItem('finapp.wallets', deepUnref(values))
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
    setWallets({})
  }

  const hasItems = computed(() => Object.keys(items.value ?? {}).length > 0)

  const sortedIds = computed(() => {
    if (!hasItems.value)
      return []

    return Object.keys(items.value ?? {}).sort(
      (a, b) => items.value[a].order - items.value[b].order,
    )
  })

  /**
   * Get total in every wallet
   */

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
    if (!hasItems.value)
      return {}

    return Object.keys(items.value).reduce(
      (acc, walletId) => {
        acc[walletId] = getWalletTotal(walletId)
        return acc
      },
      {} as Record<WalletId, WalletItemWithAmount['amount']>,
    )
  })

  const sortedItems = computed(() =>
    sortedIds.value.reduce(
      (acc, id) => {
        acc[id] ??= {
          ...items.value[id],
          amount: totals.value[id],
          // amount:
          //   items.value[id].creditLimit
          //     ? items.value[id].creditLimit - totals.value[id]
          //     : totals.value[id],
          // amount:
          //   id === '240312_89ntki'
          //     ? 111
          //     : totals.value[id],
        }
        return acc
      },
      {} as Record<WalletId, WalletItemWithAmount>,
    ),
  )

  const currenciesUsed = computed<CurrencyCode[]>(() =>
    uniqueElementsBy(items.value, 'currency'),
  )

  return {
    currenciesUsed,
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
