import type { CategoryId } from '~/components/categories/types'
import type { CategoryViews } from '~/components/stat/categories/categoryViews'
import type { CategoryWithData } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { addEmptyCategoryViews, buildCategoryViews, resolveCategoryGrouping } from '~/components/stat/categories/categoryViews'
import { filterFocusedCategories } from '~/components/stat/categories/focusedCategories'
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

export function useCategoriesBreakdown(props: {
  baseCategoryViews?: CategoryViews
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  focusedCategoryId?: CategoryId
  isOneCategory?: boolean
  preCategoriesIds?: CategoryId[]
  selectedTrnsIds?: TrnId[]
}) {
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const { computeTotalForTrnsIds } = useAmount()
  const statConfig = useStatConfigCtx()

  const views = computed(() => props.baseCategoryViews ?? buildCategoryViews({
    categoriesItems: categoriesStore.items,
    computeValue: ids => computeTotalForTrnsIds(ids).net,
    excludedCategoriesIds: props.excludedCategoriesIds,
    trnsIds: props.selectedTrnsIds ?? [],
    trnsItems: trnsStore.items ?? {},
  }))
  const ungroupedCategories = computed(() => views.value.ungrouped)
  const focusedCategories = computed<CategoryWithData[]>(() => {
    if (!props.focusedCategoryId)
      return []

    const childrenIds = categoriesStore.getChildrenIds(props.focusedCategoryId)
    if (childrenIds.length === 0)
      return []

    return filterFocusedCategories(ungroupedCategories.value, childrenIds)
  })

  const categoriesWithData = computed<CategoryWithData[]>(() => {
    // A category page already sits inside the parent, so a parent grouping would collapse the
    // children into the one row the user is looking at.
    const grouping = props.isOneCategory ? 'child' : statConfig.categories.value.list.grouping

    if (statConfig.categories.value.isShowEmpty && props.preCategoriesIds?.length) {
      const withEmpty = addEmptyCategoryViews(
        views.value,
        categoriesStore.items,
        props.preCategoriesIds,
        props.excludedCategoriesIds,
      )
      return resolveCategoryGrouping(withEmpty, grouping, views.value.ungrouped)
    }

    return resolveCategoryGrouping(views.value, grouping)
  })

  return { categoriesWithData, focusedCategories, views }
}
