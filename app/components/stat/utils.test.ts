import { describe, expect, it } from 'vitest'
import { sortCategoriesByAmount } from '~/components/stat/utils'
import type { TotalCategory } from '~/components/stat/types'

describe('sortCategoriesByAmount', () => {
  it('sort multiple values in correct order', () => {
    const categories: TotalCategory[] = [
      { id: 'a', trnsIds: [], value: 100 },
      { id: 'b', trnsIds: [], value: 300 },
      { id: 'c', trnsIds: [], value: 200 },
      { id: 'd', trnsIds: [], value: -200 },
      { id: 'e', trnsIds: [], value: -400 },
    ]

    expect(categories.sort(sortCategoriesByAmount)).toEqual([
      { id: 'b', trnsIds: [], value: 300 },
      { id: 'c', trnsIds: [], value: 200 },
      { id: 'a', trnsIds: [], value: 100 },
      { id: 'e', trnsIds: [], value: -400 },
      { id: 'd', trnsIds: [], value: -200 },
    ])
  })
})
