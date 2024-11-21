import { describe, expect, it } from 'vitest'
import { createExpressionString, evaluateExpression, formatInput } from '~/components/trnForm/utils/calculate'

describe('calculator utils', () => {
  describe('evaluateExpression', () => {
    it('should correctly calculate basic expressions', () => {
      expect(evaluateExpression('2+2')).toBe(4)
      expect(evaluateExpression('10-5')).toBe(5)
      expect(evaluateExpression('4*3')).toBe(12)
      expect(evaluateExpression('15/3')).toBe(5)
    })

    it('should handle expressions with spaces', () => {
      expect(evaluateExpression('2 + 2')).toBe(4)
      expect(evaluateExpression('10 - 5')).toBe(5)
    })

    it('should return 0 for numbers larger than MAX_SAFE_INTEGER', () => {
      expect(evaluateExpression('9007199254740992*2')).toBe(0)
    })

    it('should handle empty or invalid input', () => {
      expect(evaluateExpression('')).toBe(0)
      expect(evaluateExpression('invalid')).toBe(0)
    })
  })

  describe('createExpressionString', () => {
    it('should handle special actions', () => {
      expect(createExpressionString('c', '123')).toBe('12')
      expect(createExpressionString('c', '0')).toBe('0')
      expect(createExpressionString('=', '2+2')).toBe('4')
      expect(createExpressionString('.', '123')).toBe('123.')
    })

    it('should handle starting from zero', () => {
      expect(createExpressionString('0', '0')).toBe('0')
      expect(createExpressionString('1', '0')).toBe('1')
      expect(createExpressionString('+', '0')).toBe('0+')
    })

    it('should handle operator changes', () => {
      expect(createExpressionString('+', '123-')).toBe('123+')
      expect(createExpressionString('*', '123+')).toBe('123*')
    })

    it('should respect decimal places limit', () => {
      expect(createExpressionString('3', '1.12')).toBe('1.12')
      expect(createExpressionString('1', '1.1')).toBe('1.11')
    })

    it('should respect integer length limit', () => {
      const longNumber = '1'.repeat(999)
      expect(createExpressionString('1', longNumber)).toBe(longNumber)
    })
  })

  describe('formatInput', () => {
    it('should format numbers with separators', () => {
      expect(formatInput('1000')).toBe('1 000')
      expect(formatInput('1000000')).toBe('1 000 000')
    })

    it('should handle decimal numbers', () => {
      expect(formatInput('1000.5')).toBe('1 000.5')
      expect(formatInput('1000000.25')).toBe('1 000 000.25')
    })

    it('should format expressions with operators', () => {
      expect(formatInput('1000+2000')).toBe('1 000 + 2 000')
      expect(formatInput('1000.5*2')).toBe('1 000.5 * 2')
    })
  })
})
