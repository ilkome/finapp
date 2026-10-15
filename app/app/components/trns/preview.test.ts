import { describe, expect, it } from 'vitest'

import { getTransferRate, getTrnConversions } from '~/components/trns/preview'

const rates = { EUR: 0.5, RUB: 100, USD: 1 }
const ratesOnDate = { EUR: 0.8, RUB: 50, USD: 1 }

describe('getTrnConversions', () => {
  it('lists base first, then other wallet currencies, without the own currency', () => {
    const rows = getTrnConversions({ amount: 10, base: 'RUB', currency: 'USD', rates, ratesOnDate, walletCurrencies: ['USD', 'EUR', 'RUB'] })
    expect(rows).toEqual([
      { currency: 'RUB', now: 1000, onDate: 500 },
      { currency: 'EUR', now: 5, onDate: 8 },
    ])
  })

  it('leaves out a missing rate instead of converting at 1:1', () => {
    const rows = getTrnConversions({ amount: 10, base: 'USD', currency: 'USD', rates, ratesOnDate: null, walletCurrencies: ['GEL', 'EUR'] })
    expect(rows).toEqual([{ currency: 'EUR', now: 5, onDate: undefined }])
  })

  it('is empty when every wallet shares the transaction currency', () => {
    expect(getTrnConversions({ amount: 10, base: 'USD', currency: 'USD', rates, ratesOnDate, walletCurrencies: ['USD'] })).toEqual([])
  })
})

describe('getTransferRate', () => {
  it('compares the transfer rate with the market today and on the day', () => {
    expect(getTransferRate({ expenseAmount: 100, expenseCurrency: 'USD', incomeAmount: 9000, incomeCurrency: 'RUB', rates, ratesOnDate }))
      .toEqual({ from: 'USD', now: 100, onDate: 50, to: 'RUB', transfer: 90 })
  })

  it('is null within one currency', () => {
    expect(getTransferRate({ expenseAmount: 1, expenseCurrency: 'USD', incomeAmount: 1, incomeCurrency: 'USD', rates, ratesOnDate })).toBeNull()
  })
})
