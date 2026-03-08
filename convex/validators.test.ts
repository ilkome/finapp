import { describe, expect, it } from 'vitest'

import { TrnType, walletTypes } from './validators'

describe('convex/validators', () => {
  describe('walletTypes', () => {
    it('contains all expected wallet types', () => {
      expect(walletTypes).toEqual(['cash', 'credit', 'cashless', 'deposit', 'crypto', 'debt'])
    })

    it('is readonly', () => {
      expect(Object.isFrozen(walletTypes)).toBe(true)
    })
  })

  describe('TrnType enum', () => {
    it('has correct numeric values', () => {
      expect(TrnType.Expense).toBe(0)
      expect(TrnType.Income).toBe(1)
      expect(TrnType.Transfer).toBe(2)
    })

    it('has reverse mapping', () => {
      expect(TrnType[0]).toBe('Expense')
      expect(TrnType[1]).toBe('Income')
      expect(TrnType[2]).toBe('Transfer')
    })
  })
})
