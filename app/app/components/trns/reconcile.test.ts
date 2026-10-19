import type { Row } from '~~/services/powersync/transforms'

import { describe, expect, it } from 'vitest'

import { reconcileRows, reconcileTrns, rowsToTrns } from '~/components/trns/reconcile'

function expenseRow(id: string, updatedAt: number, amount = 100): Row {
  return {
    category_id: 'food',
    created_at: 1,
    date: 1699920000000,
    from_amount: amount,
    from_wallet_id: 'cash',
    id,
    type: 'expense',
    updated_at: updatedAt,
  }
}

describe('rowsToTrns', () => {
  it('returns null for an empty snapshot', () => {
    expect(rowsToTrns([])).toBeNull()
  })

  it('builds a map keyed by id', () => {
    const map = rowsToTrns([expenseRow('a', 1), expenseRow('b', 2)])
    expect(Object.keys(map ?? {})).toEqual(['a', 'b'])
    expect(map?.a).toMatchObject({ fromAmount: 100 })
  })
})

describe('reconcileTrns', () => {
  it('suppresses the echo: returns the same reference when nothing changed', () => {
    const rows = [expenseRow('a', 1), expenseRow('b', 2)]
    const prev = rowsToTrns(rows)!
    // A fresh, content-identical snapshot (e.g. the watch echo of our own write).
    const next = reconcileTrns(prev, [expenseRow('a', 1), expenseRow('b', 2)])
    expect(next).toBe(prev)
  })

  it('reuses unchanged item objects and only rebuilds changed rows', () => {
    const prev = rowsToTrns([expenseRow('a', 1), expenseRow('b', 2)])!
    const next = reconcileTrns(prev, [expenseRow('a', 1), expenseRow('b', 3, 999)])

    expect(next).not.toBe(prev)
    expect(next?.a).toBe(prev.a) // unchanged -> same reference, no rowToTrn
    expect(next?.b).not.toBe(prev.b) // changed -> rebuilt
    expect(next?.b).toMatchObject({ fromAmount: 999, updatedAt: 3 })
  })

  it('handles an added row, reusing existing ones', () => {
    const prev = rowsToTrns([expenseRow('a', 1)])!
    const next = reconcileTrns(prev, [expenseRow('a', 1), expenseRow('b', 2)])

    expect(next).not.toBe(prev)
    expect(next?.a).toBe(prev.a)
    expect(Object.keys(next ?? {})).toEqual(['a', 'b'])
  })

  it('handles a removed row', () => {
    const prev = rowsToTrns([expenseRow('a', 1), expenseRow('b', 2)])!
    const next = reconcileTrns(prev, [expenseRow('a', 1)])

    expect(next).not.toBe(prev)
    expect(next?.a).toBe(prev.a)
    expect(next?.b).toBeUndefined()
  })

  it('returns null when all rows are removed', () => {
    const prev = rowsToTrns([expenseRow('a', 1)])!
    expect(reconcileTrns(prev, [])).toBeNull()
  })
})

describe('reconcileRows', () => {
  const toItem = (row: { id: string, updated_at?: number | null }) => ({ id: row.id, ...(row.updated_at != null ? { updatedAt: row.updated_at } : {}) })

  it('keeps identity when updatedAt is unchanged, including missing timestamps', () => {
    const rows = [{ id: 'a', updated_at: 1 }, { id: 'b', updated_at: null }]
    const prev = reconcileRows(null, rows, toItem)!
    expect(reconcileRows(prev, [{ id: 'a', updated_at: 1 }, { id: 'b', updated_at: null }], toItem)).toBe(prev)
  })

  it('reuses unchanged objects and rebuilds changed ones', () => {
    const prev = reconcileRows(null, [{ id: 'a', updated_at: 1 }, { id: 'b', updated_at: 1 }], toItem)!
    const next = reconcileRows(prev, [{ id: 'a', updated_at: 1 }, { id: 'b', updated_at: 2 }], toItem)!
    expect(next.a).toBe(prev.a)
    expect(next.b).not.toBe(prev.b)
  })
})
