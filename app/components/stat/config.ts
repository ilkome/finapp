import { z } from 'zod'
import type { MoneyTypeNumber, MoneyTypeSlug, ViewOptions } from '~/components/stat/types'

export const defaultViewOptions: ViewOptions = {
  catsList: {
    isGrouped: true,
    isItemsBg: false,
    isLines: true,
    isOpened: false,
    isRoundIcon: true,
  },
  catsRound: {
    isGrouped: false,
    isShowFavorites: false,
    isShowRecent: false,
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
    isShowFavorites: z.boolean(),
    isShowRecent: z.boolean(),
  }),
  catsView: z.enum(['list', 'round']),
})

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
