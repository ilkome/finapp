import { describe, expect, it } from 'vitest'

import { applyManualRates, convert } from './convert'

const scales: Record<string, number> = { BTC: 8, JPY: 0, PTS: 0, RUB: 2, USD: 2, XP: 3 }
const scaleOf = (code: string) => scales[code]!

describe('applyManualRates', () => {
  const rates = { RUB: 100, USD: 1 }

  it('prices a custom currency through its rate currency, chained', () => {
    const result = applyManualRates(rates, { PTS: { currencyCode: 'RUB', rate: 2 }, XP: { currencyCode: 'PTS', rate: 10 } })
    expect(result.PTS).toBe(50)
    expect(result.XP).toBe(5)
  })

  it('overrides a market rate and drops chains that loop or end without a rate', () => {
    const result = applyManualRates(rates, { A: { currencyCode: 'B', rate: 1 }, B: { currencyCode: 'A', rate: 1 }, C: { currencyCode: 'NONE', rate: 1 }, RUB: { currencyCode: 'USD', rate: 0.02 } })
    expect(result.RUB).toBe(50)
    expect(result).not.toHaveProperty('A')
    expect(result).not.toHaveProperty('C')
  })

  it('returns the same table without manual rates', () => {
    expect(applyManualRates(rates, {})).toBe(rates)
  })
})

describe('convert', () => {
  const rates = { BTC: 0.00001, JPY: 150, RUB: 100, USD: 1 }

  it('converts minor units across scales, unrounded', () => {
    expect(convert(10000, 'USD', 'RUB', rates, scaleOf)).toBe(1000000)
    expect(convert(100, 'USD', 'JPY', rates, scaleOf)).toBe(150)
    expect(convert(100000, 'RUB', 'BTC', rates, scaleOf)).toBeCloseTo(10000)
  })

  it('is undefined for a currency without a rate', () => {
    expect(convert(100, 'USD', 'EUR', rates, scaleOf)).toBeUndefined()
    expect(convert(100, 'EUR', 'EUR', rates, scaleOf)).toBe(100)
  })
})
