import { describe, expect, it } from 'vitest'

import type { TrnFormValues } from '~/components/trns/types'

import { formatTrn } from '~/components/trnForm/utils/formatData'

const values: TrnFormValues = {
  amount: [1000, 2000, 3000],
  amountRaw: ['10', '20', '30'],
  categoryId: 'food',
  date: 86400000,
  fromWalletId: 'from',
  toWalletId: 'to',
  transferType: 'to',
  trnId: 'id',
  trnType: 'expense',
  walletId: 'wallet',
}

function format(over: Partial<TrnFormValues>) {
  const data = formatTrn({ ...values, ...over })
  if (!data)
    return data
  const { createdAt: _c, updatedAt: _u, ...rest } = data
  return rest
}

describe('formatTrn', () => {
  it('builds an expense from its wallet', () => {
    expect(format({})).toEqual({ categoryId: 'food', date: 86400000, fromAmount: 1000, fromWalletId: 'wallet', type: 'expense' })
  })

  it('builds an income into its wallet', () => {
    expect(format({ description: 'Salary', trnType: 'income' })).toEqual({ categoryId: 'food', date: 86400000, description: 'Salary', toAmount: 1000, toWalletId: 'wallet', type: 'income' })
  })

  it('refuses an expense without a category', () => {
    expect(format({ categoryId: null })).toBe(false)
  })

  it('builds a transfer with both sides', () => {
    expect(format({ trnType: 'transfer' })).toEqual({ date: 86400000, fromAmount: 2000, fromWalletId: 'from', toAmount: 3000, toWalletId: 'to', type: 'transfer' })
  })

  it('leaves the outside side of a transfer empty', () => {
    expect(format({ transferOutside: 'from', trnType: 'transfer' })).toEqual({ date: 86400000, toAmount: 3000, toWalletId: 'to', type: 'transfer' })
  })

  it('refuses a transfer without wallets', () => {
    expect(format({ fromWalletId: null, toWalletId: null, trnType: 'transfer' })).toBe(false)
  })

  it('keeps an adjustment on its side and drops the category', () => {
    expect(format({ trnType: 'adjustment' })).toEqual({ date: 86400000, toAmount: 1000, toWalletId: 'wallet', type: 'adjustment' })
    expect(format({ transferType: 'from', trnType: 'adjustment' })).toEqual({ date: 86400000, fromAmount: 1000, fromWalletId: 'wallet', type: 'adjustment' })
  })
})
