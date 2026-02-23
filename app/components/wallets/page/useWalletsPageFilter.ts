import type { Ref } from 'vue'

import { useStorage } from '@vueuse/core'

import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletsCurrencyFiltered, WalletsGroupedBy, WalletType, WalletViewTypes } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export function useWalletsPageFilter(groupedBy: Ref<WalletsGroupedBy>) {
  const walletsStore = useWalletsStore()

  const currencyFiltered = useStorage<WalletsCurrencyFiltered>('finapp-wallets-active-currency', 'all')
  const walletViewType = useStorage<WalletViewTypes | 'total'>('finapp-wallets-active-type', 'total')

  function setWalletViewType(v: WalletType | 'total') {
    walletViewType.value = v
  }

  const selectedWalletsIdsWithCurrency = computed<WalletId[]>(() => {
    return Object.keys(walletsStore.itemsComputed).filter((id) => {
      const wallet = walletsStore.itemsComputed[id]
      if (groupedBy.value === 'currency')
        return true
      return currencyFiltered.value === 'all' || currencyFiltered.value === wallet?.currency
    })
  })

  const selectedWalletsIds = computed<WalletId[]>(() => {
    return selectedWalletsIdsWithCurrency.value.filter((id) => {
      const wallet = walletsStore.itemsComputed[id]!

      if (walletViewType.value === 'isWithdrawal')
        return wallet.isWithdrawal && !wallet.isArchived

      if (walletViewType.value === 'isExcludeInTotal')
        return wallet.isExcludeInTotal

      if (walletViewType.value === 'isArchived')
        return wallet.isArchived

      if (walletViewType.value === 'isAvailable')
        return (wallet.type === 'credit' || wallet.isWithdrawal) && !wallet.isArchived

      if (walletViewType.value === 'total')
        return !wallet.isArchived

      return wallet.type === walletViewType.value
    })
  })

  const isShowCurrencyFilter = ref(false)

  function onSelectFilterCurrency(code: CurrencyCode, toggle?: () => void) {
    if (currencyFiltered.value === code && toggle)
      toggle()

    walletViewType.value = 'total'
    currencyFiltered.value = code
    isShowCurrencyFilter.value = false
  }

  return {
    currencyFiltered,
    isShowCurrencyFilter,
    onSelectFilterCurrency,
    selectedWalletsIds,
    selectedWalletsIdsWithCurrency,
    setWalletViewType,
    walletViewType,
  }
}
