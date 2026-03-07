import { describe, expect, it } from 'vitest'

import { createExpressionString, evaluateExpression, formatInput } from '~/components/trnForm/utils/calculate'

describe('calculator utils', () => {
  describe('evaluateExpression', () => {
    it('basic arithmetic', () => {
      expect(evaluateExpression('2+2')).toBe(4)
      expect(evaluateExpression('10-5')).toBe(5)
      expect(evaluateExpression('4*3')).toBe(12)
      expect(evaluateExpression('15/3')).toBe(5)
    })

    it('operator precedence: * and / before + and -', () => {
      expect(evaluateExpression('2+3*4')).toBe(14)
      expect(evaluateExpression('10-6/2')).toBe(7)
      expect(evaluateExpression('2*3+4*5')).toBe(26)
      expect(evaluateExpression('100/10+5*2')).toBe(20)
    })

    it('chained operations', () => {
      expect(evaluateExpression('1+2+3+4')).toBe(10)
      expect(evaluateExpression('100-20-30')).toBe(50)
      expect(evaluateExpression('2*3*4')).toBe(24)
      expect(evaluateExpression('100/2/5')).toBe(10)
    })

    it('decimal numbers', () => {
      expect(evaluateExpression('1.5+2.5')).toBe(4)
      expect(evaluateExpression('10.5*2')).toBe(21)
      expect(evaluateExpression('7.5/2.5')).toBe(3)
      expect(evaluateExpression('0.1+0.2')).toBeCloseTo(0.3)
    })

    it('strips spaces and commas', () => {
      expect(evaluateExpression('2 + 2')).toBe(4)
      expect(evaluateExpression('1,000+500')).toBe(1500)
      expect(evaluateExpression('1 000 + 2 000')).toBe(3000)
    })

    it('trailing operator is ignored', () => {
      expect(evaluateExpression('5+')).toBe(5)
      expect(evaluateExpression('10-')).toBe(10)
      expect(evaluateExpression('3*')).toBe(3)
      expect(evaluateExpression('8/')).toBe(8)
    })

    it('returns absolute value (negative results become positive)', () => {
      expect(evaluateExpression('5-10')).toBe(5)
      expect(evaluateExpression('1-100')).toBe(99)
    })

    it('division by zero returns 0 (Infinity is not finite)', () => {
      expect(evaluateExpression('10/0')).toBe(0)
    })

    it('returns 0 for empty or invalid input', () => {
      expect(evaluateExpression('')).toBe(0)
      expect(evaluateExpression('abc')).toBe(0)
      expect(evaluateExpression('invalid')).toBe(0)
    })

    it('returns 0 for results exceeding MAX_SAFE_INTEGER', () => {
      expect(evaluateExpression('9007199254740992*2')).toBe(0)
    })

    it('single number', () => {
      expect(evaluateExpression('42')).toBe(42)
      expect(evaluateExpression('0')).toBe(0)
      expect(evaluateExpression('0.5')).toBe(0.5)
    })

    it('safely ignores code injection attempts (no eval)', () => {
      // Parser reads numbers/operators only — non-numeric chars stop parsing
      expect(evaluateExpression('alert(1)')).toBe(0) // no digits before alpha
      expect(evaluateExpression('constructor')).toBe(0)
      // '1;alert(1)' → parser reads '1', stops at ';', returns 1 (code never executes)
      expect(evaluateExpression('1;alert(1)')).toBe(1)
    })
  })

  describe('createExpressionString', () => {
    describe('backspace (c)', () => {
      it('removes last character', () => {
        expect(createExpressionString('c', '123')).toBe('12')
        expect(createExpressionString('c', '12')).toBe('1')
      })

      it('removes operator', () => {
        expect(createExpressionString('c', '12+')).toBe('12')
        expect(createExpressionString('c', '5*')).toBe('5')
      })

      it('removes decimal point', () => {
        expect(createExpressionString('c', '12.')).toBe('12')
      })

      it('stays at 0 when expression is 0', () => {
        expect(createExpressionString('c', '0')).toBe('0')
      })

      it('returns 0 when deleting last digit', () => {
        expect(createExpressionString('c', '5')).toBe('0')
      })
    })

    describe('equals (=)', () => {
      it('evaluates and formats result', () => {
        expect(createExpressionString('=', '2+2')).toBe('4')
        expect(createExpressionString('=', '1000+2000')).toBe('3 000')
        expect(createExpressionString('=', '10.5*2')).toBe('21')
      })

      it('evaluates with trailing operator', () => {
        expect(createExpressionString('=', '5+')).toBe('5')
      })

      it('handles expression with spaces (formatted input)', () => {
        expect(createExpressionString('=', '1 000 + 500')).toBe('1 500')
      })
    })

    describe('decimal point (.)', () => {
      it('adds decimal point to number', () => {
        expect(createExpressionString('.', '123')).toBe('123.')
        expect(createExpressionString('.', '0')).toBe('0.')
      })

      it('does not add second decimal point', () => {
        expect(createExpressionString('.', '12.3')).toBe('12.3')
        expect(createExpressionString('.', '12.')).toBe('12.')
      })

      it('adds 0. after operator', () => {
        expect(createExpressionString('.', '5+')).toBe('5+0.')
        expect(createExpressionString('.', '10*')).toBe('10*0.')
      })

      it('does not add to number that already has decimal', () => {
        expect(createExpressionString('.', '3.14')).toBe('3.14')
      })
    })

    describe('digit input', () => {
      it('replaces initial zero', () => {
        expect(createExpressionString('1', '0')).toBe('1')
        expect(createExpressionString('5', '0')).toBe('5')
        expect(createExpressionString('9', '0')).toBe('9')
      })

      it('keeps zero when typing zero', () => {
        expect(createExpressionString('0', '0')).toBe('0')
      })

      it('appends digit to existing number', () => {
        expect(createExpressionString('3', '12')).toBe('123')
        expect(createExpressionString('0', '12')).toBe('120')
      })

      it('appends digit after operator', () => {
        expect(createExpressionString('5', '12+')).toBe('12+5')
        expect(createExpressionString('3', '100*')).toBe('100*3')
      })

      it('appends digit after decimal', () => {
        expect(createExpressionString('5', '12.')).toBe('12.5')
        expect(createExpressionString('1', '0.')).toBe('0.1')
      })

      it('respects decimal places limit (8)', () => {
        expect(createExpressionString('9', '1.12345678')).toBe('1.12345678')
        expect(createExpressionString('3', '1.12')).toBe('1.123')
      })

      it('respects integer length limit (999)', () => {
        const longNumber = '1'.repeat(999)
        expect(createExpressionString('1', longNumber)).toBe(longNumber)
      })
    })

    describe('operator input', () => {
      it('appends operator after number', () => {
        expect(createExpressionString('+', '5')).toBe('5+')
        expect(createExpressionString('-', '100')).toBe('100-')
        expect(createExpressionString('*', '42')).toBe('42*')
        expect(createExpressionString('/', '99')).toBe('99/')
      })

      it('replaces last operator', () => {
        expect(createExpressionString('+', '123-')).toBe('123+')
        expect(createExpressionString('*', '123+')).toBe('123*')
        expect(createExpressionString('/', '50-')).toBe('50/')
        expect(createExpressionString('-', '10*')).toBe('10-')
      })

      it('adds operator after zero', () => {
        expect(createExpressionString('+', '0')).toBe('0+')
        expect(createExpressionString('-', '0')).toBe('0-')
        expect(createExpressionString('*', '0')).toBe('0*')
      })
    })

    describe('full input sequences', () => {
      it('type 1+2=', () => {
        let expr = '0'
        expr = createExpressionString('1', expr) // '1'
        expr = createExpressionString('+', expr) // '1+'
        expr = createExpressionString('2', expr) // '1+2'
        expr = createExpressionString('=', expr) // '3'
        expect(expr).toBe('3')
      })

      it('type 100*2.5=', () => {
        let expr = '0'
        expr = createExpressionString('1', expr) // '1'
        expr = createExpressionString('0', expr) // '10'
        expr = createExpressionString('0', expr) // '100'
        expr = createExpressionString('*', expr) // '100*'
        expr = createExpressionString('2', expr) // '100*2'
        expr = createExpressionString('.', expr) // '100*2.'
        expr = createExpressionString('5', expr) // '100*2.5'
        expr = createExpressionString('=', expr) // '250'
        expect(expr).toBe('250')
      })

      it('type 50 then backspace twice then 3=', () => {
        let expr = '0'
        expr = createExpressionString('5', expr) // '5'
        expr = createExpressionString('0', expr) // '50'
        expr = createExpressionString('c', expr) // '5'
        expr = createExpressionString('c', expr) // '0'
        expr = createExpressionString('3', expr) // '3'
        expect(expr).toBe('3')
      })

      it('type 10+20-5=', () => {
        let expr = '0'
        expr = createExpressionString('1', expr)
        expr = createExpressionString('0', expr)
        expr = createExpressionString('+', expr)
        expr = createExpressionString('2', expr)
        expr = createExpressionString('0', expr)
        expr = createExpressionString('-', expr)
        expr = createExpressionString('5', expr)
        expr = createExpressionString('=', expr)
        expect(expr).toBe('25')
      })

      it('change operator mid-expression: 10+ then * then 2=', () => {
        let expr = '0'
        expr = createExpressionString('1', expr)
        expr = createExpressionString('0', expr)
        expr = createExpressionString('+', expr) // '10+'
        expr = createExpressionString('*', expr) // '10*' (replaced + with *)
        expr = createExpressionString('2', expr) // '10*2'
        expr = createExpressionString('=', expr) // '20'
        expect(expr).toBe('20')
      })

      it('decimal workflow: 0.5+1.5=', () => {
        let expr = '0'
        expr = createExpressionString('.', expr) // '0.'
        expr = createExpressionString('5', expr) // '0.5'
        expr = createExpressionString('+', expr) // '0.5+'
        expr = createExpressionString('1', expr) // '0.5+1'
        expr = createExpressionString('.', expr) // '0.5+1.'
        expr = createExpressionString('5', expr) // '0.5+1.5'
        expr = createExpressionString('=', expr) // '2'
        expect(expr).toBe('2')
      })
    })
  })

  describe('formatInput', () => {
    it('adds thousand separators', () => {
      expect(formatInput('1000')).toBe('1 000')
      expect(formatInput('1000000')).toBe('1 000 000')
      expect(formatInput('999999999')).toBe('999 999 999')
    })

    it('no separator for small numbers', () => {
      expect(formatInput('0')).toBe('0')
      expect(formatInput('1')).toBe('1')
      expect(formatInput('100')).toBe('100')
      expect(formatInput('999')).toBe('999')
    })

    it('preserves decimal part', () => {
      expect(formatInput('1000.5')).toBe('1 000.5')
      expect(formatInput('1000000.25')).toBe('1 000 000.25')
      expect(formatInput('0.123')).toBe('0.123')
    })

    it('preserves trailing decimal point', () => {
      expect(formatInput('100.')).toBe('100.')
      expect(formatInput('1000.')).toBe('1 000.')
    })

    it('formats expressions with operators', () => {
      expect(formatInput('1000+2000')).toBe('1 000 + 2 000')
      expect(formatInput('1000.5*2')).toBe('1 000.5 * 2')
      expect(formatInput('500-100')).toBe('500 - 100')
      expect(formatInput('10000/4')).toBe('10 000 / 4')
    })

    it('handles numeric input', () => {
      expect(formatInput(1000)).toBe('1 000')
      expect(formatInput(0)).toBe('0')
      expect(formatInput(42.5)).toBe('42.5')
    })
  })
})
