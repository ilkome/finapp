import type { Ref } from 'vue'

import { useStorage } from '@vueuse/core'

import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletsCurrencyFiltered, WalletsGroupedBy, WalletType, WalletViewTypes } from '~/components/wallets/types'

import { filterWalletsByCurrency, filterWalletsByViewType } from '~/components/wallets/filters'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export function useWalletsFilter(groupedBy: Ref<WalletsGroupedBy>) {
  const walletsStore = useWalletsStore()

  const currencyFiltered = useStorage<WalletsCurrencyFiltered>('finapp-wallets-active-currency', 'all')
  const walletViewType = useStorage<WalletViewTypes | 'total'>('finapp-wallets-active-type', 'total')

  function setWalletViewType(v: WalletType | 'total') {
    walletViewType.value = v
  }

  const selectedWalletsIdsWithCurrency = computed<WalletId[]>(() =>
    filterWalletsByCurrency(walletsStore.itemsComputed, groupedBy.value, currencyFiltered.value),
  )

  const selectedWalletsIds = computed<WalletId[]>(() =>
    filterWalletsByViewType(selectedWalletsIdsWithCurrency.value, walletsStore.itemsComputed, walletViewType.value),
  )

  function onSelectFilterCurrency(code: CurrencyCode, toggle?: () => void) {
    if (currencyFiltered.value === code && toggle)
      toggle()

    walletViewType.value = 'total'
    currencyFiltered.value = code
  }

  return {
    currencyFiltered,
    onSelectFilterCurrency,
    selectedWalletsIds,
    selectedWalletsIdsWithCurrency,
    setWalletViewType,
    walletViewType,
  }
}
