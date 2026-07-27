import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { useStatCategories } from '~/components/stat/categories/useStatCategories'
import { statConfigKey } from '~/components/stat/injectionKeys'

export function useCategoriesBreakdown(props: {
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  preCategoriesIds?: CategoryId[]
  selectedTrnsIds?: TrnId[]
}) {
  const { computeCategoriesWithData } = useStatCategories()
  const statConfig = inject(statConfigKey)!

  const groupedCategories = computed(() => computeCategoriesWithData(props.selectedTrnsIds ?? [], true, undefined, props.excludedCategoriesIds))
  const ungroupedCategories = computed(() => computeCategoriesWithData(props.selectedTrnsIds ?? [], false, undefined, props.excludedCategoriesIds))

  const categoriesWithData = computed<CategoryWithData[]>(() => {
    const isGrouped = statConfig.config.value.categories[statConfig.config.value.categories.view === 'list' ? 'list' : 'round'].isGrouped

    if (statConfig.config.value.categories.isShowEmpty && props.preCategoriesIds?.length)
      return computeCategoriesWithData(props.selectedTrnsIds ?? [], isGrouped, props.preCategoriesIds, props.excludedCategoriesIds)

    return isGrouped ? groupedCategories.value : ungroupedCategories.value
  })

  return { categoriesWithData, groupedCategories, ungroupedCategories }
}
