import { describe, expect, it } from 'vitest'
import { getTransactibleCategoriesIds } from './utils'
import type { Categories } from './types'

describe('getTransactibleCategoriesIds', () => {
  const mockCategories: Categories = {
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
    withChilds: {
      childIds: ['child1', 'child2'],
      color: 'red',
      icon: 'home',
      name: 'No Selectable with childs',
      parentId: 0,
    },
  }

  it('ids are provided', () => {
    const ids = ['child1', 'root', 'withChilds']
    const result = getTransactibleCategoriesIds(mockCategories, ids)
    expect(result).toEqual(['child1'])
  })

  it('no ids are provided', () => {
    const result = getTransactibleCategoriesIds(mockCategories)
    console.log('111', result)

    expect(result).toEqual(['child1', 'child2', 'root', 'transfer'])
  })

  it('empty categories object', () => {
    const result = getTransactibleCategoriesIds({})
    expect(result).toEqual([])
  })

  it('undefined categories', () => {
    const result = getTransactibleCategoriesIds(undefined)
    expect(result).toEqual([])
  })
})
