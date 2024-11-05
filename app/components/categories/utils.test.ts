import { describe, expect, it } from 'vitest'
import { getTransactibleCategoriesIds, getTransferCategoriesIds } from '~/components/categories/utils'
import type { Categories } from '~/components/categories/types'

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
    color: 'var(--c-blue-1)',
    icon: 'mdi mdi-repeat',
    name: 'Transfer',
    parentId: 0,
  },
  transfer2: {
    color: 'var(--c-blue-1)',
    icon: 'mdi mdi-repeat',
    name: 'перевод',
    parentId: 0,
  },
  transfer3: {
    color: 'var(--c-blue-1)',
    icon: 'mdi mdi-repeat',
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

describe('getTransactibleCategoriesIds', () => {
  it('ids are provided', () => {
    const ids = ['child1', 'root', 'withChilds']
    const result = getTransactibleCategoriesIds(mockCategories, ids)
    expect(result).toEqual(['child1', 'root'])
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
