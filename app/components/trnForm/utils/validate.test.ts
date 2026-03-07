import { describe, expect, it } from 'vitest'

import { validate } from '~/components/trnForm/utils/validate'
import { TrnType } from '~/components/trns/types'

const now = Date.now()

const validTransaction = {
  amount: 100,
  categoryId: 'food',
  date: now,
  type: TrnType.Expense,
  updatedAt: now,
  walletId: 'w1',
}

const validTransfer = {
  categoryId: 'transfer' as const,
  date: now,
  expenseAmount: 100,
  expenseWalletId: 'w1',
  incomeAmount: 100,
  incomeWalletId: 'w2',
  type: TrnType.Transfer,
  updatedAt: now,
}

describe('validate', () => {
  it('returns null for valid transaction', () => {
    expect(validate(validTransaction)).toBeNull()
  })

  it('returns amountEmpty when amount is 0', () => {
    expect(validate({ ...validTransaction, amount: 0 })).toBe('trnForm.errors.amountEmpty')
  })

  it('returns selectWallet when walletId is empty', () => {
    expect(validate({ ...validTransaction, walletId: '' })).toBe('trnForm.errors.selectWallet')
  })

  it('returns selectCategory when categoryId is empty', () => {
    expect(validate({ ...validTransaction, categoryId: '' })).toBe('trnForm.errors.selectCategory')
  })

  it('returns null for valid transfer', () => {
    expect(validate(validTransfer)).toBeNull()
  })

  it('returns transferSameWallet when wallets are the same', () => {
    expect(validate({ ...validTransfer, incomeWalletId: 'w1' })).toBe('trnForm.errors.transferSameWallet')
  })

  it('returns transferAmountEmpty when transfer amount is 0', () => {
    expect(validate({ ...validTransfer, expenseAmount: 0 })).toBe('trnForm.errors.transferAmountEmpty')
  })
})
