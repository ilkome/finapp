import type { TrnType } from '~/components/trns/types'
import type { CategoryId, CategoryItem } from '~/components/categories/types'

export interface StatGroupHorizontalItemProps {
  biggest: number
  total: number
  type: TrnType
  category: CategoryItem
  categoryId: CategoryId
}
