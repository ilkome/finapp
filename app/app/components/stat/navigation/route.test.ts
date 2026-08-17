import { describe, expect, it } from 'vitest'

import { buildStatCategoryRoute, isStatDrilldownQuery } from '~/components/stat/navigation/route'

describe('statistics category route', () => {
  it('builds a filtered snapshot route and removes duplicate ids', () => {
    expect(buildStatCategoryRoute({
      categoriesIds: ['food', 'food', 'travel'],
      categoryId: 'groceries',
      isDrilldown: true,
      snapshotId: 'snapshot-id',
      walletsIds: ['cash', 'cash'],
    })).toEqual({
      path: '/categories/groceries',
      query: {
        filterCategories: 'food,travel',
        filterWallets: 'cash',
        statDrilldown: 'true',
        statSnapshot: 'snapshot-id',
      },
    })
  })

  it('omits empty optional query values', () => {
    expect(buildStatCategoryRoute({
      categoriesIds: [],
      categoryId: 'groceries',
      isDrilldown: false,
      snapshotId: null,
      walletsIds: [],
    })).toEqual({
      path: '/categories/groceries',
      query: {
        filterCategories: undefined,
        filterWallets: undefined,
        statDrilldown: undefined,
        statSnapshot: undefined,
      },
    })
  })

  it('recognizes only the explicit drilldown query value', () => {
    expect(isStatDrilldownQuery('true')).toBe(true)
    expect(isStatDrilldownQuery('false')).toBe(false)
    expect(isStatDrilldownQuery(['true'])).toBe(false)
  })
})
