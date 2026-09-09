import type { ComputedRef } from 'vue'

import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected, UseStatReportParams } from '~/components/stat/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getParentCategoryIdOrUndefined } from '~/components/categories/utils'
import { getSelectedParentCategoryId } from '~/components/filter/selectedParentCategory'
import { countActiveFocusedChildren, resolveFocusedParentId } from '~/components/stat/categories/focusedCategories'
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
  const selectedQuickCategoryId = computed(() => report.filteredCategoriesIds.value[0])
  const selectedQuickParentId = computed(() => resolveFocusedParentId(
    selectedQuickCategoryId.value,
    categoryId => getParentCategoryIdOrUndefined(categoriesStore.items, categoryId),
  ))
  /**
   * Whether the cloud shows the selected branch as one parent chip. Only then does the focus
   * row add anything: with a child grouping the cloud already lists the children itself.
   */
  const isQuickFocusGrouped = computed(() => {
    const parentId = selectedQuickParentId.value
    if (!parentId)
      return false
    const grouping = params.statConfig.config.value.categories.round.grouping
    if (grouping !== 'auto')
      return grouping === 'parent'
    // The selection holds a slot in its group even with nothing in this period, matching how
    // the cloud groups it (see resolveCategoryGrouping's pinned ids).
    const selectedId = selectedQuickCategoryId.value
    const siblingIds = categoriesStore.getChildrenIds(parentId).filter(id => id !== selectedId)
    const activeSiblings = countActiveFocusedChildren({
      childrenIds: siblingIds,
      trnsIds: report.selectedTrnsIds.value,
      trnsItems: trnsStore.items ?? {},
    })
    return activeSiblings + (selectedId === parentId ? 0 : 1) > 1
  })
  const isSelectedFoldedIntoParent = computed(() =>
    isQuickFocusGrouped.value && selectedQuickParentId.value !== selectedQuickCategoryId.value)
  const focusedQuickCategoryId = computed(() => filteredParentCategoryId.value
    ?? (isSelectedFoldedIntoParent.value ? selectedQuickParentId.value : selectedQuickCategoryId.value))
  const focusedQuickChildCategoryId = computed(() => report.filteredChildCategoryId.value
    ?? (isSelectedFoldedIntoParent.value ? selectedQuickCategoryId.value : undefined))
  /**
   * The focus row lists the focused category's own transactions. When a child is selected the
   * quick filter is narrowed to that child, which would leave its siblings out of the row.
   */
  const focusedQuickTrnsIds = computed(() => {
    const parentId = isSelectedFoldedIntoParent.value ? selectedQuickParentId.value : undefined
    if (!parentId)
      return report.selectedAndQuickFilteredTrnsIds.value
    return trnsStore.getStoreTrnsIds({
      categoriesIds: categoriesStore.getTransactibleIds([parentId]),
      trnsIds: report.selectedTrnsIds.value,
    })
  })
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
      trnsIds: focusedQuickTrnsIds.value,
      trnsItems: trnsStore.items ?? {},
    })
  })
  const shouldShowCategoriesBreakdown = computed(() => {
    if (focusedQuickCategoryId.value) {
      return focusedQuickCategoryHasChildren.value
        && focusedQuickCategoryActiveChildrenCount.value > 0
        && (!!filteredParentCategoryId.value || isQuickFocusGrouped.value)
    }

    return hasCategoriesData.value
      && (params.statConfig.config.value.categories.list.isShow || params.statConfig.config.value.categories.bars.isShow)
  })
  const shouldUseTwoColumnLayout = computed(() =>
    shouldShowCategoriesBreakdown.value
    && (params.statConfig.config.value.categories.list.isShow || focusedQuickCategoryHasChildren.value),
  )

  /**
   * A child picked in the focus row becomes the selection itself, so it survives a period
   * change like any other pick. Clicking the highlighted one steps back up to the parent.
   */
  function onSetFocusedChildCategoryFilter(categoryId: CategoryId) {
    const parentId = selectedQuickParentId.value
    const isClearingSelectedChild = isSelectedFoldedIntoParent.value
      && !!parentId
      && selectedQuickCategoryId.value === categoryId
    report.onSetCategoryFilter(isClearingSelectedChild ? parentId : categoryId)
  }

  function onClickCategory(clickedCategoryId: CategoryId) {
    quickView.openQuickViewForCategory(clickedCategoryId)
  }

  const navigationWalletsIds = computed(() => [...new Set([
    ...(params.walletId?.value ? [params.walletId.value] : []),
    ...params.filter.walletsIds.value,
  ])])
  const onOpenCategory = useStatCategoryNavigation({
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
    focusedQuickChildCategoryId,
    focusedQuickTrnsIds,
    hasCategoriesData,
    isCategoryFocus,
    isOneCategory,
    onClickCategory,
    onClickSumItemWrap,
    onOpenCategory,
    onSetFocusedChildCategoryFilter,
    params,
    shouldShowAmounts,
    shouldShowCategoriesBreakdown,
    shouldUseTwoColumnLayout,
  }
}
