import { describe, expect, it } from 'vitest'

import type { Categories, CategoryId } from '~/components/categories/types'
import type { IntervalData } from '~/components/stat/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import {
  aggregateCategoryTotals,
  buildCategoriesPieData,
  buildCategoriesSeries,
  OTHER_SLICE_ID,
} from '~/components/stat/chart/useCategorySeriesBuilder'

// Each trn maps 1:1 to a category with a fixed expense amount.
const amounts: Record<TrnId, number> = {
  t01: 100,
  t02: 90,
  t03: 80,
  t04: 70,
  t05: 60,
  t06: 50,
  t07: 40,
  t08: 30,
  t09: 20,
  t10: 10,
  tTransfer: 999,
}

const trnsItems: Record<TrnId, Pick<TrnItem, 'categoryId'>> = {
  t01: { categoryId: 'c01' },
  t02: { categoryId: 'c02' },
  t03: { categoryId: 'c03' },
  t04: { categoryId: 'c04' },
  t05: { categoryId: 'c05' },
  t06: { categoryId: 'c06' },
  t07: { categoryId: 'c07' },
  t08: { categoryId: 'c08' },
  t09: { categoryId: 'c09' },
  t10: { categoryId: 'c10' },
  tTransfer: { categoryId: 'transfer' },
}

const categoriesItems: Categories = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => {
    const id = `c${String(i + 1).padStart(2, '0')}`
    return [id, { color: `#00000${i}`, name: `Cat ${i + 1}` }]
  }),
) as unknown as Categories

function computeTotalForTrnsIds(ids: TrnId[]) {
  const expense = ids.reduce((acc, id) => acc + (amounts[id] ?? 0), 0)
  return { expense, income: 0, sum: -expense }
}

/** All non-transfer trns inside a single interval. */
function singleInterval(trnIds: TrnId[]): IntervalData[] {
  return [{
    range: { end: 1, start: 0 },
    total: {
      adjustment: 0,
      expense: 0,
      expenseTransfers: 0,
      income: 0,
      incomeTransfers: 0,
      sum: 0,
      sumTransfers: 0,
    },
    trnsIds: trnIds,
  }]
}

const baseParams = {
  categoriesItems,
  computeTotalForTrnsIds,
  isGrouped: false,
  trnsItems,
  type: 'expense' as const,
}

const allTrnIds: TrnId[] = Object.keys(amounts)

describe('aggregateCategoryTotals', () => {
  it('sorts categories by total descending and excludes transfers', () => {
    const { categoryTotals, orderedCategoryIds } = aggregateCategoryTotals({
      ...baseParams,
      intervals: singleInterval(allTrnIds),
    })

    expect(orderedCategoryIds).toEqual([
      'c01',
      'c02',
      'c03',
      'c04',
      'c05',
      'c06',
      'c07',
      'c08',
      'c09',
      'c10',
    ])
    expect(orderedCategoryIds).not.toContain('transfer')
    expect(categoryTotals.c01).toBe(100)
    expect(categoryTotals.transfer).toBeUndefined()
  })
})

describe('buildCategoriesPieData', () => {
  it('keeps top-N slices and rolls the rest into a single Other slice', () => {
    const pie = buildCategoriesPieData({
      ...baseParams,
      intervals: singleInterval(allTrnIds),
      topN: 8,
    }, 'Other')

    expect(pie).toHaveLength(9)
    expect(pie.slice(0, 8).map(s => s.id)).toEqual([
      'c01',
      'c02',
      'c03',
      'c04',
      'c05',
      'c06',
      'c07',
      'c08',
    ])

    const other = pie.at(-1)!
    expect(other.id).toBe(OTHER_SLICE_ID)
    expect(other.isOther).toBe(true)
    expect(other.name).toBe('Other')
    expect(other.value).toBe(30) // c09 (20) + c10 (10)
  })

  it('omits the Other slice when categories fit within top-N', () => {
    const pie = buildCategoriesPieData({
      ...baseParams,
      intervals: singleInterval(['t01', 't02', 't03']),
      topN: 8,
    }, 'Other')

    expect(pie).toHaveLength(3)
    expect(pie.some(s => s.isOther)).toBe(false)
  })

  it('uses the category color and name for each slice', () => {
    const pie = buildCategoriesPieData({
      ...baseParams,
      intervals: singleInterval(['t01']),
      topN: 8,
    }, 'Other')

    expect(pie[0]).toMatchObject({ color: '#000000', id: 'c01', name: 'Cat 1', value: 100 })
  })

  it('matches the bar series totals (single source of truth)', () => {
    const intervals = singleInterval(allTrnIds)

    const series = buildCategoriesSeries({ ...baseParams, chartType: 'bar', intervals })
    const barTotal = series.reduce(
      (acc, s) => acc + s.data.reduce((a, v) => a + v, 0),
      0,
    )

    const pie = buildCategoriesPieData({ ...baseParams, intervals, topN: 8 }, 'Other')
    const pieTotal = pie.reduce((acc, s) => acc + s.value, 0)

    expect(pieTotal).toBe(barTotal)
  })

  it('respects the category filter', () => {
    const pie = buildCategoriesPieData({
      ...baseParams,
      filterCategoriesIds: ['c01', 'c02'] as CategoryId[],
      intervals: singleInterval(allTrnIds),
      topN: 8,
    }, 'Other')

    expect(pie.map(s => s.id)).toEqual(['c01', 'c02'])
  })
})
