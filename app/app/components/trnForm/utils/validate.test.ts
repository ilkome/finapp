import { describe, expect, it } from 'vitest'

import type { TrnItem } from '~/components/trns/types'

import { validate } from '~/components/trnForm/utils/validate'

const day = 1699920000000

const expense: TrnItem = { categoryId: 'food', createdAt: 1, date: day, fromAmount: 100, fromWalletId: 'w1', type: 'expense', updatedAt: 1 }
const transfer: TrnItem = { createdAt: 1, date: day, fromAmount: 100, fromWalletId: 'w1', toAmount: 100, toWalletId: 'w2', type: 'transfer', updatedAt: 1 }

describe('validate', () => {
  it('returns null for a valid expense', () => {
    expect(validate(expense)).toBeNull()
  })

  it('returns amountEmpty when amount is 0', () => {
    expect(validate({ ...expense, fromAmount: 0 })).toBe('trnForm.errors.amountEmpty')
  })

  it('returns selectWallet when the wallet is missing', () => {
    expect(validate({ ...expense, fromAmount: undefined, fromWalletId: undefined })).toBe('trnForm.errors.selectWallet')
  })

  it('returns selectCategory when the category is missing', () => {
    expect(validate({ ...expense, categoryId: undefined })).toBe('trnForm.errors.selectCategory')
  })

  it('returns null for a valid transfer', () => {
    expect(validate(transfer)).toBeNull()
  })

  it('accepts a transfer with one side outside the app', () => {
    expect(validate({ ...transfer, fromAmount: undefined, fromWalletId: undefined })).toBeNull()
  })

  it('refuses a transfer with both sides outside the app', () => {
    expect(validate({ createdAt: 1, date: day, type: 'transfer', updatedAt: 1 })).toBe('trnForm.errors.selectWallet')
  })

  it('returns transferSameWallet when wallets are the same', () => {
    expect(validate({ ...transfer, toWalletId: 'w1' })).toBe('trnForm.errors.transferSameWallet')
  })

  it('returns transferAmountEmpty when transfer amount is 0', () => {
    expect(validate({ ...transfer, fromAmount: 0 })).toBe('trnForm.errors.transferAmountEmpty')
  })
})
