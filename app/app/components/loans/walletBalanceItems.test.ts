import { describe, expect, it } from 'vitest'

import { walletBalanceItems } from './walletBalanceItems'

const t = (key: string) => key

describe('walletBalanceItems', () => {
  it('returns a single balance item for a non-credit wallet', () => {
    expect(walletBalanceItems({ creditLimit: 0, hasLoan: false, isCredit: false, t, total: 100 })).toEqual([
      { amount: 100, title: 'money.balance' },
    ])
  })

  it('returns debt/available/limit for a credit wallet without a loan', () => {
    expect(walletBalanceItems({ creditLimit: 500, hasLoan: false, isCredit: true, t, total: -200 })).toEqual([
      { amount: -200, title: 'wallets.form.credit.debt' },
      { amount: 300, title: 'wallets.form.credit.available' },
      { amount: 500, title: 'wallets.form.credit.limit' },
    ])
  })

  it('returns a single debt item for a credit wallet with a loan', () => {
    expect(walletBalanceItems({ creditLimit: 500, hasLoan: true, isCredit: true, t, total: -200 })).toEqual([
      { amount: -200, title: 'wallets.form.credit.debt' },
    ])
  })
})
