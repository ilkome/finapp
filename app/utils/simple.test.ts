import { describe, expect, it } from 'vitest'
import { moveItem, uniqueElementsBy } from '~~/utils/simple'

describe('uniqueElementsBy', () => {
  it('extracts unique values of a property', () => {
    const obj = {
      a: { currency: 'USD', name: 'Cash' },
      b: { currency: 'EUR', name: 'Card' },
      c: { currency: 'USD', name: 'Savings' },
    }

    expect(uniqueElementsBy(obj, 'currency')).toEqual(['USD', 'EUR'])
  })

  it('returns empty array for empty object', () => {
    expect(uniqueElementsBy({}, 'currency')).toEqual([])
  })

  it('returns single value when all entries are the same', () => {
    const obj = {
      a: { currency: 'RUB' },
      b: { currency: 'RUB' },
    }

    expect(uniqueElementsBy(obj, 'currency')).toEqual(['RUB'])
  })

  it('does not traverse prototype chain', () => {
    const proto = { inherited: { currency: 'HACK' } }
    const obj = Object.create(proto)
    obj.own = { currency: 'USD' }

    expect(uniqueElementsBy(obj, 'currency')).toEqual(['USD'])
  })
})

describe('moveItem', () => {
  it('shifts an item by the offset', () => {
    expect(moveItem(['a', 'b', 'c'], 'a', 1)).toEqual(['b', 'a', 'c'])
    expect(moveItem(['a', 'b', 'c'], 'c', -2)).toEqual(['c', 'a', 'b'])
  })

  it('keeps the order when the item is missing or would leave the list', () => {
    expect(moveItem(['a', 'b'], 'a', -1)).toEqual(['a', 'b'])
    expect(moveItem(['a', 'b'], 'b', 1)).toEqual(['a', 'b'])
    expect(moveItem(['a', 'b'], 'x', 1)).toEqual(['a', 'b'])
  })
})
