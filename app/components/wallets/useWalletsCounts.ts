import type { ComputedRef } from 'vue'

import type { WalletId } from '~/components/wallets/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { computeWalletCounts, sumWalletAmounts } from '~/components/wallets/counts'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export function useWalletsCounts(
  selectedWalletsIdsWithCurrency: ComputedRef<WalletId[]>,
) {
  const walletsStore = useWalletsStore()
  const currenciesStore = useCurrenciesStore()

  const counts = computed(() => computeWalletCounts({
    baseCurrency: currenciesStore.base,
    rates: currenciesStore.rates,
    totalWalletsCount: Object.values(walletsStore.itemsComputed).filter(w => !w.isArchived).length,
    walletIds: selectedWalletsIdsWithCurrency.value,
    wallets: walletsStore.itemsComputed,
  }))

  function countWalletsSum(walletsIds: WalletId[], isConvert = true) {
    return sumWalletAmounts({
      baseCurrency: currenciesStore.base,
      convert: isConvert,
      rates: currenciesStore.rates,
      walletIds: walletsIds,
      wallets: walletsStore.itemsComputed,
    })
  }

  return {
    counts,
    countWalletsSum,
  }
}
