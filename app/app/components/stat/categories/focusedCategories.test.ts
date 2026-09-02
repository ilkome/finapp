import { describe, expect, it } from 'vitest'

import type { CategoryWithData } from '~/components/stat/types'

import { countActiveFocusedChildren, filterFocusedCategories, projectCategorySelection } from '~/components/stat/categories/focusedCategories'

describe('filterFocusedCategories', () => {
  it('keeps only children with transactions in the selected period', () => {
    const categories: CategoryWithData[] = [
      { id: 'child-with-trns', name: 'Used child', trnsIds: ['t1'], value: -100 },
      { id: 'other-category', name: 'Other', trnsIds: ['t2'], value: -50 },
    ]

    expect(filterFocusedCategories(categories, ['child-with-trns', 'child-without-trns']))
      .toEqual([categories[0]])
  })
})

describe('countActiveFocusedChildren', () => {
  it('counts unique active children and ignores unrelated categories', () => {
    expect(countActiveFocusedChildren({
      childrenIds: ['commission', 'percent'],
      trnsIds: ['commission-1', 'commission-2', 'food'],
      trnsItems: {
        'commission-1': { categoryId: 'commission' },
        'commission-2': { categoryId: 'commission' },
        'food': { categoryId: 'food' },
      },
    })).toBe(1)
  })

  it('counts multiple active children', () => {
    expect(countActiveFocusedChildren({
      childrenIds: ['commission', 'percent'],
      trnsIds: ['commission', 'percent'],
      trnsItems: {
        commission: { categoryId: 'commission' },
        percent: { categoryId: 'percent' },
      },
    })).toBe(2)
  })
})

describe('projectCategorySelection', () => {
  const parent = { id: 'parent', name: 'Parent', trnsIds: ['t1'], value: -100 }
  const child = { id: 'child', name: 'Child', trnsIds: ['t1'], value: -100 }
  const sibling = { id: 'sibling', name: 'Sibling', trnsIds: ['t2'], value: -50 }
  const getChildrenIds = (categoryId: string) => categoryId === 'parent' ? ['child', 'sibling'] : []
  const getParentId = (categoryId: string) => ['child', 'sibling'].includes(categoryId) ? 'parent' : undefined

  it('keeps a directly visible selection unchanged', () => {
    expect(projectCategorySelection({
      activeCategories: [child, sibling],
      getChildrenIds,
      getParentId,
      selectedIds: ['parent'],
      visibleCategories: [parent],
    })).toEqual(new Map([['parent', 'parent']]))
  })

  it('projects a selected parent to its sole active visible child', () => {
    expect(projectCategorySelection({
      activeCategories: [child],
      getChildrenIds,
      getParentId,
      selectedIds: ['parent'],
      visibleCategories: [child],
    })).toEqual(new Map([['child', 'parent']]))
  })

  it('projects a selected child to its visible parent group', () => {
    expect(projectCategorySelection({
      activeCategories: [child, sibling],
      getChildrenIds,
      getParentId,
      selectedIds: ['child'],
      visibleCategories: [parent],
    })).toEqual(new Map([['parent', 'child']]))
  })
})
