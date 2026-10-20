import { describe, expect, it } from 'vitest'

import { formatRate, matchesCurrency, orderCurrencies } from '~/components/currencies/utils'

describe('orderCurrencies', () => {
  it('puts wallet currencies first by count then total, then own ones, then the rest by code', () => {
    const wallets = { EUR: { count: 1, total: 500 }, RUB: { count: 3, total: 10 }, USD: { count: 1, total: 900 } }
    expect(orderCurrencies(['AUD', 'EUR', 'PTS', 'RUB', 'USD', 'BTC', 'PTS'], wallets, new Set(['PTS', 'BTC'])))
      .toEqual(['RUB', 'USD', 'EUR', 'BTC', 'PTS', 'AUD'])
  })
})

describe('matchesCurrency', () => {
  it('matches code or name, ignoring case', () => {
    expect(matchesCurrency('dol', 'USD', 'US Dollar')).toBe(true)
    expect(matchesCurrency(' usd', 'USD', 'Доллар')).toBe(true)
    expect(matchesCurrency('eur', 'USD', 'US Dollar')).toBe(false)
    expect(matchesCurrency('', 'USD', 'US Dollar')).toBe(true)
  })
})

describe('formatRate', () => {
  it('keeps more decimals the smaller the rate', () => {
    expect(formatRate(95.123)).toBe('95.12')
    expect(formatRate(0.5)).toBe('0.5000')
    expect(formatRate(0.000123)).toBe('0.000123')
  })
})
