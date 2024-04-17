import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import type {
  WalletId,
  WalletItemWithAmount,
  Wallets,
} from '~/components/wallets/types'
import {
  getDataAndWatch,
  unsubscribeData,
  updateData,
} from '~/services/firebase/api'
import type { CurrencyCode } from '~/components/currencies/types'
import { getTotal } from '~/components/amount/getTotal'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUser'

export const useWalletsStore = defineStore('wallets', () => {
  const trnsStore = useTrnsStore()
  const userStore = useUserStore()

  const items = ref<Wallets>({})
  const ids = computed(() => Object.keys(items.value))

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

  const hasWallets = computed(() => Object.keys(items.value ?? {}).length > 0)

  /**
   * Get total in every wallet
   */
  const walletsTotal = computed<Record<WalletId, number>>(() => {
    if (!hasWallets.value)
      return {}

    const walletsItems = items.value
    const trnsItems = trnsStore.items

    const getWalletTotal = (walletId: WalletId) => {
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

    const walletsTotal: Record<WalletId, number> = {}
    Object.keys(walletsItems).forEach(
      (walletId: WalletId) =>
        (walletsTotal[walletId] = getWalletTotal(walletId)),
    )

    return walletsTotal
  })

  const walletsSortedIds = computed(() => {
    if (!hasWallets.value)
      return []

    return Object.keys(items.value ?? {}).sort(
      (a, b) => items.value[a].order - items.value[b].order,
    )
  })

  const walletsItemsSorted = computed(() => {
    const walletsIdsSorted: WalletId[] = walletsSortedIds.value

    return walletsIdsSorted.reduce((acc: Wallets, id) => {
      acc[id] ??= {
        ...items.value[id],
        // @ts-expect-error amount is in WalletItemWithAmount
        amount: walletsTotal.value[id],
      }
      return acc
    }, {}) as Record<WalletId, WalletItemWithAmount>
  })

  const walletsCurrencies = computed<string[]>(() =>
    walletsSortedIds.value.reduce((acc, id) => {
      const currency = items.value[id].currency
      !acc.includes(currency) && acc.push(currency)
      return acc
    }, [] as CurrencyCode[]),
  )

  return {
    items,
    ids,
    hasWallets,
    walletsTotal,
    walletsSortedIds,
    walletsItemsSorted,
    walletsCurrencies,

    initWallets,
    setWallets,
    saveWalletsOrder,
    unsubscribeWallets,
  }
})
