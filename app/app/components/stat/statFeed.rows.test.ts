import { describe, expect, it } from 'vitest'

import { buildStatVirtualRows } from '~/components/stat/statFeed'
import { TrnType } from '~/components/trns/types'

const periodSize = 100
function rangeForOffset(offset: number) {
  return {
    end: 10_000 - offset * periodSize,
    start: 10_000 - (offset + 1) * periodSize + 1,
  }
}
const transaction = {
  amount: 10,
  categoryId: 'expense',
  date: rangeForOffset(2).start,
  type: TrnType.Expense,
  updatedAt: 1,
  walletId: 'wallet',
} as const

describe('buildStatVirtualRows', () => {
  it('renders a transaction once when materialized ranges overlap', () => {
    const rows = buildStatVirtualRows([
      { ids: ['transaction'], offset: 1 },
      { ids: ['transaction'], offset: 2 },
    ], { transaction }, false)

    expect(rows.filter(row => row.type === 'transaction')).toEqual([
      { id: 'trn:transaction', offset: 1, trnId: 'transaction', type: 'transaction' },
    ])
  })

  it('keeps a transaction key stable when its period changes', () => {
    const first = buildStatVirtualRows([{ ids: ['transaction'], offset: 1 }], { transaction }, false)
    const moved = buildStatVirtualRows([{ ids: ['transaction'], offset: 2 }], { transaction }, false)
    expect(first.find(row => row.type === 'transaction')?.id).toBe('trn:transaction')
    expect(moved.find(row => row.type === 'transaction')?.id).toBe('trn:transaction')
  })
})
