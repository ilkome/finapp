import { describe, expect, it } from 'vitest'

import type { Categories } from '~/components/categories/types'
import type { CategoriesWithData } from '~/components/stat/types'

import { collectCategoriesByTrns, flattenCategoriesWithValues, groupCategoriesWithValues, sortCategoriesByAmount } from '~/components/stat/categories/collectAndGroup'

const categories = {
  food: { color: 'red', name: 'Food', parentId: 0 },
  groceries: { color: 'green', name: 'Groceries', parentId: 'food' },
  restaurants: { color: 'blue', name: 'Restaurants', parentId: 'food' },
  salary: { color: 'yellow', name: 'Salary', parentId: 0 },
  transport: { color: 'orange', name: 'Transport', parentId: 0 },
} as unknown as Categories

const trnsItems = {
  t1: { categoryId: 'groceries' },
  t2: { categoryId: 'groceries' },
  t3: { categoryId: 'restaurants' },
  t4: { categoryId: 'salary' },
  t5: { categoryId: 'transport' },
  t6: { categoryId: 'transfer' },
  t7: { categoryId: 'groceries' },
}

describe('collectCategoriesByTrns', () => {
  it('collects categories from transactions', () => {
    const result = collectCategoriesByTrns({
      categoriesItems: categories,
      trnsIds: ['t1', 't2', 't3', 't4', 't5'],
      trnsItems,
    })

    expect(result.groceries!.trnsIds).toEqual(['t1', 't2'])
    expect(result.restaurants!.trnsIds).toEqual(['t3'])
    expect(result.salary!.trnsIds).toEqual(['t4'])
    expect(result.transport!.trnsIds).toEqual(['t5'])
  })

  it('skips transfer category', () => {
    const result = collectCategoriesByTrns({
      categoriesItems: categories,
      trnsIds: ['t6'],
      trnsItems,
    })

    expect(Object.keys(result)).toEqual([])
  })

  it('skips transactions with missing categories', () => {
    const result = collectCategoriesByTrns({
      categoriesItems: categories,
      trnsIds: ['t1'],
      trnsItems: { t1: { categoryId: 'nonexistent' } },
    })

    expect(Object.keys(result)).toEqual([])
  })

  it('skips transactions without categoryId', () => {
    const result = collectCategoriesByTrns({
      categoriesItems: categories,
      trnsIds: ['t1'],
      trnsItems: { t1: {} as any },
    })

    expect(Object.keys(result)).toEqual([])
  })

  it('adds preCategoriesIds even without matching transactions', () => {
    const result = collectCategoriesByTrns({
      categoriesItems: categories,
      preCategoriesIds: ['transport', 'salary'],
      trnsIds: ['t1'],
      trnsItems,
    })

    expect(result.transport).toBeDefined()
    expect(result.transport!.trnsIds).toEqual([])
    expect(result.salary!.trnsIds).toEqual([])
    expect(result.groceries!.trnsIds).toEqual(['t1'])
  })

  it('preCategoriesIds does not overwrite existing data', () => {
    const result = collectCategoriesByTrns({
      categoriesItems: categories,
      preCategoriesIds: ['groceries'],
      trnsIds: ['t1', 't2'],
      trnsItems,
    })

    expect(result.groceries!.trnsIds).toEqual(['t1', 't2'])
  })

  it('returns empty for empty trnsIds', () => {
    const result = collectCategoriesByTrns({
      categoriesItems: categories,
      trnsIds: [],
      trnsItems,
    })

    expect(Object.keys(result)).toEqual([])
  })
})

describe('flattenCategoriesWithValues', () => {
  const collected: CategoriesWithData = {
    groceries: { id: 'groceries', name: 'Groceries', trnsIds: ['t1', 't2'], value: 0 },
    salary: { id: 'salary', name: 'Salary', trnsIds: ['t4'], value: 0 },
    transport: { id: 'transport', name: 'Transport', trnsIds: ['t5'], value: 0 },
  }

  it('computes values using computeValue callback', () => {
    const values: Record<string, number> = { t1: -50, t2: -30, t4: 1000, t5: -20 }
    const computeValue = (ids: string[]) => ids.reduce((sum, id) => sum + (values[id] ?? 0), 0)

    const result = flattenCategoriesWithValues(collected, computeValue)

    expect(result.find(c => c.id === 'groceries')?.value).toBe(-80)
    expect(result.find(c => c.id === 'salary')?.value).toBe(1000)
    expect(result.find(c => c.id === 'transport')?.value).toBe(-20)
  })

  it('sorts by amount: positive first descending, then negative ascending', () => {
    const data2: CategoriesWithData = {
      high: { id: 'high', name: 'High', trnsIds: ['h'], value: 0 },
      low: { id: 'low', name: 'Low', trnsIds: ['l'], value: 0 },
      neg: { id: 'neg', name: 'Neg', trnsIds: ['n'], value: 0 },
    }

    const result2 = flattenCategoriesWithValues(data2, (ids) => {
      const map: Record<string, number> = { h: 500, l: 200, n: -100 }
      return map[ids[0]!] ?? 0
    })

    expect(result2[0]!.value).toBe(500)
    expect(result2[1]!.value).toBe(200)
    expect(result2[2]!.value).toBe(-100)
  })

  it('puts zero-value categories at the end', () => {
    const data: CategoriesWithData = {
      empty: { id: 'empty', name: 'Empty', trnsIds: [], value: 0 },
      full: { id: 'full', name: 'Full', trnsIds: ['x'], value: 0 },
    }

    const result = flattenCategoriesWithValues(data, ids => ids.length > 0 ? 100 : 0)

    expect(result[0]!.id).toBe('full')
    expect(result[1]!.id).toBe('empty')
  })
})

