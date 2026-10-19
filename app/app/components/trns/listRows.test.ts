import { describe, expect, it } from 'vitest'

import { buildTrnsDisplayRows } from '~/components/trns/listRows'

const day = 24 * 60 * 60 * 1000
const firstDay = Date.UTC(2026, 0, 1, 12)
const secondDay = firstDay - day

describe('buildTrnsDisplayRows', () => {
  it('keeps transaction order and groups adjacent transactions by day', () => {
    const rows = buildTrnsDisplayRows(['a', 'b', 'c'], {
      a: { categoryId: 'expense', createdAt: 1, date: firstDay, fromAmount: 10, fromWalletId: 'wallet', type: 'expense', updatedAt: 1 },
      b: { categoryId: 'income', createdAt: 1, date: firstDay + 1000, fromAmount: 20, fromWalletId: 'wallet', type: 'expense', updatedAt: 1 },
      c: { categoryId: 'expense', createdAt: 1, date: secondDay, fromAmount: 30, fromWalletId: 'wallet', type: 'expense', updatedAt: 1 },
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
      a: { categoryId: 'expense', createdAt: 1, date: firstDay, fromAmount: 10, fromWalletId: 'wallet', type: 'expense', updatedAt: 1 },
    })

    expect(rows).toEqual([
      { date: Date.UTC(2026, 0, 1), id: `date:${Date.UTC(2026, 0, 1)}`, trnsIds: ['a'], type: 'dateHeader' },
      { id: 'trn:a', trnId: 'a', type: 'transaction' },
    ])
  })

  it('uses an id prefix for stable virtual-period keys', () => {
    const rows = buildTrnsDisplayRows(['a'], {
      a: { categoryId: 'expense', createdAt: 1, date: firstDay, fromAmount: 10, fromWalletId: 'wallet', type: 'expense', updatedAt: 1 },
    }, { idPrefix: '2-' })

    expect(rows.map(row => row.id)).toEqual([`date:2-${Date.UTC(2026, 0, 1)}`, 'trn:2-a'])
  })
})
