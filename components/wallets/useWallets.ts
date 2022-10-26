import type { ComputedRef } from '@vue/composition-api'
import type { WalletID, WalletItem, WalletItemWithAmount } from '~/components/wallets/types'

export default function useWallets() {
  const { $store } = useNuxtApp()

  /**
   * Wallets IDs sorted
   *
   */
  const walletsIdsSorted: ComputedRef<WalletID[]> = computed(() => $store.getters['wallets/walletsSortedIds'])

  /**
   * Wallets items sorted
   *
   */
  const walletsItemsSorted: ComputedRef<Record<WalletID, WalletItemWithAmount>> = computed(() => {
    const walletsIdsSorted: WalletID[] = $store.getters['wallets/walletsSortedIds']

    return walletsIdsSorted.reduce((acc, id) => {
      acc[id] ??= []
      acc[id] = {
        ...$store.state.wallets.items[id],
        amount: $store.getters['wallets/walletsTotal'][id],
      }
      return acc
    }, {})
  })

  /**
   * Wallets currencies
   */
  const walletsCurrencies: ComputedRef<WalletID[]> = computed(() => {
    const walletsIdsSorted: WalletID[] = $store.getters['wallets/walletsSortedIds']
    const walletsItems: Record<WalletID, WalletItem> = $store.state.wallets.items

    // TODO: check A
    return walletsIdsSorted.reduce((acc, id) => {
      const currency = walletsItems[id].currency
      !acc.includes(currency)
        && acc.push(currency)
      return acc
    }, [])
  })

  return {
    walletsIdsSorted,
    walletsItemsSorted,
    walletsCurrencies,
  }
}
