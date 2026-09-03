import { describe, expect, it } from 'vitest'
import { trnToRow } from '~~/services/powersync/transforms'

import type { TrnItem, Trns } from '~/components/trns/types'

import { buildHistoryBulkEdit } from '~/components/trns/history/bulkEdits'
import { TrnType } from '~/components/trns/types'

const day = Date.UTC(2026, 8, 3)

function expense(overrides: Partial<TrnItem> = {}): TrnItem {
  return {
    amount: 100,
    categoryId: 'food',
    date: day,
    desc: 'Old',
    enteredAt: 5,
    type: TrnType.Expense,
    updatedAt: 1,
    walletId: 'cash',
    ...overrides,
  } as TrnItem
}

const transfer: TrnItem = {
  categoryId: 'transfer',
  date: day,
  expenseAmount: 100,
  expenseWalletId: 'cash',
  incomeAmount: 100,
  incomeWalletId: 'card',
  type: TrnType.Transfer,
  updatedAt: 1,
}

function build(items: Trns, action: Parameters<typeof buildHistoryBulkEdit>[0]['action']) {
  return buildHistoryBulkEdit({
    action,
    ids: Object.keys(items),
    isCategoryTransactible: id => ['adjustment', 'food', 'travel'].includes(id),
    items,
    now: 99,
  })
}

describe('buildHistoryBulkEdit', () => {
  it('sets one trimmed description and timestamp across the batch', () => {
    const result = build({ a: expense(), b: expense({ desc: 'Other' }) }, { type: 'setDescription', value: '  Shared  ' })

    expect(result.changedIds).toEqual(['a', 'b'])
    expect(result.values.a).toMatchObject({ desc: 'Shared', enteredAt: 5, updatedAt: 99 })
    expect(result.values.b).toMatchObject({ desc: 'Shared', updatedAt: 99 })
  })

  it('removes descriptions without changing other transaction fields', () => {
    const result = build({ a: expense() }, { type: 'clearDescription' })

    expect(result.values.a).not.toHaveProperty('desc')
    expect(result.values.a).toMatchObject({ amount: 100, categoryId: 'food', updatedAt: 99, walletId: 'cash' })
    expect(trnToRow(result.values.a!, 'u1').desc).toBeNull()
  })

  it('does not write rows whose value already matches', () => {
    const result = build({ a: expense({ desc: 'Same' }) }, { type: 'setDescription', value: 'Same' })

    expect(result.changedIds).toEqual([])
    expect(result.unchangedIds).toEqual(['a'])
    expect(result.values).toEqual({})
  })

  it('skips transfers when changing category', () => {
    const result = build({ a: expense(), b: transfer }, { type: 'setCategory', value: 'travel' })

    expect(result.changedIds).toEqual(['a'])
    expect(result.values.a?.categoryId).toBe('travel')
    expect(result.ineligible).toEqual([{ id: 'b', reason: 'transfer' }])
  })

  it('rejects non-civil dates', () => {
    expect(() => build({ a: expense() }, { type: 'setDate', value: day + 1 })).toThrow('civil day')
  })
})
