import { describe, expect, it } from 'vitest'
import { trnToRow } from '~~/services/powersync/transforms'

import type { TrnItem, Trns } from '~/components/trns/types'

import { buildTrnsBulkEdit, buildTrnsBulkEdits } from '~/components/trns/bulkEdits'

const day = Date.UTC(2026, 8, 3)

function expense(overrides: Partial<TrnItem> = {}): TrnItem {
  return {
    categoryId: 'food',
    createdAt: 5,
    date: day,
    description: 'Old',
    fromAmount: 100,
    fromWalletId: 'cash',
    type: 'expense',
    updatedAt: 1,
    ...overrides,
  }
}

const transfer: TrnItem = {
  createdAt: 1,
  date: day,
  fromAmount: 100,
  fromWalletId: 'cash',
  toAmount: 100,
  toWalletId: 'card',
  type: 'transfer',
  updatedAt: 1,
}

function build(items: Trns, action: Parameters<typeof buildTrnsBulkEdit>[0]['action']) {
  return buildTrnsBulkEdit({
    action,
    ids: Object.keys(items),
    isCategoryTransactible: id => ['adjustment', 'food', 'travel'].includes(id),
    isWalletSelectable: id => ['card', 'cash'].includes(id),
    items,
    now: 99,
  })
}

describe('buildTrnsBulkEdit', () => {
  it('sets one trimmed description and timestamp across the batch', () => {
    const result = build({ a: expense(), b: expense({ description: 'Other' }) }, { type: 'setDescription', value: '  Shared  ' })

    expect(result.changedIds).toEqual(['a', 'b'])
    expect(result.values.a).toMatchObject({ createdAt: 5, description: 'Shared', updatedAt: 99 })
    expect(result.values.b).toMatchObject({ description: 'Shared', updatedAt: 99 })
  })

  it('removes descriptions without changing other transaction fields', () => {
    const result = build({ a: expense() }, { type: 'clearDescription' })

    expect(result.values.a).not.toHaveProperty('description')
    expect(result.values.a).toMatchObject({ categoryId: 'food', fromAmount: 100, fromWalletId: 'cash', updatedAt: 99 })
    expect(trnToRow(result.values.a!, 'u1').description).toBeNull()
  })

  it('does not write rows whose value already matches', () => {
    const result = build({ a: expense({ description: 'Same' }) }, { type: 'setDescription', value: 'Same' })

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

  it('changes wallets for regular transactions and skips transfers', () => {
    const result = build({ a: expense(), b: transfer }, { type: 'setWallet', value: 'card' })

    expect(result.changedIds).toEqual(['a'])
    expect(result.values.a?.fromWalletId).toBe('card')
    expect(result.ineligible).toEqual([{ id: 'b', reason: 'transfer' }])
  })

  it('rejects a wallet that is unavailable for selection', () => {
    const result = build({ a: expense() }, { type: 'setWallet', value: 'missing' })

    expect(result.changedIds).toEqual([])
    expect(result.ineligible).toEqual([{ id: 'a', reason: 'invalidWallet' }])
  })

  it('moves an adjustment to another wallet on its own side and keeps it out of categories', () => {
    const adjustment: TrnItem = { createdAt: 1, date: day, toAmount: 100, toWalletId: 'cash', type: 'adjustment', updatedAt: 1 }

    expect(build({ a: adjustment }, { type: 'setWallet', value: 'card' }).values.a).toMatchObject({ toWalletId: 'card' })
    expect(build({ a: adjustment }, { type: 'setCategory', value: 'food' }).ineligible).toEqual([{ id: 'a', reason: 'transfer' }])
  })

  it('rejects non-civil dates', () => {
    expect(() => build({ a: expense() }, { type: 'setDate', value: day + 1 })).toThrow('civil day')
  })
})

describe('buildTrnsBulkEdits', () => {
  it('merges several staged actions into one value per transaction', () => {
    const result = buildTrnsBulkEdits({
      actions: [
        { type: 'setDescription', value: 'Trip' },
        { type: 'setCategory', value: 'travel' },
        { type: 'setWallet', value: 'card' },
      ],
      ids: ['a', 'b'],
      isCategoryTransactible: id => ['adjustment', 'food', 'travel'].includes(id),
      isWalletSelectable: id => ['card', 'cash'].includes(id),
      items: { a: expense(), b: transfer },
      now: 99,
    })

    expect(result.changedIds).toEqual(['a', 'b'])
    expect(result.values.a).toMatchObject({ categoryId: 'travel', description: 'Trip', fromWalletId: 'card', updatedAt: 99 })
    // The transfer takes the description but is skipped by category and wallet.
    expect(result.values.b).toMatchObject({ description: 'Trip', type: 'transfer' })
    expect(result.ineligible).toEqual([{ id: 'b', reason: 'transfer' }, { id: 'b', reason: 'transfer' }])
  })

  it('reports transactions no action changed', () => {
    const result = buildTrnsBulkEdits({
      actions: [{ type: 'setDescription', value: 'Old' }],
      ids: ['a'],
      isCategoryTransactible: () => true,
      isWalletSelectable: () => true,
      items: { a: expense() },
      now: 99,
    })

    expect(result.changedIds).toEqual([])
    expect(result.unchangedIds).toEqual(['a'])
  })
})
