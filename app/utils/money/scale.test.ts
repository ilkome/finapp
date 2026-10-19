import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { currencies } from '~/components/currencies/currencies'

import { CURRENCY_SCALES, currencyScale, formatMinor, fromMinor, MAX_SCALE, toMinor } from './scale'

describe('currency scales', () => {
  it('covers every currency of the list', () => {
    expect(currencies.map(c => c.code).filter(code => CURRENCY_SCALES[code] === undefined)).toEqual([])
  })

  it('keeps a million whole units of every currency within 2^53 minor units', () => {
    for (const scale of [...Object.values(CURRENCY_SCALES), MAX_SCALE])
      expect(10 ** 6 * 10 ** scale).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER)
  })

  it('freezes the scales the stored amounts were written with', () => {
    expect([CURRENCY_SCALES.USD, CURRENCY_SCALES.RUB, CURRENCY_SCALES.JPY, CURRENCY_SCALES.KWD, CURRENCY_SCALES.BTC, CURRENCY_SCALES.ETH, CURRENCY_SCALES.USDT])
      .toEqual([2, 2, 0, 3, 8, 9, 6])
  })

  it('matches the VALUES list of the data-model migration', () => {
    const sql = readFileSync(new URL('../../supabase/migrations/20261019120000_data_model.sql', import.meta.url), 'utf8')
    const pairs = Object.fromEntries([...sql.matchAll(/\('([A-Z0-9]+)', (\d)\)/g)].map(m => [m[1], Number(m[2])]))
    expect(pairs).toEqual(CURRENCY_SCALES)
  })

  it('takes custom scales and refuses unknown codes', () => {
    expect(currencyScale('ABC', { ABC: 4 })).toBe(4)
    expect(currencyScale('USD', { USD: 5 })).toBe(2)
    expect(() => currencyScale('ABC')).toThrow()
  })
})

describe('minor units', () => {
  it('rounds once, without float noise', () => {
    expect(toMinor(1.005, 2)).toBe(101)
    expect(toMinor(0.1 + 0.2, 2)).toBe(30)
    expect(toMinor(0.00000001, 8)).toBe(1)
    expect(toMinor(-12.345, 2)).toBe(-1234)
    expect(fromMinor(12345, 2)).toBe(123.45)
  })

  it('formats by minor display', () => {
    expect(formatMinor(150000, 2, { locale: 'en-US' })).toBe('1,500')
    expect(formatMinor(150050, 2, { locale: 'en-US', symbol: '$' })).toBe('1,500.50 $')
    expect(formatMinor(150000, 2, { locale: 'en-US', minorDisplay: 'always' })).toBe('1,500.00')
    expect(formatMinor(150050, 2, { locale: 'en-US', minorDisplay: 'never' })).toBe('1,501')
  })
})
