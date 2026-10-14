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

  // A group made of flagged wallets ("Archived", "Not in total") shows its own sum whatever the switches.
  const flagsFor = (isFlagGroup?: boolean) => isFlagGroup
    ? { includeArchived: true, includeExcluded: true }
    : { includeArchived: includeArchivedInStats.value, includeExcluded: includeExcludedInStats.value }
  const countWalletsSum = (walletsIds: WalletId[], isFlagGroup?: boolean) =>
    sumWalletsInBase(walletsIds, walletsStore.itemsComputed, currenciesStore.toBase, flagsFor(isFlagGroup))
  const countWalletsSumInOwnCurrency = (walletsIds: WalletId[], isFlagGroup?: boolean) =>
    sumWalletsInOwnCurrency(walletsIds, walletsStore.itemsComputed, flagsFor(isFlagGroup))

  return {
    counts,
    countWalletsSum,
    countWalletsSumInOwnCurrency,
  }
}
