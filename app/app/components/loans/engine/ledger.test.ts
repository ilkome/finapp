import { describe, expect, it } from 'vitest'

import type { TrnItem } from '~/components/trns/types'

import { collectCreditTrns, costOf } from '~/components/loans/engine/ledger'
import { TrnType } from '~/components/trns/types'

const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)
const credit = new Set(['credit1'])

function expense(over: Partial<TrnItem>): TrnItem {
  return ({ amount: 0, categoryId: 'food', date: day('2026-01-10'), type: TrnType.Expense, updatedAt: 1, walletId: 'cash1', ...over }) as TrnItem
}

function transfer(over: Partial<TrnItem>): TrnItem {
  return ({ categoryId: 'transfer', date: day('2026-01-10'), expenseAmount: 0, expenseWalletId: 'cash1', incomeAmount: 0, incomeWalletId: 'cash1', type: TrnType.Transfer, updatedAt: 1, ...over }) as TrnItem
}

describe('collectCreditTrns', () => {
  it('takes a transfer INTO a credit wallet as a payment and ignores one going out', () => {
    const out = collectCreditTrns({
      out: transfer({ expenseAmount: 300, expenseWalletId: 'credit1', incomeAmount: 300 }),
      repay: transfer({ expenseAmount: 1000, incomeAmount: 1000, incomeWalletId: 'credit1' }),
    }, credit)

    expect(out.get('credit1')).toEqual([{ amount: 1000, date: day('2026-01-10'), id: 'repay', kind: 'payment' }])
    expect(out.has('cash1')).toBe(false)
  })

  it('classifies expenses by their reserved category and skips the rest', () => {
    const out = collectCreditTrns({
      fine: expense({ amount: 30, categoryId: 'loanFine', walletId: 'credit1' }),
      food: expense({ amount: 10, walletId: 'credit1' }),
      interest: expense({ amount: 200, categoryId: 'loanInterest', walletId: 'credit1' }),
      otherWallet: expense({ amount: 70, categoryId: 'loanInterest', walletId: 'cash1' }),
    }, credit)

    expect(out.get('credit1')?.map(t => [t.id, t.kind, t.amount])).toEqual([
      ['fine', 'fine', 30],
      ['interest', 'interest', 200],
    ])
  })

  it('is empty without any credit wallet', () => {
    const out = collectCreditTrns({ repay: transfer({ incomeAmount: 10, incomeWalletId: 'credit1' }) }, new Set())
    expect(out.size).toBe(0)
  })
})

describe('costOf', () => {
  it('buckets interest and fees by civil month and totals them, ignoring payments', () => {
    expect(costOf([
      { amount: 40, date: day('2026-02-02'), id: 'c', kind: 'interest' },
      { amount: 100, date: day('2026-01-05'), id: 'a', kind: 'interest' },
      { amount: 20, date: day('2026-01-09'), id: 'b', kind: 'fine' },
      { amount: 5000, date: day('2026-01-09'), id: 'p', kind: 'payment' },
    ])).toEqual({
      byMonth: [
        { fine: 20, interest: 100, month: day('2026-01-01') },
        { fine: 0, interest: 40, month: day('2026-02-01') },
      ],
      fine: 20,
      interest: 140,
    })
  })

  it('answers zeros for a wallet with no cost', () => {
    expect(costOf([])).toEqual({ byMonth: [], fine: 0, interest: 0 })
  })
})
