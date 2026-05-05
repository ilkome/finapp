import { describe, expect, it } from 'vitest'

import type { Categories } from '~/components/categories/types'

import { computeChildrenDiff, getTransactibleCategoriesIds } from '~/components/categories/utils'

export const mockCategories: Categories = {
  child1: {
    color: 'red',
    icon: 'home',
    name: 'Selectable Child',
    parentId: 'withChilds',
    showInLastUsed: true,
    showInQuickSelector: false,
  },
  child2: {
    color: 'red',
    icon: 'home',
    name: 'Selectable Child',
    parentId: 'withChilds',
    showInLastUsed: true,
    showInQuickSelector: false,
  },
  root: {
    color: 'red',
    icon: 'home',
    name: 'Selectable Root',
    parentId: 0,
    showInLastUsed: true,
    showInQuickSelector: false,
  },
  transfer: {
    color: 'var(--ui-primary)',
    icon: 'mdi:repeat',
    name: 'Transfer',
    parentId: 0,
    showInLastUsed: false,
    showInQuickSelector: false,
  },
  transfer2: {
    color: 'var(--ui-primary)',
    icon: 'mdi:repeat',
    name: 'перевод',
    parentId: 0,
    showInLastUsed: true,
    showInQuickSelector: false,
  },
  transfer3: {
    color: 'var(--ui-primary)',
    icon: 'mdi:repeat',
    name: 'transfer',
    parentId: 0,
    showInLastUsed: true,
    showInQuickSelector: false,
  },
  withChilds: {
    color: 'red',
    icon: 'home',
    name: 'No Selectable with childs',
    parentId: 0,
    showInLastUsed: true,
    showInQuickSelector: false,
  },
}

const mockCategories2: Categories = {
  '241120_7fxrno': {
    color: '#701a75',
    icon: 'mdi:paper-roll-outline',
    name: 'Gas',
    parentId: '241120_k27ehb',
    showInLastUsed: true,
    showInQuickSelector: false,
  },
  '241120_7wshaj': {
    color: '#52525b',
    icon: 'mdi:mushroom',
    name: 'Просто категория',
    parentId: 0,
    showInLastUsed: true,
    showInQuickSelector: false,
  },
  '241120_k27ehb': {
    color: '#701a75',
    icon: 'mdi:truck-delivery',
    name: 'Auto',
    parentId: 0,
    showInLastUsed: true,
    showInQuickSelector: false,
  },
  'transfer': {
    color: 'var(--ui-primary)',
    icon: 'mdi:repeat',
    name: 'Transfer',
    parentId: 0,
    showInLastUsed: false,
    showInQuickSelector: false,
  },
}

describe('getTransactibleCategoriesIds', () => {
  it('ids are provided', () => {
    const result = getTransactibleCategoriesIds(mockCategories, ['child1', 'root', 'withChilds'])
    expect(result).toEqual(['child1', 'root', 'child2'])
  })

  it('no ids are provided', () => {
    const result = getTransactibleCategoriesIds(mockCategories)
    expect(result).toEqual(['child1', 'child2', 'root', 'transfer', 'transfer2', 'transfer3'])
  })

  it('empty categories object', () => {
    // @ts-expect-error for test
    const result = getTransactibleCategoriesIds({})
    expect(result).toEqual([])
  })

  it('undefined categories', () => {
    // @ts-expect-error for test
    const result = getTransactibleCategoriesIds(undefined)
    expect(result).toEqual([])
  })

  it('filter by one parent category', () => {
    const result = getTransactibleCategoriesIds(mockCategories2, ['241120_k27ehb'])
    expect(result).toEqual(['241120_7fxrno'])
  })
})

describe('computeChildrenDiff', () => {
  it('returns empty when both arrays are empty', () => {
    expect(computeChildrenDiff([], [])).toEqual({ added: [], removed: [] })
  })

  it('all added when prev is empty', () => {
    expect(computeChildrenDiff([], ['a', 'b'])).toEqual({ added: ['a', 'b'], removed: [] })
  })

  it('all removed when next is empty', () => {
    expect(computeChildrenDiff(['a', 'b'], [])).toEqual({ added: [], removed: ['a', 'b'] })
  })

  it('detects added and removed together', () => {
    expect(computeChildrenDiff(['a', 'b'], ['b', 'c'])).toEqual({ added: ['c'], removed: ['a'] })
  })

  it('returns empty diffs when sets are equal regardless of order', () => {
    expect(computeChildrenDiff(['a', 'b'], ['b', 'a'])).toEqual({ added: [], removed: [] })
  })
})
