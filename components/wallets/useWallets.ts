import type { ComputedRef } from '@vue/composition-api'
import type { WalletID, WalletItemWithAmount } from '~/components/wallets/types'
import type { Currency } from '~/components/currencies/types'

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
  const walletsItemsSorted = computed<Record<WalletID, WalletItemWithAmount>>(() => {
    const walletsIdsSorted: WalletID[] = $store.getters['wallets/walletsSortedIds']
    let wallets: Record<WalletID, WalletItemWithAmount> = {}

    for (const walletId of walletsIdsSorted) {
      wallets = {
        ...wallets,
        [walletId]: {
          ...$store.state.wallets.items[walletId],
          amount: $store.getters['wallets/walletsTotal'][walletId],
        },
      }
    }

    return wallets
  })

  /**
   * Wallets currencies
   */
  const walletsCurrencies = computed(() => {
    const currencies: Currency[] = []

    for (const walletId in walletsItemsSorted.value) {
      const walletCurrency = walletsItemsSorted.value[walletId].currency
      if (!currencies.includes(walletCurrency))
        currencies.push(walletCurrency)
    }

    return currencies
  })

  return {
    walletsIdsSorted,
    walletsItemsSorted,
    walletsCurrencies,
  }
}
