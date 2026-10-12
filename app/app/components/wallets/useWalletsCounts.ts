import type { ComputedRef, Ref } from 'vue'

import type { WalletId } from '~/components/wallets/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { computeWalletCounts, sumWalletsInBase, sumWalletsInOwnCurrency } from '~/components/wallets/counts'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export function useWalletsCounts(
  selectedWalletsIdsWithCurrency: ComputedRef<WalletId[]>,
  includeArchivedInStats: Ref<boolean>,
  includeExcludedInStats: Ref<boolean>,
) {
  const walletsStore = useWalletsStore()
  const currenciesStore = useCurrenciesStore()

  const counts = computed(() => computeWalletCounts({
    includeArchivedInStats: includeArchivedInStats.value,
    includeExcludedInStats: includeExcludedInStats.value,
    toBase: currenciesStore.toBase,
    totalWalletsCount: Object.values(walletsStore.itemsComputed).filter(w => !w.isArchived).length,
    walletIds: selectedWalletsIdsWithCurrency.value,
    wallets: walletsStore.itemsComputed,
  }))

  const countWalletsSum = (walletsIds: WalletId[]) => sumWalletsInBase(walletsIds, walletsStore.itemsComputed, currenciesStore.toBase)
  const countWalletsSumInOwnCurrency = (walletsIds: WalletId[]) => sumWalletsInOwnCurrency(walletsIds, walletsStore.itemsComputed)

  return {
    counts,
    countWalletsSum,
    countWalletsSumInOwnCurrency,
  }
}
