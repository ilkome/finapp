import type { ComputedRef } from 'vue'

import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected, UseStatReportParams } from '~/components/stat/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getStatSnapshotQueryId, isStatDrilldownQuery, useStatCategoryNavigation } from '~/components/stat/navigation'
import { useStatReport } from '~/components/stat/useStatReport'
import { useTrnsQuickView } from '~/components/stat/useTrnsQuickView'

type UseStatReportContextParams = UseStatReportParams & {
  categoryId?: ComputedRef<CategoryId | undefined>
  hasChildren?: ComputedRef<boolean | undefined>
  preCategoriesIds?: ComputedRef<CategoryId[] | undefined>
  walletId?: ComputedRef<WalletId | undefined>
}

export function useStatReportContext(params: UseStatReportContextParams) {
  const report = useStatReport(params)
  const quickView = useTrnsQuickView(report.selectedAndFilteredTrnsIds)
  const categoriesStore = useCategoriesStore()
  const route = useRoute()

  const isOneCategory = computed(() => !!params.categoryId?.value)
  const isCategoryFocus = computed(() =>
    !params.categoryId?.value
    && !params.walletId?.value
    && params.statTab.value === 'summary'
    && !params.type.value
    && (report.filteredType.value === 'expense' || report.filteredType.value === 'income'),
  )
  const shouldShowAmounts = computed(() => !params.categoryId?.value || params.categoryId.value !== 'transfer')
  const hasCategoriesData = computed(() => !!params.hasChildren?.value || (params.preCategoriesIds?.value ?? []).length > 0)
  const focusedQuickCategoryId = computed(() => report.filteredCategoriesIds.value[0])
  const focusedQuickCategoryHasChildren = computed(() => {
    const categoryId = focusedQuickCategoryId.value
    return !!categoryId && categoriesStore.hasChildren(categoryId)
  })
  const shouldShowCategoriesBreakdown = computed(() => {
    if (focusedQuickCategoryId.value)
      return focusedQuickCategoryHasChildren.value

    return hasCategoriesData.value
      && (params.statConfig.config.value.categories.list.isShow || params.statConfig.config.value.categories.bars.isShow)
  })
  const shouldUseTwoColumnLayout = computed(() =>
    params.statTab.value !== 'split'
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
            activeTab: params.statTab.value,
            config: params.statConfig.config.value,
            date: params.statDate.params.value,
            trns: {
              filterBy: report.trnsViewState.filterBy.value,
              isShowWithDesc: report.trnsViewState.isShowWithDesc.value,
            },
          }
        : null
    }),
    walletsIds: navigationWalletsIds,
  })

  function onClickSumItemWrap(type: SeriesSlugSelected) {
    if (type === 'netIncome')
      quickView.openFullTrns()

    report.onClickSumItem(type)
  }

  return {
    ...report,
    ...quickView,
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
