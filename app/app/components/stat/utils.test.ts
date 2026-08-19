import { describe, expect, it } from 'vitest'

import { getSelectedType, getSelectedTypeForSum, getSortedFilterWalletsIds, getTypesMapping, getTypesToShow } from '~/components/stat/utils'
import { TrnType } from '~/components/trns/types'

describe('getTypesMapping', () => {
  it('includes transfers in the combined view so the transaction list can show them', () => {
    expect(getTypesMapping('combined')).toEqual([TrnType.Expense, TrnType.Income, TrnType.Transfer])
    expect(getTypesMapping('netIncome')).toEqual([TrnType.Expense, TrnType.Income, TrnType.Transfer])
  })

  it('keeps expense/income views pure (no transfers)', () => {
    expect(getTypesMapping('expense')).toEqual([TrnType.Expense])
    expect(getTypesMapping('income')).toEqual([TrnType.Income])
  })
})

describe('getSelectedType', () => {
  it('returns filteredType for the combined report', () => {
    expect(getSelectedType('combined', 'expense', 'income')).toBe('expense')
    expect(getSelectedType('combined', 'netIncome', undefined)).toBe('netIncome')
  })

  it('returns statTab for expense/income tabs', () => {
    expect(getSelectedType('expense', 'netIncome', 'income')).toBe('expense')
    expect(getSelectedType('income', 'expense', undefined)).toBe('income')
  })
})

describe('getSelectedTypeForSum', () => {
  it('returns summary for the combined report', () => {
    expect(getSelectedTypeForSum('combined', 'expense')).toBe('summary')
  })

  it('returns statTab for expense/income tabs', () => {
    expect(getSelectedTypeForSum('expense', 'income')).toBe('expense')
    expect(getSelectedTypeForSum('income', undefined)).toBe('income')
  })
})

describe('getTypesToShow', () => {
  it('returns both types for combined+netIncome', () => {
    expect(getTypesToShow('combined', 'netIncome', undefined)).toEqual(['income', 'expense'])
  })

  it('returns single type for combined+income', () => {
    expect(getTypesToShow('combined', 'income', undefined)).toEqual(['income'])
  })

  it('returns single type for combined+expense', () => {
    expect(getTypesToShow('combined', 'expense', undefined)).toEqual(['expense'])
  })

  it('returns statTab for expense tab', () => {
    expect(getTypesToShow('expense', 'netIncome', 'income')).toEqual(['expense'])
  })

  it('returns statTab for income tab', () => {
    expect(getTypesToShow('income', 'netIncome', undefined)).toEqual(['income'])
  })
})

describe('getSortedFilterWalletsIds', () => {
  it('shows filtered wallets past the configured count', () => {
    expect(getSortedFilterWalletsIds(['w5'], ['w1', 'w2', 'w3', 'w4', 'w5'], true, 2)).toEqual(['w1', 'w2', 'w5'])
  })

  it('shows only the top N when nothing is filtered', () => {
    expect(getSortedFilterWalletsIds([], ['w1', 'w2', 'w3'], true, 2)).toEqual(['w1', 'w2'])
  })

  it('falls back to the filtered ids when the section is hidden', () => {
    expect(getSortedFilterWalletsIds(['w3'], ['w1', 'w2', 'w3'], false, 2)).toEqual(['w3'])
  })
})
