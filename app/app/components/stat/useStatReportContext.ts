import type { ComputedRef } from 'vue'

import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected } from '~/components/stat/types'
import type { UseStatReportParams } from '~/components/stat/useStatReport'
import type { WalletId } from '~/components/wallets/types'

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

  const isOneCategory = computed(() => !!params.categoryId?.value)
  const shouldShowAmounts = computed(() => !params.categoryId?.value || params.categoryId.value !== 'transfer')
  const hasCategoriesData = computed(() => !!params.hasChildren?.value || (params.preCategoriesIds?.value ?? []).length > 0)
  const shouldUseTwoColumnLayout = computed(() => params.statTab.value !== 'split' && params.statConfig.config.value.categories.list.isShow)

  function onClickCategory(clickedCategoryId: CategoryId) {
    if (params.categoryId?.value) {
      params.filter.setCategoryId(clickedCategoryId)

      return useRouter().push({
        path: `/categories/${clickedCategoryId}`,
        query: {
          filterCategories: params.filter.categoriesIds.value.join(','),
          filterWallets: params.walletId?.value ? params.walletId.value : params.filter.walletsIds.value.join(','),
          storageKey: params.storageKey.value ?? '',
        },
      })
    }

    quickView.openQuickViewForCategory(clickedCategoryId)
  }

  function onClickSumItemWrap(type: SeriesSlugSelected) {
    if (type === 'netIncome')
      quickView.openFullTrns()

    report.onClickSumItem(type)
  }

  return {
    ...report,
    ...quickView,
    hasCategoriesData,
    isOneCategory,
    onClickCategory,
    onClickSumItemWrap,
    params,
    shouldShowAmounts,
    shouldUseTwoColumnLayout,
  }
}

export type StatReportContext = ReturnType<typeof useStatReportContext>
