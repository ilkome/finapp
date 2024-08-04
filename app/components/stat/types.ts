import { z } from 'zod'

export type MoneyTypeSlug = 'expense' | 'income'
export type MoneyTypeSlugSum = 'income' | 'expense' | 'sum' | 'summary'
export type MoneyTypeSlugNew = 'income' | 'expense' | 'sum'
export type MoneyTypeNumber = 0 | 1 | 3

export const defaultViewOptions: ViewOptions = {
  catsList: {
    isGrouped: false,
    isItemsBg: false,
    isLines: true,
    isOpened: false,
    isRoundIcon: false,
  },
  catsRound: {
    isGrouped: false,
  },
  catsView: 'list',
}

export const ViewOptionsSchema = z.object({
  catsList: z.object({
    isGrouped: z.boolean(),
    isItemsBg: z.boolean(),
    isLines: z.boolean(),
    isOpened: z.boolean(),
    isRoundIcon: z.boolean(),
  }),
  catsRound: z.object({
    isGrouped: z.boolean(),
  }),
  catsView: z.enum(['list', 'round']),
})

export type ViewOptions = z.infer<typeof ViewOptionsSchema>

export const moneyTypes: {
  id: MoneyTypeSlug
  slug: MoneyTypeSlug
  type: MoneyTypeNumber
}[] = [
  {
    id: 'expense',
    slug: 'expense',
    type: 0,
  },
  {
    id: 'income',
    slug: 'income',
    type: 1,
  },
]
