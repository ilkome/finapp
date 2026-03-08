import { describe, expect, it } from 'vitest'

import { ruPluralization } from './ruPluralization'

describe('ruPluralization', () => {
  it('returns 0 for choice === 0', () => {
    expect(ruPluralization(0, 4)).toBe(0)
  })

  it('returns 1 for singular (ends with 1, not teen)', () => {
    expect(ruPluralization(1, 4)).toBe(1)
    expect(ruPluralization(21, 4)).toBe(1)
    expect(ruPluralization(31, 4)).toBe(1)
    expect(ruPluralization(101, 4)).toBe(1)
  })

  it('returns 2 for few (ends with 2-4, not teen)', () => {
    expect(ruPluralization(2, 4)).toBe(2)
    expect(ruPluralization(3, 4)).toBe(2)
    expect(ruPluralization(4, 4)).toBe(2)
    expect(ruPluralization(22, 4)).toBe(2)
    expect(ruPluralization(33, 4)).toBe(2)
    expect(ruPluralization(104, 4)).toBe(2)
  })

  it('returns 3 for many (teens and ends with 5-9, 0)', () => {
    expect(ruPluralization(5, 4)).toBe(3)
    expect(ruPluralization(10, 4)).toBe(3)
    expect(ruPluralization(11, 4)).toBe(3)
    expect(ruPluralization(12, 4)).toBe(3)
    expect(ruPluralization(14, 4)).toBe(3)
    expect(ruPluralization(15, 4)).toBe(3)
    expect(ruPluralization(19, 4)).toBe(3)
    expect(ruPluralization(25, 4)).toBe(3)
    expect(ruPluralization(100, 4)).toBe(3)
  })

  it('falls back to 2 when choicesLength < 4', () => {
    expect(ruPluralization(5, 3)).toBe(2)
    expect(ruPluralization(11, 3)).toBe(2)
    expect(ruPluralization(100, 3)).toBe(2)
  })
})
