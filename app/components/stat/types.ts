import type { z } from 'zod'
import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'
import type { ViewOptionsSchema } from '~/components/stat/config'

export type MoneyTypeSlug = 'expense' | 'income'
export type MoneyTypeSlugSum = 'income' | 'expense' | 'sum' | 'summary'
export type MoneyTypeSlugNew = 'income' | 'expense' | 'sum'
export type MoneyTypeNumber = 0 | 1 | 3

export type ViewOptions = z.infer<typeof ViewOptionsSchema>

export type TotalCategories = {
  expense: TotalCategory[]
  income: TotalCategory[]
}

export type TotalCategory = {
  id: CategoryId
  trnsIds: TrnId[]
  value: number
}

export const chartViewOptions = ['half', 'full'] as const
export type ChartView = (typeof chartViewOptions)[number]

export type MiniItemConfig = {
  chartView: ChartView
  update: <K extends keyof Omit<MiniItemConfig, 'update'>>(
    key: K,
    value: MiniItemConfig[K]
  ) => void
}
