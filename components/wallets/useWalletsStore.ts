import localforage from "localforage";
import { getTotal } from "~/components/amount/getTotal";
import type { CurrencyCode } from "~/components/currencies/types";
import { getTrnsIds } from "~/components/trns/getTrns";
import { useTrnsStore } from "~/components/trns/useTrnsStore";
import { useUserStore } from "~/components/user/useUser";
import type {
  WalletId,
  WalletItemWithAmount,
  Wallets,
} from "~/components/wallets/types";
import {
  getDataAndWatch,
  unsubscribeData,
  updateData,
} from "~/services/firebase/api";
import { deepUnref } from 'vue-deepunref'

export const useWalletsStore = defineStore('wallets', () => {
  const trnsStore = useTrnsStore()
  const userStore = useUserStore()

  const items = ref<Wallets>({})

  function initWallets() {
    getDataAndWatch(`users/${userStore.uid}/accounts`, (wallets: Wallets) => {
      setWallets(wallets || null)
    })
  }

  function setWallets(values: Wallets) {
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
  const totals = computed<Record<WalletId, number>>(() => {
    if (!hasItems.value)
      return {}

    const walletsItems = items.value
    const trnsItems = trnsStore.items

    function getWalletTotal(walletId: WalletId) {
      const trnsIds = getTrnsIds({
        trnsItems,
        walletsIds: [walletId],
      })

      const { sumTransactions, sumTransfers } = getTotal({
        trnsIds,
        trnsItems,
        walletsIds: [walletId],
        walletsItems,
      })

      return sumTransactions + sumTransfers
    }

    const walletsTotal2 = Object.keys(walletsItems).reduce(
      (acc: Record<WalletId, number>, prev: WalletId) => {
        acc[prev] = getWalletTotal(prev)
        return acc
      },
      {} as Record<WalletId, number>,
    )

    return walletsTotal2
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

  const currenciesUsed = computed(() =>
    sortedIds.value.reduce((acc, id) => {
      const currency = items.value[id].currency
      !acc.includes(currency) && acc.push(currency)
      return acc
    }, [] as CurrencyCode[]),
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
