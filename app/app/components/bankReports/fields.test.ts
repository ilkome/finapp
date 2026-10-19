import { describe, expect, it } from 'vitest'

import { reportErrors } from '~/components/bankReports/fields'

describe('reportErrors', () => {
  it('points at a negative card or loan figure, never at a negative bank balance', () => {
    expect(reportErrors({ balanceAmount: -100, balanceDate: 0, minPaymentAmount: -1 })).toEqual({ minPaymentAmount: 'negative' })
  })

  it('asks for the other half of the balance pair', () => {
    expect(reportErrors({ balanceAmount: 100 })).toEqual({ balanceDate: 'required' })
    expect(reportErrors({ balanceDate: 0 })).toEqual({ balanceAmount: 'required' })
    expect(reportErrors({})).toEqual({})
  })
})
