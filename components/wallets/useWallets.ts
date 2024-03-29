import type {
  WalletId,
  WalletItem,
  WalletItemWithAmount,
  Wallets,
} from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export default function useWallets() {
  const walletsStore = useWalletsStore()

  /**
   * Wallets IDs sorted
   *
   */
  const walletsIdsSorted = computed<WalletId[]>(
    () => walletsStore.walletsSortedIds,
  )

  /**
   * Wallets items sorted
   *
   */
  const walletsItemsSorted = computed<Record<WalletId, WalletItemWithAmount>>(
    () => {
      const walletsIdsSorted: WalletId[] = walletsStore.walletsSortedIds

      return walletsIdsSorted.reduce((acc: Wallets, id) => {
        acc[id] ??= []
        acc[id] = {
          ...walletsStore.items[id],
          amount: walletsStore.walletsTotal[id],
        }
        return acc
      }, {})
    },
  )

  /**
   * Wallets currencies
   */
  const walletsCurrencies = computed<WalletId[]>(() => {
    const walletsIdsSorted: WalletId[] = walletsStore.walletsSortedIds
    const walletsItems: Record<WalletId, WalletItem> = walletsStore.items

    // TODO: check A
    return walletsIdsSorted.reduce((acc, id) => {
      const currency = walletsItems[id].currency
      !acc.includes(currency) && acc.push(currency)
      return acc
    }, [])
  })

  return {
    walletsIdsSorted,
    walletsItemsSorted,
    walletsCurrencies,
  }
}
