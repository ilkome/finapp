import { describe, expect, it } from 'vitest'

import { resolveQuickCategorySelection } from '~/components/stat/quickCategorySelection'

describe('resolveQuickCategorySelection', () => {
  it('filters both type reports for a mixed category', () => {
    expect(resolveQuickCategorySelection({
      categoryId: 'cards',
      hasExpense: true,
      hasIncome: true,
      isSelected: false,
    })).toEqual({
      combined: ['cards'],
      expense: ['cards'],
      income: ['cards'],
    })
  })

  it('leaves the opposite report unfiltered for a single-type category', () => {
    expect(resolveQuickCategorySelection({
      categoryId: 'food',
      hasExpense: true,
      hasIncome: false,
      isSelected: false,
    })).toEqual({
      combined: ['food'],
      expense: ['food'],
      income: [],
    })
  })

  it('filters only income for an income-only category', () => {
    expect(resolveQuickCategorySelection({
      categoryId: 'salary',
      hasExpense: false,
      hasIncome: true,
      isSelected: false,
    })).toEqual({
      combined: ['salary'],
      expense: [],
      income: ['salary'],
    })
  })

  it('clears every report when the active category is toggled', () => {
    expect(resolveQuickCategorySelection({
      categoryId: 'food',
      hasExpense: true,
      hasIncome: false,
      isSelected: true,
    })).toEqual({
      combined: [],
      expense: [],
      income: [],
    })
  })
})
