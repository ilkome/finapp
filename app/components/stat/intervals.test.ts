import { describe, expect, it } from 'vitest'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { Range } from '~/components/date/types'
import type { TrnItem } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'

import { bucketTrnsByIntervals, computeAverageTotal, isPeriodOneDay } from './intervals'

const zeroTotal: TotalReturns = {
  adjustment: 0,
  expense: 0,
  expenseTransfers: 0,
  income: 0,
  incomeTransfers: 0,
  sum: 0,
  sumTransfers: 0,
}

function makeTotal(income: number, expense: number): TotalReturns {
  return { ...zeroTotal, expense, income, sum: income - expense }
}

function makeTrn(date: number, type: TrnType = TrnType.Expense): TrnItem {
  return {
    amount: 100,
    categoryId: 'food',
    date,
    type,
    updatedAt: date,
    walletId: 'w1',
  } as TrnItem
}

// --- bucketTrnsByIntervals ---

describe('bucketTrnsByIntervals', () => {
  const day1Start = new Date('2024-01-01').getTime()
  const day1End = new Date('2024-01-01T23:59:59.999').getTime()
  const day2Start = new Date('2024-01-02').getTime()
  const day2End = new Date('2024-01-02T23:59:59.999').getTime()
  const day3Start = new Date('2024-01-03').getTime()
  const day3End = new Date('2024-01-03T23:59:59.999').getTime()

  const intervals: Range[] = [
    { end: day1End, start: day1Start },
    { end: day2End, start: day2Start },
    { end: day3End, start: day3Start },
  ]

  it('buckets transactions into correct intervals', () => {
    const trnsItems: Record<string, TrnItem> = {
      t1: makeTrn(day1Start + 1000),
      t2: makeTrn(day2Start + 5000),
      t3: makeTrn(day1Start + 2000),
    }

    const result = bucketTrnsByIntervals(
      trnsItems,
      ['t1', 't2', 't3'],
      intervals,
      ids => makeTotal(0, ids.length * 100),
    )

    expect(result).toHaveLength(3)
    expect(result[0]!.trnsIds).toEqual(['t1', 't3'])
    expect(result[1]!.trnsIds).toEqual(['t2'])
    expect(result[2]!.trnsIds).toEqual([])
  })

  it('computes totals via callback', () => {
    const trnsItems: Record<string, TrnItem> = {
      t1: makeTrn(day1Start),
      t2: makeTrn(day1Start + 1000),
    }

    const result = bucketTrnsByIntervals(
      trnsItems,
      ['t1', 't2'],
      intervals,
      ids => makeTotal(ids.length * 500, 0),
    )

    expect(result[0]!.total.income).toBe(1000)
    expect(result[0]!.total.sum).toBe(1000)
    expect(result[1]!.total.income).toBe(0)
  })

  it('returns empty array for empty intervals', () => {
    const result = bucketTrnsByIntervals({}, ['t1'], [], () => zeroTotal)
    expect(result).toEqual([])
  })

  it('skips transactions without date', () => {
    const trnsItems: Record<string, TrnItem> = {
      t1: { amount: 100, categoryId: 'food', type: TrnType.Expense, updatedAt: 0, walletId: 'w1' } as TrnItem,
    }

    const result = bucketTrnsByIntervals(trnsItems, ['t1'], intervals, () => zeroTotal)
    expect(result[0]!.trnsIds).toEqual([])
  })

  it('skips transactions outside any interval', () => {
    const beforeRange = day1Start - 100000
    const afterRange = day3End + 100000
    const trnsItems: Record<string, TrnItem> = {
      t1: makeTrn(beforeRange),
      t2: makeTrn(afterRange),
      t3: makeTrn(day2Start),
    }

    const result = bucketTrnsByIntervals(trnsItems, ['t1', 't2', 't3'], intervals, ids => makeTotal(0, ids.length))
    expect(result[0]!.trnsIds).toEqual([])
    expect(result[1]!.trnsIds).toEqual(['t3'])
    expect(result[2]!.trnsIds).toEqual([])
  })

  it('skips missing transaction IDs', () => {
    const result = bucketTrnsByIntervals({}, ['missing'], intervals, () => zeroTotal)
    expect(result[0]!.trnsIds).toEqual([])
  })

  it('preserves range references in output', () => {
    const result = bucketTrnsByIntervals({}, [], intervals, () => zeroTotal)
    expect(result[0]!.range).toBe(intervals[0])
    expect(result[2]!.range).toBe(intervals[2])
  })
})

// --- computeAverageTotal ---

describe('computeAverageTotal', () => {
  it('returns undefined for single-day range', () => {
    const range: Range = {
      end: new Date('2024-01-01T23:59:59').getTime(),
      start: new Date('2024-01-01').getTime(),
    }
    expect(computeAverageTotal(1000, range)).toBeUndefined()
  })

  it('computes daily average for multi-day range', () => {
    const range: Range = {
      end: new Date('2024-01-10').getTime(),
      start: new Date('2024-01-01').getTime(),
    }
    const result = computeAverageTotal(1000, range)
    expect(result).toBeDefined()
    expect(result!.day).toBeCloseTo(1000 / 10) // 9 days diff + 1
  })

  it('computes weekly average for multi-week range', () => {
    const range: Range = {
      end: new Date('2024-01-22').getTime(),
      start: new Date('2024-01-01').getTime(),
    }
    const result = computeAverageTotal(2100, range)
    expect(result!.week).toBeDefined()
    expect(result!.week).toBeCloseTo(2100 / 4) // 3 weeks diff + 1
  })

  it('computes monthly average for multi-month range', () => {
    const range: Range = {
      end: new Date('2024-04-01').getTime(),
      start: new Date('2024-01-01').getTime(),
    }
    const result = computeAverageTotal(3000, range)
    expect(result!.month).toBeCloseTo(3000 / 4) // 3 months diff + 1
  })

  it('omits zero averages', () => {
    const range: Range = {
      end: new Date('2024-01-03').getTime(),
      start: new Date('2024-01-01').getTime(),
    }
    const result = computeAverageTotal(0, range)
    expect(result).toBeUndefined()
  })

  it('handles negative sums', () => {
    const range: Range = {
      end: new Date('2024-01-10').getTime(),
      start: new Date('2024-01-01').getTime(),
    }
    const result = computeAverageTotal(-500, range)
    expect(result!.day).toBeCloseTo(-50)
  })
})

// --- isPeriodOneDay ---

describe('isPeriodOneDay', () => {
  it('returns true for rangeBy=day with duration=1', () => {
    expect(isPeriodOneDay({ intervalsBy: 'month', intervalSelected: -1, rangeBy: 'day', rangeDuration: 1 })).toBe(true)
  })

  it('returns true for intervalsBy=day with selected interval', () => {
    expect(isPeriodOneDay({ intervalsBy: 'day', intervalSelected: 3, rangeBy: 'month', rangeDuration: 1 })).toBe(true)
  })

  it('returns false for multi-day range without day interval selected', () => {
    expect(isPeriodOneDay({ intervalsBy: 'month', intervalSelected: -1, rangeBy: 'day', rangeDuration: 7 })).toBe(false)
  })

  it('returns false for week range', () => {
    expect(isPeriodOneDay({ intervalsBy: 'week', intervalSelected: -1, rangeBy: 'week', rangeDuration: 1 })).toBe(false)
  })
})
