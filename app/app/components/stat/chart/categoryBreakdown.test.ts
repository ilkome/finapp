import { describe, expect, it } from 'vitest'

import type { Categories, CategoryId } from '~/components/categories/types'
import type { IntervalData } from '~/components/stat/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import {
  aggregateCategoryTotals,
  buildCategoriesPieData,
  buildCategoriesSeries,
} from '~/components/stat/chart/categoryBreakdown'

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
    return [id, { color: `#00000${i}`, icon: `lucide:circle-${i}`, name: `Cat ${i + 1}` }]
  }),
) as unknown as Categories

function computeTotalForTrnsIds(ids: TrnId[]) {
  const expense = ids.reduce((acc, id) => acc + (amounts[id] ?? 0), 0)
  return { expense, income: 0, net: -expense }
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
      net: 0,
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

  it('drops categories in excludedCategoriesIds', () => {
    const { categoryTotals, orderedCategoryIds } = aggregateCategoryTotals({
      ...baseParams,
      excludedCategoriesIds: new Set(['c01', 'c03']),
      intervals: singleInterval(allTrnIds),
    })

    expect(orderedCategoryIds).not.toContain('c01')
    expect(orderedCategoryIds).not.toContain('c03')
    expect(categoryTotals.c01).toBeUndefined()
    expect(categoryTotals.c03).toBeUndefined()
    expect(categoryTotals.c02).toBe(90)
  })

  it('uses net income for categories in the combined mode', () => {
    const cardsTrnsItems = {
      expense: { categoryId: 'cards' },
      foodExpense: { categoryId: 'food' },
      income: { categoryId: 'cards' },
    } as unknown as Record<TrnId, Pick<TrnItem, 'categoryId'>>
    const computeCardsTotal = (ids: TrnId[]) => {
      const expense = (ids.includes('expense') ? 1290 : 0) + (ids.includes('foodExpense') ? 10000 : 0)
      const income = ids.includes('income') ? 6711 : 0
      return { expense, income, net: income - expense }
    }
    const intervals = singleInterval(['expense', 'foodExpense', 'income'])

    const series = buildCategoriesSeries({
      categoriesItems: {
        cards: { color: '#00ff00', icon: 'lucide:wallet-cards', name: 'Cards' },
        food: { color: '#ff0000', icon: 'lucide:utensils', name: 'Food' },
      } as unknown as Categories,
      chartType: 'bar',
      computeTotalForTrnsIds: computeCardsTotal,
      intervals,
      isGrouped: false,
      trnsItems: cardsTrnsItems,
      type: 'net',
    })

    expect(series).toHaveLength(2)
    expect(series.find(item => item.name === 'Cards')).toMatchObject({ data: [5421] })
    expect(series.find(item => item.name === 'Food')).toMatchObject({ data: [10000], valueTypes: ['expense'] })
  })
})

describe('buildCategoriesPieData', () => {
  it('groups categories after the largest five into one silent donut slice', () => {
    const pie = buildCategoriesPieData({
      ...baseParams,
      intervals: singleInterval(allTrnIds),
    })

    expect(pie).toHaveLength(6)
    expect(pie.map(s => s.value)).toEqual([100, 90, 80, 70, 60, 150])
  })

  it('uses the category color for each slice', () => {
    const pie = buildCategoriesPieData({
      ...baseParams,
      intervals: singleInterval(['t01']),
    })

    expect(pie[0]).toEqual({ color: '#000000', value: 100 })
  })

  it('highlights five categories and uses one gray remainder in both chart views', () => {
    const intervals = singleInterval(allTrnIds)
    const expectedColors = [
      '#000000',
      '#000001',
      '#000002',
      '#000003',
      '#000004',
      'var(--ui-text-dimmed)',
    ]

    const pie = buildCategoriesPieData({ ...baseParams, intervals })
    const series = buildCategoriesSeries({ ...baseParams, chartType: 'bar', intervals })

    expect(pie.map(item => item.color)).toEqual(expectedColors)
    expect(series.map(item => item.color)).toEqual(expectedColors)
  })

  it('uses one top five for the range and groups every remaining value as Other', () => {
    const intervals = [
      singleInterval(['t01', 't02', 't03', 't04', 't05', 't06'])[0]!,
      singleInterval(['t05', 't06', 't07', 't08', 't09', 't10'])[0]!,
    ]
    const series = buildCategoriesSeries({
      ...baseParams,
      chartType: 'bar',
      intervals,
      otherName: 'Other',
    })
    const other = series.find(item => item.name === 'Other')

    expect(series.filter(item => item.name !== 'Other' && item.data[0]! > 0)).toHaveLength(5)
    expect(series.filter(item => item.name !== 'Other' && item.data[1]! > 0)).toHaveLength(2)
    expect(series.find(item => item.name === 'Cat 1')?.icon).toBe('lucide:circle-0')
    expect(other?.icon).toBe('lucide:ellipsis')
    expect(other?.data).toEqual([70, 100])
  })

  it('matches the bar series totals (single source of truth)', () => {
    const intervals = singleInterval(allTrnIds)

    const series = buildCategoriesSeries({ ...baseParams, chartType: 'bar', intervals })
    const barTotal = series.reduce(
      (acc, s) => acc + s.data.reduce((a, v) => a + v, 0),
      0,
    )

    const pie = buildCategoriesPieData({ ...baseParams, intervals })
    const pieTotal = pie.reduce((acc, s) => acc + s.value, 0)

    expect(pieTotal).toBe(barTotal)
  })

  it('respects the category filter', () => {
    const pie = buildCategoriesPieData({
      ...baseParams,
      filterCategoriesIds: ['c01', 'c02'] as CategoryId[],
      intervals: singleInterval(allTrnIds),
    })

    expect(pie.map(s => s.value)).toEqual([100, 90])
  })
})
