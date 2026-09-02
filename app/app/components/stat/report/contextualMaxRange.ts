import type { CategoryId } from '~/components/categories/types'
import type { SeriesSlugSelected } from '~/components/stat/types'

export function shouldUseContextualMaxRange(options: {
  categoryIds: CategoryId[]
  isShowMaxRange: boolean
  selectedType: SeriesSlugSelected
}): boolean {
  return options.isShowMaxRange
    && options.selectedType !== 'net'
    && options.categoryIds.length > 0
}
