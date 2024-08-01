import { describe, expect, it } from 'vitest'
import { getAmountInRate } from '~/components/amount/getTotal'
import { ratesBasedOnUsd as rates } from '~/mocks/rates'

describe('get amount', () => {
  it('get amount in same rate as base rate', () => {
    const amountInBaseRate = getAmountInRate({
      amount: 40,
      baseCurrencyCode: 'USD',
      currencyCode: 'USD',
      rates,
    })

    expect(amountInBaseRate).toEqual(40)
  })

  it('get amount in RUB when base rate is USD', () => {
    const amountInBaseRate = getAmountInRate({
      amount: 70,
      baseCurrencyCode: 'USD',
      currencyCode: 'RUB',
      rates,
    })

    expect(amountInBaseRate).toEqual(1.0810810810810811)
  })

  it('get amount in RUB when base rate is EUR', () => {
    const amountInBaseRate = getAmountInRate({
      amount: 70,
      baseCurrencyCode: 'EUR',
      currencyCode: 'RUB',
      rates,
    })

    expect(amountInBaseRate).toEqual(1.0383135135135135)
  })
})
