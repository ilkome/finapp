import type { ComputedRef } from '@vue/composition-api'
import type { WalletID, WalletItemWithAmount } from '~/components/wallets/types'

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
    let wallets: Record<WalletID, WalletItemWithAmount> = {}

    for (const walletId of walletsIdsSorted) {
      wallets = {
        ...wallets,
        [walletId]: {
          ...$store.state.wallets.items[walletId],
          amount: $store.getters['wallets/walletsTotal'][walletId].base,
        },
      }
    }

    return wallets
  })

  return {
    walletsIdsSorted,
    walletsItemsSorted,
  }
}
