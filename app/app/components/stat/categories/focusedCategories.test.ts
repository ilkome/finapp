import { describe, expect, it } from 'vitest'

import type { CategoryWithData } from '~/components/stat/types'

import { filterFocusedCategories } from '~/components/stat/categories/focusedCategories'

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
