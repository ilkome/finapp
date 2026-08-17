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
    const rows = buildStatVirtualRows({
      baseOffset: 1,
      canLoadMore: false,
      items: { transaction },
      periods: [
        { ids: ['transaction'], offset: 1 },
        { ids: ['transaction'], offset: 2 },
      ],
    })

    expect(rows.filter(row => row.type === 'transaction')).toEqual([
      { id: 'trn:transaction', offset: 1, trnId: 'transaction', type: 'transaction' },
    ])
  })

  it('keeps a transaction key stable when its period changes', () => {
    const first = buildStatVirtualRows({
      baseOffset: 1,
      canLoadMore: false,
      items: { transaction },
      periods: [{ ids: ['transaction'], offset: 1 }],
    })
    const moved = buildStatVirtualRows({
      baseOffset: 2,
      canLoadMore: false,
      items: { transaction },
      periods: [{ ids: ['transaction'], offset: 2 }],
    })
    expect(first.find(row => row.type === 'transaction')?.id).toBe('trn:transaction')
    expect(moved.find(row => row.type === 'transaction')?.id).toBe('trn:transaction')
  })

  it('adds one divider before the first historical transaction group', () => {
    const items = {
      current: { ...transaction, date: rangeForOffset(0).end },
      historical: { ...transaction, date: rangeForOffset(2).end },
      older: { ...transaction, date: rangeForOffset(4).end },
    }
    const rows = buildStatVirtualRows({
      baseOffset: 0,
      canLoadMore: false,
      items,
      periods: [
        { ids: ['current'], offset: 0 },
        { ids: ['historical'], offset: 2 },
        { ids: ['older'], offset: 4 },
      ],
    })

    const dividerIndex = rows.findIndex(row => row.type === 'historyDivider')
    expect(rows.filter(row => row.type === 'historyDivider')).toEqual([
      { id: 'feed:history-divider', offset: 2, type: 'historyDivider' },
    ])
    expect(rows[dividerIndex + 1]).toMatchObject({ offset: 2, type: 'dateHeader' })
    expect(rows[dividerIndex + 2]).toEqual({ id: 'trn:historical', offset: 2, trnId: 'historical', type: 'transaction' })
  })

  it('shows the divider when the base period is empty but history is available', () => {
    const rows = buildStatVirtualRows({
      baseOffset: 0,
      canLoadMore: false,
      items: { transaction },
      periods: [
        { ids: [], offset: 0 },
        { ids: ['transaction'], offset: 2 },
      ],
    })

    expect(rows.find(row => row.type === 'historyDivider')).toEqual({
      id: 'feed:history-divider',
      offset: 2,
      type: 'historyDivider',
    })
  })

  it('does not show a divider without visible historical transactions', () => {
    const rows = buildStatVirtualRows({
      baseOffset: 1,
      canLoadMore: false,
      items: { transaction },
      periods: [
        { ids: ['transaction'], offset: 1 },
        { ids: ['transaction'], offset: 2 },
      ],
    })

    expect(rows.some(row => row.type === 'historyDivider')).toBe(false)
  })
})
