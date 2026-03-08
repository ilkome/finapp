import { describe, expect, it } from 'vitest'

import { AMOUNT_MAX, CREDIT_LIMIT_MAX, DATE_MAX, DATE_MIN, validateNumberRange, validateStringLength } from './shared'

describe('convex/shared validators', () => {
  describe('validateStringLength', () => {
    it('does nothing for undefined', () => {
      expect(() => validateStringLength(undefined, 10, 'Test')).not.toThrow()
    })

    it('does nothing for string within limit', () => {
      expect(() => validateStringLength('hello', 10, 'Test')).not.toThrow()
    })

    it('does nothing for string at exact limit', () => {
      expect(() => validateStringLength('a'.repeat(100), 100, 'Name')).not.toThrow()
    })

    it('throws for string exceeding limit', () => {
      expect(() => validateStringLength('a'.repeat(101), 100, 'Name'))
        .toThrow('Name must be at most 100 characters')
    })

    it('throws with correct field name', () => {
      expect(() => validateStringLength('too long', 5, 'Description'))
        .toThrow('Description must be at most 5 characters')
    })
  })

  describe('validateNumberRange', () => {
    it('does nothing for undefined', () => {
      expect(() => validateNumberRange(undefined, 0, 100, 'Amount')).not.toThrow()
    })

    it('does nothing for value within range', () => {
      expect(() => validateNumberRange(50, 0, 100, 'Amount')).not.toThrow()
    })

    it('does nothing for value at boundaries', () => {
      expect(() => validateNumberRange(0, 0, 100, 'Amount')).not.toThrow()
      expect(() => validateNumberRange(100, 0, 100, 'Amount')).not.toThrow()
    })

    it('throws for value below min', () => {
      expect(() => validateNumberRange(-1, 0, 100, 'Amount'))
        .toThrow('Amount must be between 0 and 100')
    })

    it('throws for value above max', () => {
      expect(() => validateNumberRange(101, 0, 100, 'Amount'))
        .toThrow('Amount must be between 0 and 100')
    })
  })

  describe('constants', () => {
    it('DATE_MIN is 2000-01-01', () => {
      expect(new Date(DATE_MIN).toISOString()).toBe('2000-01-01T00:00:00.000Z')
    })

    it('DATE_MAX is 2100-01-01', () => {
      expect(new Date(DATE_MAX).toISOString()).toBe('2100-01-01T00:00:00.000Z')
    })

    it('AMOUNT_MAX is 1 trillion', () => {
      expect(AMOUNT_MAX).toBe(1_000_000_000_000)
    })

    it('CREDIT_LIMIT_MAX is 1 billion', () => {
      expect(CREDIT_LIMIT_MAX).toBe(1_000_000_000)
    })
  })
})
