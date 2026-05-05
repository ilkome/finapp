import { describe, expect, it } from 'vitest'

import { getSelectedType, getSelectedTypeForSum, getTypesToShow } from '~/components/stat/utils'

describe('getSelectedType', () => {
  it('returns filteredType for summary tab', () => {
    expect(getSelectedType('summary', 'expense', 'income')).toBe('expense')
    expect(getSelectedType('summary', 'netIncome', undefined)).toBe('netIncome')
  })

  it('returns type for split tab', () => {
    expect(getSelectedType('split', 'netIncome', 'expense')).toBe('expense')
  })

  it('falls back to filteredType for split when type is undefined', () => {
    expect(getSelectedType('split', 'income', undefined)).toBe('income')
  })

  it('returns statTab for expense/income tabs', () => {
    expect(getSelectedType('expense', 'netIncome', 'income')).toBe('expense')
    expect(getSelectedType('income', 'expense', undefined)).toBe('income')
  })
})

describe('getSelectedTypeForSum', () => {
  it('returns summary for summary tab', () => {
    expect(getSelectedTypeForSum('summary', 'expense')).toBe('summary')
  })

  it('returns type for split tab', () => {
    expect(getSelectedTypeForSum('split', 'income')).toBe('income')
  })

  it('returns statTab for expense/income tabs', () => {
    expect(getSelectedTypeForSum('expense', 'income')).toBe('expense')
    expect(getSelectedTypeForSum('income', undefined)).toBe('income')
  })
})

describe('getTypesToShow', () => {
  it('returns both types for summary+netIncome', () => {
    expect(getTypesToShow('summary', 'netIncome', undefined)).toEqual(['income', 'expense'])
  })

  it('returns single type for summary+income', () => {
    expect(getTypesToShow('summary', 'income', undefined)).toEqual(['income'])
  })

  it('returns single type for summary+expense', () => {
    expect(getTypesToShow('summary', 'expense', undefined)).toEqual(['expense'])
  })

  it('returns statTab for expense tab', () => {
    expect(getTypesToShow('expense', 'netIncome', 'income')).toEqual(['expense'])
  })

  it('returns statTab for income tab', () => {
    expect(getTypesToShow('income', 'netIncome', undefined)).toEqual(['income'])
  })

  it('returns type for split tab', () => {
    expect(getTypesToShow('split', 'netIncome', 'expense')).toEqual(['expense'])
  })

  it('falls back to both types for split without type', () => {
    expect(getTypesToShow('split', 'netIncome', undefined)).toEqual(['income', 'expense'])
  })
})
