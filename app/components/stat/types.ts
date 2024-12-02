import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'

export type MoneyTypeSlug = 'expense' | 'income'
export type MoneyTypeSlugSum = 'income' | 'expense' | 'sum' | 'summary'
export type MoneyTypeSlugNew = 'income' | 'expense' | 'sum'
export type MoneyTypeNumber = 0 | 1 | 3

export type TotalCategories = {
  expense: CategoryWithData[]
  income: CategoryWithData[]
}

export type CategoryWithData = {
  id: CategoryId
  trnsIds: TrnId[]
  value: number
}

export type CategoriesWithTrns = Record<CategoryId, TrnId[]>
