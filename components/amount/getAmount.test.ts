import { describe, expect, it } from 'vitest'
import { getAmountInRate } from '~/components/amount/getTotal'
import { ratesBasedOnUsd as rates } from '~/mocks/rates'

describe('Get amount', () => {
  it('Get amount in same rate as base rate', () => {
    const amountInBaseRate = getAmountInRate({
      amount: 40,
      currencyCode: 'USD',
      rates,
      baseCurrencyCode: 'USD',
    })

    expect(amountInBaseRate).toEqual(40)
  })

  it('Get amount in RUB when base rate is USD', () => {
    const amountInBaseRate = getAmountInRate({
      amount: 70,
      currencyCode: 'RUB',
      rates,
      baseCurrencyCode: 'USD',
    })

    expect(amountInBaseRate).toEqual(1.0810810810810811)
  })

  it('Get amount in RUB when base rate is EUR', () => {
    const amountInBaseRate = getAmountInRate({
      amount: 70,
      currencyCode: 'RUB',
      rates,
      baseCurrencyCode: 'EUR',
    })

    expect(amountInBaseRate).toEqual(1.0383135135135135)
  })
})
