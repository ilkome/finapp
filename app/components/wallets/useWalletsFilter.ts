import type { Ref } from 'vue'

import { useStorage } from '@vueuse/core'

import type { WalletId, WalletsCurrencyFiltered, WalletsGroupedBy, WalletViewTypes } from '~/components/wallets/types'

import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { filterWalletsByCurrency, filterWalletsByViewType } from '~/components/wallets/filters'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export function useWalletsFilter(groupedBy: Ref<WalletsGroupedBy>, showArchived: Ref<boolean>) {
  const walletsStore = useWalletsStore()

  const currencyFiltered = useStorage<WalletsCurrencyFiltered>(WALLET_STORAGE_KEYS.activeCurrency, 'all')
  const walletViewType = useStorage<WalletViewTypes | 'total'>(WALLET_STORAGE_KEYS.activeType, 'total')

  function setWalletViewType(v: WalletViewTypes | 'total') {
    walletViewType.value = v
  }

  const selectedWalletsIdsWithCurrency = computed<WalletId[]>(() =>
    filterWalletsByCurrency(walletsStore.itemsComputed, groupedBy.value, currencyFiltered.value),
  )

  const selectedWalletsIds = computed<WalletId[]>(() =>
    filterWalletsByViewType(selectedWalletsIdsWithCurrency.value, walletsStore.itemsComputed, walletViewType.value, showArchived.value),
  )

  watch(selectedWalletsIds, (ids) => {
    if (ids.length === 0 && walletViewType.value !== 'total') {
      const totalIds = filterWalletsByViewType(selectedWalletsIdsWithCurrency.value, walletsStore.itemsComputed, 'total', showArchived.value)
      if (totalIds.length > 0)
        walletViewType.value = 'total'
    }
  })

  return {
    currencyFiltered,
    selectedWalletsIds,
    selectedWalletsIdsWithCurrency,
    setWalletViewType,
    walletViewType,
  }
}
