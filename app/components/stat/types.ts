import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { Range } from '~/components/date/types'
import type { ChartType } from '~/components/stat/chart/types'
import type { TrnId } from '~/components/trns/types'

export type MoneyTypeSlug = 'expense' | 'income'
export type MoneyTypeSlugNew = 'income' | 'expense' | 'netIncome' | 'summary'
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
  color?: string
  data: number[]
  markArea?: any
  markedArea?: 'markedArea'
  markLine?: Record<string, unknown>
  name: string
  type: ChartType
}

export type IntervalData = {
  range: Range
  total: TotalReturns
  trnsIds: TrnId[]
}

export type StatConfigModal = {
  close: () => void
  isShow: boolean
  show: () => void
}