describe('groupCategoriesWithValues', () => {
  it('groups child categories under parent', () => {
    const collected: CategoriesWithData = {
      groceries: { id: 'groceries', name: 'Groceries', trnsIds: ['t1', 't2'], value: 0 },
      restaurants: { id: 'restaurants', name: 'Restaurants', trnsIds: ['t3'], value: 0 },
    }

    const computeValue = (ids: string[]) => ids.length * -50

    const result = groupCategoriesWithValues(collected, categories, computeValue)

    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('food')
    expect(result[0]!.name).toBe('Food')
    expect(result[0]!.value).toBe(-150) // -100 + -50
    expect(result[0]!.trnsIds).toEqual(['t1', 't2', 't3'])
    expect(result[0]!.categories).toHaveLength(2)
  })

  it('keeps root categories without parent as standalone', () => {
    const collected: CategoriesWithData = {
      salary: { id: 'salary', name: 'Salary', trnsIds: ['t4'], value: 0 },
      transport: { id: 'transport', name: 'Transport', trnsIds: ['t5'], value: 0 },
    }

    const computeValue = (ids: string[]) => ids.length * 100

    const result = groupCategoriesWithValues(collected, categories, computeValue)

    expect(result).toHaveLength(2)
    expect(result.map(c => c.id)).toContain('salary')
    expect(result.map(c => c.id)).toContain('transport')
    expect(result.find(c => c.id === 'salary')?.categories).toEqual([])
  })

  it('mixes parent groups and standalone categories', () => {
    const collected: CategoriesWithData = {
      groceries: { id: 'groceries', name: 'Groceries', trnsIds: ['t1'], value: 0 },
      transport: { id: 'transport', name: 'Transport', trnsIds: ['t5'], value: 0 },
    }

    const computeValue = (ids: string[]) => ids.length * -100

    const result = groupCategoriesWithValues(collected, categories, computeValue)

    expect(result).toHaveLength(2)
    const foodGroup = result.find(c => c.id === 'food')
    const transportItem = result.find(c => c.id === 'transport')

    expect(foodGroup).toBeDefined()
    expect(foodGroup?.categories).toHaveLength(1)
    expect(transportItem).toBeDefined()
    expect(transportItem?.categories).toEqual([])
  })

  it('sorts child categories by amount', () => {
    const collected: CategoriesWithData = {
      groceries: { id: 'groceries', name: 'Groceries', trnsIds: ['t1'], value: 0 },
      restaurants: { id: 'restaurants', name: 'Restaurants', trnsIds: ['t3', 't3b'], value: 0 },
    }

    const computeValue = (ids: string[]) => ids.length * -50

    const result = groupCategoriesWithValues(collected, categories, computeValue)
    const foodGroup = result[0]!

    // restaurants: -100, groceries: -50 → restaurants first (larger absolute negative)
    expect(foodGroup.categories![0]!.id).toBe('restaurants')
    expect(foodGroup.categories![1]!.id).toBe('groceries')
  })

  it('sorts parent groups by total amount', () => {
    const collected: CategoriesWithData = {
      groceries: { id: 'groceries', name: 'Groceries', trnsIds: ['t1'], value: 0 },
      transport: { id: 'transport', name: 'Transport', trnsIds: ['t5', 't5b', 't5c'], value: 0 },
    }

    const computeValue = (ids: string[]) => ids.length * -100

    const result = groupCategoriesWithValues(collected, categories, computeValue)

    // transport: -300, food(groceries): -100 → transport first
    expect(result[0]!.id).toBe('transport')
    expect(result[1]!.id).toBe('food')
  })

  it('handles empty input', () => {
    const result = groupCategoriesWithValues({}, categories, () => 0)
    expect(result).toEqual([])
  })
})

describe('sortCategoriesByAmount', () => {
  it('sorts: positive descending, then negative by absolute descending', () => {
    const categories: CategoriesWithData[string][] = [
      { id: 'a', name: 'A', trnsIds: [], value: 100 },
      { id: 'b', name: 'B', trnsIds: [], value: 300 },
      { id: 'c', name: 'C', trnsIds: [], value: 200 },
      { id: 'd', name: 'D', trnsIds: [], value: -200 },
      { id: 'e', name: 'E', trnsIds: [], value: -400 },
    ]

    expect(categories.sort(sortCategoriesByAmount).map(c => c.value))
      .toEqual([300, 200, 100, -400, -200])
  })
})
