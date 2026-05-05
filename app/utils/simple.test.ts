import { describe, expect, it } from 'vitest'
import { uniqueElementsBy } from '~~/utils/simple'

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
