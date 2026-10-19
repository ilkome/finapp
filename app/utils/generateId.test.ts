import { describe, expect, it } from 'vitest'

import { generateId } from './generateId'

describe('generateId', () => {
  it('is a UUIDv7 with the RFC 9562 variant', () => {
    expect(generateId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('carries the time in its first 48 bits', () => {
    const at = Date.UTC(2026, 9, 19, 12)
    expect(Number.parseInt(generateId(at).replace('-', '').slice(0, 12), 16)).toBe(at)
  })

  it('sorts by creation time', () => {
    const ids = [3, 1, 2].map(n => generateId(Date.UTC(2026, 0, n)))
    expect(ids.toSorted()).toEqual([ids[1], ids[2], ids[0]])
  })
})
