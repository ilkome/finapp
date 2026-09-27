import { describe, expect, it } from 'vitest'

import type { Categories } from '~/components/categories/types'

import { applyCategoryOverrides, compareCategoryIds, computeChildrenDiff, getTransactibleCategoriesIds, parseCategoryOverrides, toCategoryOverride } from '~/components/categories/utils'

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

describe('category overrides', () => {
  const base = { color: '', icon: 'mdi:percent', isExcludeFromStats: false, name: 'Loan interest', parentId: 0 as const, showInLastUsed: false, showInQuickSelector: false }
  const defaults = { loanInterest: base, transfer: { ...base, icon: 'mdi:repeat', name: 'Transfer' } }
  const rows = { child: { ...base, name: 'Child', parentId: 'root' }, root: { ...base, name: 'Root' } } as unknown as Categories

  it('parses tolerantly: bad json, non-reserved ids and invalid fields are dropped', () => {
    expect(parseCategoryOverrides('{oops')).toEqual({})
    expect(parseCategoryOverrides(null)).toEqual({})
    expect(parseCategoryOverrides('{"c1":{"name":"x"},"transfer":{"name":"Moves","icon":5}}')).toEqual({ transfer: { name: 'Moves' } })
  })

  it('keeps the localized default name when no name is overridden', () => {
    const result = applyCategoryOverrides(defaults, { loanInterest: { color: 'red' } })
    expect(result.loanInterest).toMatchObject({ color: 'red', name: 'Loan interest', parentId: 0 })
  })

  it('stores only name, color and icon that differ from the default, never a parent', () => {
    expect(toCategoryOverride(base, base)).toBeUndefined()
    expect(toCategoryOverride({ ...base, name: ' Interest ', parentId: 'root' }, base)).toEqual({ name: 'Interest' })
  })

  it('sorts reserved categories after user ones', () => {
    const items = { ...rows, adjustment: { ...base, name: 'Adjustment' }, zeta: { ...base, name: 'Zeta' } } as unknown as Categories
    expect(['adjustment', 'zeta', 'root'].sort((a, b) => compareCategoryIds(a, b, items))).toEqual(['root', 'zeta', 'adjustment'])
  })
})
