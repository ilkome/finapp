import { describe, expect, it } from 'vitest'

import { buildStatFeedIndex } from '~/components/stat/statFeed'
import { TrnType } from '~/components/trns/types'

const periodSize = 100
function rangeForOffset(offset: number) {
  return {
    end: 10_000 - offset * periodSize,
    start: 10_000 - (offset + 1) * periodSize + 1,
  }
}

function expense(date: number, desc?: string) {
  return {
    amount: 10,
    categoryId: 'expense',
    date,
    ...(desc ? { desc } : {}),
    type: TrnType.Expense,
    updatedAt: 1,
    walletId: 'wallet',
  } as const
}

function build(options: Partial<Parameters<typeof buildStatFeedIndex>[0]> = {}) {
  const items = options.items ?? {
    current: expense(rangeForOffset(0).end),
    historical: expense(rangeForOffset(2).end),
    older: expense(rangeForOffset(4).end),
  }
  return buildStatFeedIndex({
    baseOffset: 0,
    candidateIds: Object.keys(items),
    filter: { filterBy: 'all', showWithDesc: false },
    items,
    minimumDate: 0,
    rangeForOffset,
    searchedThroughOffset: 3,
    ...options,
  })
}

describe('buildStatFeedIndex', () => {
  it('routes sorted transactions in one pass and finds the next historical candidate', () => {
    const result = build()

    expect(result.materializedOffsets).toEqual([0, 2])
    expect(result.idsByOffset.get(0)).toEqual(['current'])
    expect(result.idsByOffset.get(2)).toEqual(['historical'])
    expect(result.nextHistoricalId).toBe('older')
    expect(result.metrics).toEqual({ dateToOffsetLookups: 2, periodRangeCount: 4, routedIds: 2, visitedIds: 3 })
  })

  it('preserves candidate order for transactions with equal dates', () => {
    const date = rangeForOffset(1).end
    const items = { first: expense(date), second: expense(date) }
    const result = build({ candidateIds: ['second', 'first'], items })

    expect(result.idsByOffset.get(1)).toEqual(['second', 'first'])
  })

  it('applies subtype and description filters without a second ID array', () => {
    const date = rangeForOffset(1).end
    const items = {
      expense: expense(date),
      noted: expense(date, 'note'),
      transfer: {
        categoryId: 'transfer' as const,
        date,
        expenseAmount: 10,
        expenseWalletId: 'wallet',
        incomeAmount: 10,
        incomeWalletId: 'wallet-2',
        type: TrnType.Transfer as const,
        updatedAt: 1,
      },
    }

    expect(build({ filter: { filterBy: 'expense', showHistoryWithDesc: true, showWithDesc: false }, items }).idsByOffset.get(1)).toEqual(['noted'])
    expect(build({ filter: { filterBy: 'transfer', showWithDesc: false }, items }).idsByOffset.get(1)).toEqual(['transfer'])
  })

  it('applies description filters independently to the current and previous periods', () => {
    const items = {
      current: expense(rangeForOffset(0).end),
      currentNoted: expense(rangeForOffset(0).start, 'current note'),
      historical: expense(rangeForOffset(2).end),
      historicalNoted: expense(rangeForOffset(2).start, 'history note'),
    }

    const currentOnly = build({
      filter: { filterBy: 'all', showHistoryWithDesc: false, showWithDesc: true },
      items,
      searchedThroughOffset: 2,
    })
    expect(currentOnly.idsByOffset.get(0)).toEqual(['currentNoted'])
    expect(currentOnly.idsByOffset.get(2)).toEqual(['historical', 'historicalNoted'])

    const historyOnly = build({
      filter: { filterBy: 'all', showHistoryWithDesc: true, showWithDesc: false },
      items,
      searchedThroughOffset: 2,
    })
    expect(historyOnly.idsByOffset.get(0)).toEqual(['current', 'currentNoted'])
    expect(historyOnly.idsByOffset.get(2)).toEqual(['historicalNoted'])
  })

  it('materializes a newly matching historical period inside the searched frontier', () => {
    const items = { created: expense(rangeForOffset(3).start) }
    expect(build({ items }).materializedOffsets).toEqual([3])
  })

  it('moves an edited transaction between periods and removes an emptied period', () => {
    const beforeItems = { edited: expense(rangeForOffset(1).end) }
    const afterItems = { edited: expense(rangeForOffset(3).end) }

    expect(build({ items: beforeItems }).materializedOffsets).toEqual([1])
    expect(build({ items: afterItems }).materializedOffsets).toEqual([3])
    expect(build({ candidateIds: [], items: {} }).materializedOffsets).toEqual([])
  })

  it('matches the per-period reference implementation', () => {
    const count = 850
    const items = Object.fromEntries(Array.from({ length: count }, (_, index) => [
      String(index),
      expense(10_000 - index * 3, index % 4 === 0 ? 'note' : undefined),
    ]))
    const candidateIds = Object.keys(items)
    const searchedThroughOffset = 24
    const result = build({ candidateIds, items, searchedThroughOffset })
    const referenceEntries: [number, string[]][] = []
    for (let offset = 0; offset <= searchedThroughOffset; offset++) {
      const range = rangeForOffset(offset)
      const ids = candidateIds.filter(id => items[id]!.date >= range.start && items[id]!.date <= range.end)
      if (ids.length)
        referenceEntries.push([offset, ids])
    }
    const reference = new Map(referenceEntries)

    expect(result.idsByOffset).toEqual(reference)
  })

  it('keeps transaction visits linear for a large history and many periods', () => {
    const count = 10_000
    const items = Object.fromEntries(Array.from({ length: count }, (_, index) => [
      String(index),
      expense(10_000 - index),
    ]))
    const result = build({
      candidateIds: Object.keys(items),
      items,
      minimumDate: -10_000,
      searchedThroughOffset: 149,
    })

    expect(result.metrics.visitedIds).toBe(count)
    expect(result.metrics.dateToOffsetLookups).toBe(count)
    expect(result.metrics.periodRangeCount).toBeLessThanOrEqual(150)
  })
})
