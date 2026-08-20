import { describe, expect, it } from 'vitest'

import { getSelectedParentCategoryId } from '~/components/filter/selectedParentCategory'

const children: Record<string, string[]> = {
  food: ['groceries', 'cafes'],
  transport: ['taxi', 'transit'],
}

function getSelectedParent(selectedIds: string[]) {
  return getSelectedParentCategoryId({
    getChildrenIds: id => children[id] ?? [],
    rootIds: ['food', 'transport'],
    selectedIds,
  })
}

describe('getSelectedParentCategoryId', () => {
  it('finds a parent represented by all of its selected children', () => {
    expect(getSelectedParent(['cafes', 'groceries'])).toBe('food')
  })

  it('finds an explicitly selected parent', () => {
    expect(getSelectedParent(['transport'])).toBe('transport')
  })

  it('does not focus a parent for a partial or mixed selection', () => {
    expect(getSelectedParent(['groceries'])).toBeUndefined()
    expect(getSelectedParent(['groceries', 'cafes', 'taxi', 'transit'])).toBeUndefined()
  })
})
