import { describe, expect, it } from 'vitest'

import type { Categories } from '~/components/categories/types'
import type { WalletsComputed } from '~/components/wallets/types'

import { searchCategories, searchWallets } from '~/components/filter/search'

describe('searchWallets', () => {
  const wallets = {
    active: { isArchived: false, name: 'Cash' },
    archived: { isArchived: true, name: 'Cashback card' },
    other: { isArchived: false, name: 'Bank' },
  } as unknown as WalletsComputed

  it('returns nothing for an empty query', () => {
    expect(searchWallets('', wallets)).toEqual([])
  })

  it('matches by name, case-insensitive', () => {
    expect(searchWallets('cash', wallets)).toEqual(['active'])
  })

  it('excludes archived wallets even on a match', () => {
    expect(searchWallets('cashback', wallets)).toEqual([])
  })
})

describe('searchCategories', () => {
  const items = {
    adjustment: { name: 'Adjustment', parentId: 0 },
    child: { name: 'Bakery', parentId: 'parent' },
    other: { name: 'Transport', parentId: 0 },
    parent: { name: 'Food', parentId: 0 },
    transfer: { name: 'Transfer', parentId: 0 },
    withChildren: { name: 'Grouped Food', parentId: 0 },
  } as unknown as Categories

  const hasChildren = (id: string) => id === 'withChildren'

  it('returns nothing for an empty query', () => {
    expect(searchCategories('', items, hasChildren)).toEqual([])
  })

  it('excludes the transfer and adjustment pseudo-categories', () => {
    expect(searchCategories('adjustment', items, hasChildren)).toEqual([])
    expect(searchCategories('transfer', items, hasChildren)).toEqual([])
  })

  it('excludes categories that have children', () => {
    expect(searchCategories('grouped', items, hasChildren)).toEqual([])
  })

  it('matches by own name or parent name, sorted by name', () => {
    expect(searchCategories('food', items, hasChildren)).toEqual(['child', 'parent'])
  })
})
