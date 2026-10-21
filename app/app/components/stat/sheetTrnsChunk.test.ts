import { describe, expect, it } from 'vitest'

import { takeGroupRows } from './sheetTrnsChunk'

const groups = [
  { ids: ['a', 'b', 'c'], key: 1, sum: 30 },
  { ids: ['d', 'e'], key: 2, sum: 20 },
  { ids: ['f'], key: 3, sum: 10 },
]

describe('takeGroupRows', () => {
  it('cuts inside a group and keeps its whole-period sum', () => {
    expect(takeGroupRows(groups, 4)).toEqual([groups[0], { ids: ['d'], key: 2, sum: 20 }])
  })

  it('stops at a group boundary without an empty group', () => {
    expect(takeGroupRows(groups, 3)).toEqual([groups[0]])
  })

  it('returns every row when the budget covers them', () => {
    expect(takeGroupRows(groups, 100)).toEqual(groups)
  })
})
