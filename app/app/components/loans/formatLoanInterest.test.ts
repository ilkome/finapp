import { describe, expect, it } from 'vitest'

import type { TrnFormValuesWithLoan } from '~/components/loans/types'

import { formatLoanInterest } from '~/components/loans/formatLoanInterest'

function values(interest: number) {
  return ({
    amount: [0, 1000, 1000],
    date: 1700000000000,
    loanInterest: { amount: interest, amountRaw: String(interest), isEnabled: true },
    toWalletId: 'credit',
  }) as unknown as TrnFormValuesWithLoan
}

describe('formatLoanInterest', () => {
  it('books the interest as an expense of the credit wallet', () => {
    expect(formatLoanInterest(values(200))).toMatchObject({ categoryId: 'loan_interest', fromAmount: 200, fromWalletId: 'credit', type: 'expense' })
  })

  it('rejects interest above the payment itself', () => {
    expect(formatLoanInterest(values(5000))).toBeUndefined()
  })
})
