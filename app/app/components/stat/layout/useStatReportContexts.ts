import type { ComputedRef } from 'vue'

import type { CategoryId } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/types'
import type { StatConfigProvider } from '~/components/stat/config/types'
import type { StatDateProvider } from '~/components/stat/date/types'
import type { SeriesSlugSelected, StatQuickCategoryFilter, StatReportSelectedRecord, StatReportType } from '~/components/stat/types'
import type { TrnId, TrnsListFilterState } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { resolveStatSelectionSourceRange } from '~/components/stat/date/selectionRange'
import { resolveQuickCategorySelection } from '~/components/stat/quickCategorySelection'
import { buildSortedStatReportSelection } from '~/components/stat/report/useStatReportData'
import { useStatReportContext } from '~/components/stat/useStatReportContext'
import { getTypesMapping } from '~/components/stat/utils'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

type Params = {
  categoryId: ComputedRef<CategoryId | undefined>
  filter: FilterProvider
  hasChildren: ComputedRef<boolean | undefined>
  initialFilteredType?: SeriesSlugSelected
  preCategoriesIds: ComputedRef<CategoryId[] | undefined>
  reportType: StatReportType
  statConfig: StatConfigProvider
  statDate: StatDateProvider
  storageKey: ComputedRef<string>
  trnsIds: ComputedRef<TrnId[]>
  trnsViewState: TrnsListFilterState
  walletId: ComputedRef<WalletId | undefined>
}

/**
 * Report contexts share one trns projection so the split layout shows expense and income
 * side by side without re-filtering the source three times. Only `combined` is built here;
 * the split pair comes from `createContext` inside `StatSplitContexts` when a split is shown.
 */
export function useStatReportContexts(params: Params) {
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const activeWalletType = ref<SeriesSlugSelected>('net')

  const projections = computed(() => {
    const expense: TrnId[] = []
    const income: TrnId[] = []
    for (const id of params.trnsIds.value) {
      const type = trnsStore.items?.[id]?.type
      if (type === TrnType.Expense)
        expense.push(id)
      else if (type === TrnType.Income)
        income.push(id)
    }
    return { combined: params.trnsIds.value, expense, income }
  })

  const selectionSourceRange = computed(() => resolveStatSelectionSourceRange(
    params.statDate.range.value,
    params.statDate.selectedInterval.value,
    params.statDate.params.value.intervalSelected,
    params.statDate.params.value.isShowMaxRange,
  ))
  const sharedSelection = computed(() => buildSortedStatReportSelection({
    sourceIds: trnsStore.getStoreTrnsIds({ dates: selectionSourceRange.value, trnsIds: params.trnsIds.value }),
    trnsItems: trnsStore.items ?? {},
    trnsTypes: getTypesMapping('combined'),
  }))
  const selectionProjections = computed(() => {
    const expense: StatReportSelectedRecord[] = []
    const income: StatReportSelectedRecord[] = []
    for (const record of sharedSelection.value) {
      const type = trnsStore.items?.[record.id]?.type
      if (type === TrnType.Expense)
        expense.push(record)
      else if (type === TrnType.Income)
        income.push(record)
    }
    return { combined: sharedSelection.value, expense, income }
  })

  const quickCategoryFilters = Object.fromEntries(
    (['combined', 'expense', 'income'] as const).map(reportType => [reportType, {
      categoriesIds: ref<CategoryId[]>([]),
      childCategoryId: ref<CategoryId>(),
    }]),
  ) as Record<StatReportType, StatQuickCategoryFilter>

  function setQuickCategoryFilter(categoryId: CategoryId) {
    const transactibleIds = new Set(categoriesStore.getTransactibleIds([categoryId]))
    const selection = resolveQuickCategorySelection({
      categoryId,
      hasExpense: selectionProjections.value.expense.some(record => transactibleIds.has(record.categoryId)),
      hasIncome: selectionProjections.value.income.some(record => transactibleIds.has(record.categoryId)),
      isSelected: Object.values(quickCategoryFilters).some(filter => filter.categoriesIds.value.includes(categoryId)),
    })

    for (const reportType of ['combined', 'expense', 'income'] as const) {
      quickCategoryFilters[reportType].categoriesIds.value = selection[reportType]
      quickCategoryFilters[reportType].childCategoryId.value = undefined
    }
  }

  for (const filter of Object.values(quickCategoryFilters))
    filter.setCategoryFilter = setQuickCategoryFilter

  const commonParams = {
    applyStatsExclusion: computed(() => !params.categoryId.value && !params.filter.categoriesIds.value.length),
    categoryId: params.categoryId,
    filter: params.filter,
    hasChildren: params.hasChildren,
    initialFilteredType: params.initialFilteredType,
    preCategoriesIds: params.preCategoriesIds,
    statConfig: params.statConfig,
    statDate: params.statDate,
    storageKey: params.storageKey,
    trnsViewState: params.trnsViewState,
    walletId: params.walletId,
  }

  function createContext(reportType: StatReportType) {
    return useStatReportContext({
      ...commonParams,
      onFilteredTypeChange: (type) => {
        activeWalletType.value = type
      },
      quickCategoryFilter: quickCategoryFilters[reportType],
      reportType: computed(() => reportType),
      selectionSource: computed(() => selectionProjections.value[reportType]),
      trnsIds: computed(() => projections.value[reportType]),
      type: computed(() => reportType === 'combined' ? undefined : reportType),
    })
  }

  const combined = createContext(params.reportType)
  activeWalletType.value = combined.filteredType.value

  return { activeWalletType, combined, createContext, selectionSourceRange }
}
