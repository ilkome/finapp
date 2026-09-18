import type { ComputedRef, Ref } from 'vue'
import type { Range } from '~~/utils/date/types'

import type { CategoryId } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { StatDateProvider } from '~/components/stat/date/types'
import type { SeriesSlugSelected } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { shouldUseContextualMaxRange } from '~/components/stat/report/contextualMaxRange'
import { getTypesMapping, getUsedWalletIds } from '~/components/stat/utils'
import { getWalletPeriodTotals, sortWalletIdsByPeriodTotal } from '~/components/stat/walletPeriodTotals'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

type Params = {
  activeWalletType: Ref<SeriesSlugSelected>
  effectiveFilteredCategoriesIds: ComputedRef<CategoryId[]>
  filter: FilterProvider
  quickWalletIds: Ref<WalletId[]>
  quickWalletTrnsIds: ComputedRef<TrnId[]>
  selectionSourceRange: ComputedRef<Range | undefined>
  statDate: StatDateProvider
  walletSourceTrnsIds: ComputedRef<TrnId[]>
}

/** Per-wallet totals for the selected period plus the max range the current focus can reach. */
export function useStatWalletPeriod(params: Params) {
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const walletsStore = useWalletsStore()

  const focusedCategoriesIds = computed(() => {
    const ids = params.effectiveFilteredCategoriesIds.value
    return ids.length ? categoriesStore.getTransactibleIds(ids) : undefined
  })

  // One store pass for the period; totals and the used-wallet list narrow it by type in memory.
  const periodTrnsIds = computed(() => trnsStore.getStoreTrnsIds({
    categoriesIds: focusedCategoriesIds.value,
    dates: params.selectionSourceRange.value,
    trnsIds: params.walletSourceTrnsIds.value,
    trnsTypes: getTypesMapping('net'),
  }))

  function byTypes(types: TrnType[]) {
    const items = trnsStore.items ?? {}
    return periodTrnsIds.value.filter(id => types.includes(items[id]!.type))
  }

  const walletPeriodTotals = computed(() => getWalletPeriodTotals({
    excludedCategoryIds: focusedCategoriesIds.value || params.filter.categoriesIds.value.length > 0
      ? undefined
      : categoriesStore.excludedFromStatsIds,
    trnsIds: byTypes([TrnType.Expense, TrnType.Income]),
    trnsItems: trnsStore.items ?? {},
  }))

  const periodWalletIds = computed(() => {
    const usedIds = new Set(getUsedWalletIds(byTypes(getTypesMapping(params.activeWalletType.value)), trnsStore.items ?? {}))
    return sortWalletIdsByPeriodTotal(
      walletsStore.sortedIds.filter(id => usedIds.has(id)),
      walletPeriodTotals.value,
    )
  })

  const contextualMaxRange = computed<Range | null>(() => {
    if (!shouldUseContextualMaxRange({
      hasCategoryFilter: params.effectiveFilteredCategoriesIds.value.length > 0,
      hasWalletFilter: params.filter.walletsIds.value.length > 0 || params.quickWalletIds.value.length > 0,
      isShowMaxRange: params.statDate.params.value.isShowMaxRange,
    })) {
      return null
    }

    const ids = trnsStore.getStoreTrnsIds({
      categoriesIds: focusedCategoriesIds.value,
      trnsIds: params.quickWalletTrnsIds.value,
      trnsTypes: getTypesMapping(params.activeWalletType.value),
    })
    return ids.length ? trnsStore.getRange(ids) : null
  })

  return { contextualMaxRange, periodWalletIds, walletPeriodTotals }
}
