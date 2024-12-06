import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { Range } from '~/components/date/types'

export type MoneyTypeSlug = 'expense' | 'income'
export type MoneyTypeSlugSum = 'income' | 'expense' | 'sum' | 'summary'
export type MoneyTypeSlugNew = 'income' | 'expense' | 'sum'
export type MoneyTypeNumber = 0 | 1 | 3

export type TotalCategories = {
  expense: CategoryWithData[]
  income: CategoryWithData[]
}

export type CategoryWithDataBase = {
  id: CategoryId
  name: CategoryItem['name']
  trnsIds: TrnId[]
  value: number
}

export type CategoryWithData = CategoryWithDataBase & {
  categories?: CategoryWithDataBase[]
}

export type CategoriesWithData = Record<CategoryId, CategoryWithData>

export type CategoriesWithTrns = Record<CategoryId, TrnId[]>

export type ChartSeries = {
  color: string
  data: number[]
  markArea?: any
  markedArea?: 'markedArea'
  name: string
  type: MoneyTypeSlugNew
}

export type IntervalData = {
  range: Range
  total: TotalReturns
  trnsIds: TrnId[]
}
