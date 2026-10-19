import { describe, expect, it } from 'vitest'

import { getTransferRate, getTrnConversions } from '~/components/trns/preview'

const rates = { EUR: 0.5, RUB: 100, USD: 1 }
const ratesOnDate = { EUR: 0.8, RUB: 50, USD: 1 }

describe('getTrnConversions', () => {
  it('lists base first, then other wallet currencies, without the own currency', () => {
    const rows = getTrnConversions({ amount: 1000, base: 'RUB', currency: 'USD', rates, ratesOnDate, walletCurrencies: ['USD', 'EUR', 'RUB'] })
    expect(rows).toEqual([
      { currency: 'RUB', now: 100000, onDate: 50000 },
      { currency: 'EUR', now: 500, onDate: 800 },
    ])
  })

  it('leaves out a missing rate instead of converting at 1:1', () => {
    const rows = getTrnConversions({ amount: 1000, base: 'USD', currency: 'USD', rates, ratesOnDate: null, walletCurrencies: ['GEL', 'EUR'] })
    expect(rows).toEqual([{ currency: 'EUR', now: 500, onDate: undefined }])
  })

  it('is empty when every wallet shares the transaction currency', () => {
    expect(getTrnConversions({ amount: 1000, base: 'USD', currency: 'USD', rates, ratesOnDate, walletCurrencies: ['USD'] })).toEqual([])
  })
})

describe('getTransferRate', () => {
  it('compares the transfer rate with the market today and on the day', () => {
    expect(getTransferRate({ fromAmount: 10000, fromCurrency: 'USD', rates, ratesOnDate, toAmount: 900000, toCurrency: 'RUB' }))
      .toEqual({ from: 'USD', now: 100, onDate: 50, to: 'RUB', transfer: 90 })
  })

  it('scales minor units of currencies with different decimals', () => {
    expect(getTransferRate({ fromAmount: 100, fromCurrency: 'USD', rates: { JPY: 150, USD: 1 }, ratesOnDate: null, toAmount: 150, toCurrency: 'JPY' }))
      .toEqual({ from: 'USD', now: 150, onDate: undefined, to: 'JPY', transfer: 150 })
  })

  it('is null within one currency', () => {
    expect(getTransferRate({ fromAmount: 1, fromCurrency: 'USD', rates, ratesOnDate, toAmount: 1, toCurrency: 'USD' })).toBeNull()
  })
})
