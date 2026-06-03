import type { Row } from '~~/services/powersync/transforms'

import { describe, expect, it } from 'vitest'

import { reconcileTrns, rowsToTrns } from '~/components/trns/reconcile'

function expenseRow(id: string, updatedAt: number | null, amount = 100): Row {
  return {
    amount,
    categoryId: 'food',
    date: 1700000000000,
    id,
    type: 0,
    updatedAt,
    walletId: 'cash',
  }
}

describe('rowsToTrns', () => {
  it('returns null for an empty snapshot', () => {
    expect(rowsToTrns([])).toBeNull()
  })

  it('builds a map keyed by id', () => {
    const map = rowsToTrns([expenseRow('a', 1), expenseRow('b', 2)])
    expect(Object.keys(map ?? {})).toEqual(['a', 'b'])
    expect(map?.a).toMatchObject({ amount: 100 })
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
    expect(next?.b).toMatchObject({ amount: 999, updatedAt: 3 })
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

  it('suppresses rows with a null updatedAt (read deterministically as 0)', () => {
    const prev = rowsToTrns([expenseRow('a', null)])!
    // null updatedAt reads back as a stable 0 (transforms.ts), so it matches.
    const next = reconcileTrns(prev, [expenseRow('a', null)])
    expect(next).toBe(prev)
  })
})
