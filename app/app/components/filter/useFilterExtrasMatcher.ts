import type { FilterProvider } from '~/components/filter/types'
import type { TrnId } from '~/components/trns/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { createExtrasMatcher } from '~/components/filter/extras'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

/** Page-level narrowing by the filter drawer's "More" tab, applied after wallet / category selection. */
export function useFilterExtrasMatcher(filter: FilterProvider) {
  const trnsStore = useTrnsStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const currenciesStore = useCurrenciesStore()

  const matches = computed(() => createExtrasMatcher(filter.extras.value, {
    baseCurrency: currenciesStore.base,
    categories: categoriesStore.items,
    rates: currenciesStore.rates,
    wallets: walletsStore.items,
  }))

  return (ids: TrnId[]) => ids.filter(id => matches.value(trnsStore.items?.[id]))
}
