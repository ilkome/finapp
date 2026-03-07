import { describe, expect, it } from 'vitest'

import { cleanupFrontendIds, isLocalId } from '~/utils/convexId'

describe('cleanupFrontendIds', () => {
  it('removes stale local IDs not in pending queue', () => {
    const data = { local_abc: { n: 1 }, server123: { n: 2 } }
    const result = cleanupFrontendIds(data, {})

    expect(result).not.toHaveProperty('local_abc')
    expect(result).toHaveProperty('server123')
  })

  it('keeps local IDs that are still pending', () => {
    const data = { local_abc: { n: 1 }, local_def: { n: 2 } }
    const pending = { local_abc: { n: 1 } }
    const result = cleanupFrontendIds(data, pending)

    expect(result).toHaveProperty('local_abc')
    expect(result).not.toHaveProperty('local_def')
  })

  it('does not mutate original data', () => {
    const data = { local_abc: { n: 1 } }
    cleanupFrontendIds(data, {})

    expect(data).toHaveProperty('local_abc')
  })
})

describe('generateId + isLocalId contract', () => {
  it('generateId produces IDs recognized by isLocalId', async () => {
    const { generateId } = await import('~~/utils/generateId')

    expect(isLocalId(generateId())).toBe(true)
  })
})
