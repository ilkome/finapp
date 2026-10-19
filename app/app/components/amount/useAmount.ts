import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'

import { getTotal } from '~/components/amount/getTotal'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export function useAmount() {
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const trnsStore = useTrnsStore()

  function computeTotalForTrnsIds(trnsIds: TrnId[], { excludedCategoriesIds }: { excludedCategoriesIds?: ReadonlySet<CategoryId> } = {}): TotalReturns {
    return getTotal({
      excludedCategoriesIds,
      toBase: currenciesStore.tryToBase,
      trnsIds,
      trnsItems: trnsStore.items ?? {},
      walletsItems: walletsStore.items ?? {},
    })
  }

  return {
    computeTotalForTrnsIds,
  }
}
