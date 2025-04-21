import { describe, expect, it } from 'vitest'

import type { Categories } from '~/components/categories/types'

import { getTransactibleCategoriesIds, getTransferCategoriesIds } from '~/components/categories/utils'

export const mockCategories: Categories = {
  child1: {
    color: 'red',
    icon: 'home',
    name: 'Selectable Child',
    parentId: 'withChilds',
  },
  child2: {
    color: 'red',
    icon: 'home',
    name: 'Selectable Child',
    parentId: 'withChilds',
  },
  root: {
    color: 'red',
    icon: 'home',
    name: 'Selectable Root',
    parentId: 0,
  },
  transfer: {
    color: 'var(--ui-primary)',
    icon: 'mdi:repeat',
    name: 'Transfer',
    parentId: 0,
  },
  transfer2: {
    color: 'var(--ui-primary)',
    icon: 'mdi:repeat',
    name: 'перевод',
    parentId: 0,
  },
  transfer3: {
    color: 'var(--ui-primary)',
    icon: 'mdi:repeat',
    name: 'transfer',
    parentId: 0,
  },
  withChilds: {
    childIds: ['child1', 'child2'],
    color: 'red',
    icon: 'home',
    name: 'No Selectable with childs',
    parentId: 0,
  },
}

const mockCategories2: Categories = {
  '241120_7fxrno': {
    color: '#701a75',
    icon: 'mdi:paper-roll-outline',
    name: 'Gas',
    order: 1,
    parentId: '241120_k27ehb',
    showInLastUsed: true,
    showInQuickSelector: false,
  },
  '241120_7wshaj': {
    color: '#52525b',
    icon: 'mdi:mushroom',
    name: 'Просто категория',
    order: 1,
    parentId: 0,
    showInLastUsed: true,
    showInQuickSelector: false,
  },
  '241120_k27ehb': {
    childIds: [
      '241120_7fxrno',
    ],
    color: '#701a75',
    icon: 'mdi:truck-delivery',
    name: 'Auto',
    order: 1,
    parentId: 0,
    showInLastUsed: true,
    showInQuickSelector: false,
  },
  'transfer': {
    childIds: [],
    color: 'var(--ui-primary)',
    icon: 'mdi:repeat',
    name: 'Transfer',
    order: 9999,
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

describe('getTransferCategoriesIds', () => {
  it('returns transfer categories ids', () => {
    const result = getTransferCategoriesIds(mockCategories)
    expect(result).toEqual(['transfer', 'transfer2', 'transfer3'])
  })

  it('empty categories object', () => {
    // @ts-expect-error for test
    const result = getTransferCategoriesIds({})
    expect(result).toEqual([])
  })

  it('undefined categories', () => {
    // @ts-expect-error for test
    const result = getTransferCategoriesIds(undefined)
    expect(result).toEqual([])
  })
})
