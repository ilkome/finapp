import { describe, expect, it } from 'vitest'

import { buildTrnsDisplayRows } from '~/components/trns/listRows'
import { TrnType } from '~/components/trns/types'

const day = 24 * 60 * 60 * 1000
const firstDay = Date.UTC(2026, 0, 1, 12)
const secondDay = firstDay - day

describe('buildTrnsDisplayRows', () => {
  it('keeps transaction order and groups adjacent transactions by day', () => {
    const rows = buildTrnsDisplayRows(['a', 'b', 'c'], {
      a: { amount: 10, categoryId: 'expense', date: firstDay, type: TrnType.Expense, updatedAt: 1, walletId: 'wallet' },
      b: { amount: 20, categoryId: 'income', date: firstDay + 1000, type: TrnType.Income, updatedAt: 1, walletId: 'wallet' },
      c: { amount: 30, categoryId: 'expense', date: secondDay, type: TrnType.Expense, updatedAt: 1, walletId: 'wallet' },
    })

    expect(rows).toEqual([
      { date: Date.UTC(2026, 0, 1), id: `date:${Date.UTC(2026, 0, 1)}`, trnsIds: ['a', 'b'], type: 'dateHeader' },
      { id: 'trn:a', trnId: 'a', type: 'transaction' },
      { id: 'trn:b', trnId: 'b', type: 'transaction' },
      { date: Date.UTC(2025, 11, 31), id: `date:${Date.UTC(2025, 11, 31)}`, trnsIds: ['c'], type: 'dateHeader' },
      { id: 'trn:c', trnId: 'c', type: 'transaction' },
    ])
  })

  it('skips missing transaction items', () => {
    const rows = buildTrnsDisplayRows(['missing', 'a'], {
      a: { amount: 10, categoryId: 'expense', date: firstDay, type: TrnType.Expense, updatedAt: 1, walletId: 'wallet' },
    })

    expect(rows).toEqual([
      { date: Date.UTC(2026, 0, 1), id: `date:${Date.UTC(2026, 0, 1)}`, trnsIds: ['a'], type: 'dateHeader' },
      { id: 'trn:a', trnId: 'a', type: 'transaction' },
    ])
  })

  it('uses an id prefix for stable virtual-period keys', () => {
    const rows = buildTrnsDisplayRows(['a'], {
      a: { amount: 10, categoryId: 'expense', date: firstDay, type: TrnType.Expense, updatedAt: 1, walletId: 'wallet' },
    }, { idPrefix: '2-' })

    expect(rows.map(row => row.id)).toEqual([`date:2-${Date.UTC(2026, 0, 1)}`, 'trn:2-a'])
  })
})
