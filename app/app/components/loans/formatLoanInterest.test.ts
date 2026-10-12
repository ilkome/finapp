import { describe, expect, it } from 'vitest'

import type { TrnFormValuesWithLoan } from '~/components/loans/types'

import { formatLoanInterest } from '~/components/loans/formatLoanInterest'

function values(interest: number) {
  return ({
    amount: [0, 1000, 1000],
    date: 1700000000000,
    incomeWalletId: 'credit',
    loanInterest: { amount: interest, amountRaw: String(interest), isEnabled: true },
  }) as unknown as TrnFormValuesWithLoan
}

describe('formatLoanInterest', () => {
  it('books the interest as an expense of the credit wallet', () => {
    expect(formatLoanInterest(values(200))).toMatchObject({ amount: 200, categoryId: 'loanInterest', walletId: 'credit' })
  })

  it('rejects interest above the payment itself', () => {
    expect(formatLoanInterest(values(5000))).toBeUndefined()
  })
})
