import { describe, expect, it } from 'vitest'

import { currencyMinorUnit } from '~/components/currencies/currencies'

describe('currencyMinorUnit', () => {
  it('takes ISO minor units for fiat and the list precision for crypto', () => {
    expect(currencyMinorUnit('RUB')).toBe(2)
    expect(currencyMinorUnit('JPY')).toBe(0)
    expect(currencyMinorUnit('BTC')).toBe(8)
    expect(currencyMinorUnit(undefined)).toBe(2)
  })
})
