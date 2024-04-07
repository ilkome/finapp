import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import { getTrnsIds } from '~/components/trns/getTrns'
import { getTotal } from '~/components/amount/getTotal'
import type { WalletId, Wallets } from '~/components/wallets/types'
import { getDataAndWatch, unsubscribeData, updateData } from '~/services/firebase/api'
import { useUserStore } from '~/components/user/useUser'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

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
    const updates = ids.reduce((acc, walletId, index) => {
      acc[`${walletId}/order`] = index
      return acc
    }, {} as Record<string, number>)

    let result: string | null = null
    await updateData(`users/${userStore.uid}/accounts`, updates)
      .then(() => { result = 'ok' })
      .catch((error) => { result = error })

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
    Object.keys(walletsItems)
      .forEach((walletId: WalletId) =>
        walletsTotal[walletId] = getWalletTotal(walletId))

    return walletsTotal
  })

  const walletsSortedIds = computed(() => {
    if (!hasWallets.value)
      return []

    return Object.keys(items.value ?? {}).sort((a, b) => items.value[a].order - items.value[b].order)
  })

  return {
    items,
    ids,
    hasWallets,
    walletsTotal,
    walletsSortedIds,

    initWallets,
    setWallets,
    saveWalletsOrder,
    unsubscribeWallets,
  }
})
