import type { ComputedRef } from 'vue'

import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected, UseStatReportParams } from '~/components/stat/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getSelectedParentCategoryId } from '~/components/filter/selectedParentCategory'
import { countActiveFocusedChildren } from '~/components/stat/categories/focusedCategories'
import { getStatSnapshotQueryId, isStatDrilldownQuery, useStatCategoryNavigation } from '~/components/stat/navigation'
import { useStatReport } from '~/components/stat/useStatReport'
import { useTrnsQuickView } from '~/components/stat/useTrnsQuickView'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

type UseStatReportContextParams = UseStatReportParams & {
  hasChildren?: ComputedRef<boolean | undefined>
  onFilteredTypeChange?: (type: SeriesSlugSelected) => void
  preCategoriesIds?: ComputedRef<CategoryId[] | undefined>
  walletId?: ComputedRef<WalletId | undefined>
}

export function useStatReportContext(params: UseStatReportContextParams) {
  const report = useStatReport(params)
  const quickView = useTrnsQuickView(report.selectedAndFilteredTrnsIds)
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const route = useRoute()

  const isOneCategory = computed(() => !!params.categoryId?.value)
  const isCategoryFocus = computed(() =>
    !params.categoryId?.value
    && !params.walletId?.value
    && params.reportType.value === 'combined'
    && !params.type.value
    && (report.filteredType.value === 'expense' || report.filteredType.value === 'income'),
  )
  const shouldShowAmounts = computed(() => !params.categoryId?.value || params.categoryId.value !== 'transfer')
  const hasCategoriesData = computed(() => !!params.hasChildren?.value || (params.preCategoriesIds?.value ?? []).length > 0)
  const filteredParentCategoryId = computed(() => getSelectedParentCategoryId({
    getChildrenIds: categoryId => categoriesStore.getChildrenIds(categoryId),
    rootIds: categoriesStore.categoriesRootIds,
    selectedIds: params.filter.categoriesIds.value,
  }))
  const focusedQuickCategoryId = computed(() => filteredParentCategoryId.value ?? report.filteredCategoriesIds.value[0])
  const focusedQuickCategoryHasChildren = computed(() => {
    const categoryId = focusedQuickCategoryId.value
    return !!categoryId && categoriesStore.hasChildren(categoryId)
  })
  const focusedQuickCategoryActiveChildrenCount = computed(() => {
    const categoryId = focusedQuickCategoryId.value
    if (!categoryId)
      return 0
    return countActiveFocusedChildren({
      childrenIds: categoriesStore.getChildrenIds(categoryId),
      trnsIds: report.selectedAndQuickFilteredTrnsIds.value,
      trnsItems: trnsStore.items ?? {},
    })
  })
  const shouldShowCategoriesBreakdown = computed(() => {
    if (focusedQuickCategoryId.value)
      return focusedQuickCategoryHasChildren.value && focusedQuickCategoryActiveChildrenCount.value > 1

    return hasCategoriesData.value
      && (params.statConfig.config.value.categories.list.isShow || params.statConfig.config.value.categories.bars.isShow)
  })
  const shouldUseTwoColumnLayout = computed(() =>
    shouldShowCategoriesBreakdown.value
    && (params.statConfig.config.value.categories.list.isShow || focusedQuickCategoryHasChildren.value),
  )

  function onClickCategory(clickedCategoryId: CategoryId) {
    quickView.openQuickViewForCategory(clickedCategoryId)
  }

  const navigationWalletsIds = computed(() => [...new Set([
    ...(params.walletId?.value ? [params.walletId.value] : []),
    ...params.filter.walletsIds.value,
  ])])
  const onOpenCategory = useStatCategoryNavigation({
    categoriesIds: params.filter.categoriesIds,
    snapshot: computed(() => {
      const shouldCarryStatState = !params.categoryId?.value
        || getStatSnapshotQueryId(route.query.statSnapshot) !== null
        || isStatDrilldownQuery(route.query.statDrilldown)
      return shouldCarryStatState
        ? {
            config: params.statConfig.config.value,
            date: params.statDate.params.value,
            filteredType: report.filteredType.value,
            reportType: params.reportType.value,
            trns: {
              filterBy: report.trnsViewState.filterBy.value,
              isShowHistoryWithDesc: report.trnsViewState.isShowHistoryWithDesc?.value ?? false,
              isShowWithDesc: report.trnsViewState.isShowWithDesc.value,
            },
          }
        : null
    }),
    walletsIds: navigationWalletsIds,
  })

  function onClickSumItemWrap(type: SeriesSlugSelected) {
    if (type === 'net')
      quickView.openFullTrns()

    report.onClickSumItem(type)
    params.onFilteredTypeChange?.(report.filteredType.value)
  }

  return {
    ...report,
    ...quickView,
    filteredParentCategoryId,
    focusedQuickCategoryActiveChildrenCount,
    focusedQuickCategoryHasChildren,
    focusedQuickCategoryId,
    hasCategoriesData,
    isCategoryFocus,
    isOneCategory,
    onClickCategory,
    onClickSumItemWrap,
    onOpenCategory,
    params,
    shouldShowAmounts,
    shouldShowCategoriesBreakdown,
    shouldUseTwoColumnLayout,
  }
}
