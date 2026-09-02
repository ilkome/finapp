import { describe, expect, it } from 'vitest'

import { buildStatCategoryRoute, buildStatWalletRoute, isStatDrilldownQuery } from '~/components/stat/navigation/route'

describe('statistics category route', () => {
  it('builds a filtered snapshot route and removes duplicate ids', () => {
    expect(buildStatCategoryRoute({
      categoryId: 'groceries',
      isDrilldown: true,
      snapshotId: 'snapshot-id',
      walletsIds: ['cash', 'cash'],
    })).toEqual({
      path: '/categories/groceries',
      query: {
        filterWallets: 'cash',
        statDrilldown: 'true',
        statSnapshot: 'snapshot-id',
      },
    })
  })

  it('omits empty optional query values', () => {
    expect(buildStatCategoryRoute({
      categoryId: 'groceries',
      isDrilldown: false,
      snapshotId: null,
      walletsIds: [],
    })).toEqual({
      path: '/categories/groceries',
      query: {
        filterWallets: undefined,
        statDrilldown: undefined,
        statSnapshot: undefined,
      },
    })
  })

  it('builds a wallet route with the inherited category filter', () => {
    expect(buildStatWalletRoute({
      categoriesIds: ['food', 'food', 'travel'],
      isDrilldown: true,
      snapshotId: 'snapshot-id',
      walletId: 'cash',
    })).toEqual({
      path: '/wallets/cash',
      query: {
        filterCategories: 'food,travel',
        statDrilldown: 'true',
        statSnapshot: 'snapshot-id',
      },
    })
  })

  it('recognizes only the explicit drilldown query value', () => {
    expect(isStatDrilldownQuery('true')).toBe(true)
    expect(isStatDrilldownQuery('false')).toBe(false)
    expect(isStatDrilldownQuery(['true'])).toBe(false)
  })
})
