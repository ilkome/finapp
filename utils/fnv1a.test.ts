import { describe, expect, it } from 'vitest'
import { fnv1aNum, xorIdsHash } from '~~/utils/fnv1a'

describe('fnv1aNum', () => {
  it('returns consistent hash for same input (regression snapshot)', () => {
    expect(fnv1aNum('trn1')).toBe(563873362)
    expect(fnv1aNum('wallet_abc')).toBe(1520395703)
  })

  it('returns different hashes for different inputs', () => {
    expect(fnv1aNum('a')).not.toBe(fnv1aNum('b'))
  })
})

describe('xorIdsHash', () => {
  it('returns consistent hash (regression snapshot)', () => {
    expect(xorIdsHash(['trn1'])).toBe(fnv1aNum('trn1').toString(36))
  })

  it('is order-independent (critical for sync — DB order not guaranteed)', () => {
    const hash1 = xorIdsHash(['a', 'b', 'c'])
    const hash2 = xorIdsHash(['c', 'a', 'b'])

    expect(hash1).toBe(hash2)
  })

  it('returns "0" for empty array', () => {
    expect(xorIdsHash([])).toBe('0')
  })
})
