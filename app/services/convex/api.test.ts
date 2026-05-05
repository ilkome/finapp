import { describe, expect, it } from 'vitest'
import { convexWalletsToMap } from '~~/services/convex/api'

describe('convexWalletsToMap (arrayToMap)', () => {
  it('strips _id, _creationTime, userId and uses _id as key', () => {
    const docs = [
      { _creationTime: 123, _id: 'w1', color: '#0f0', currency: 'USD', name: 'Cash', userId: 'u1' },
      { _creationTime: 456, _id: 'w2', color: '#f00', currency: 'EUR', name: 'Card', userId: 'u1' },
    ]

    const result = convexWalletsToMap(docs as any)

    expect(result).toEqual({
      w1: { color: '#0f0', currency: 'USD', name: 'Cash' },
      w2: { color: '#f00', currency: 'EUR', name: 'Card' },
    })
  })

  it('returns empty object for empty array', () => {
    expect(convexWalletsToMap([])).toEqual({})
  })
})
