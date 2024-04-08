export type MoneyTypeSlug = 'expense' | 'income'
export type MoneyTypeSlugSum = 'income' | 'expense' | 'sum' | 'summary'
export type MoneyTypeNumber = 0 | 1 | 3

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
