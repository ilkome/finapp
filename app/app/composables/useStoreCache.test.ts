import localforage from 'localforage'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clearStoreCache, persistStoreCache, readStoreCache } from '~/composables/useStoreCache'

vi.mock('localforage', () => ({
  default: { getItem: vi.fn(), removeItem: vi.fn(async () => {}), setItem: vi.fn(async () => {}) },
}))
vi.mock('~/composables/useAuthSession', () => ({ getPersistedUid: () => 'u1' }))
vi.mock('~/composables/useStoreSync', () => ({ isPersistBlocked: () => false }))

const getItem = vi.mocked(localforage.getItem)
const setItem = vi.mocked(localforage.setItem)

describe('useStoreCache', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    await clearStoreCache()
  })
  afterEach(() => vi.useRealTimers())

  it('keeps slices from the cold-start read without reading the blob again on write', async () => {
    getItem.mockResolvedValueOnce({ trns: { t1: 1 }, wallets: { w1: 1 } })
    await readStoreCache()

    persistStoreCache('user', { name: 'a' })
    await vi.advanceTimersByTimeAsync(400)

    expect(getItem).toHaveBeenCalledTimes(1)
    expect(setItem).toHaveBeenCalledWith('finapp.cache.u1', { trns: { t1: 1 }, user: { name: 'a' }, wallets: { w1: 1 } })
  })

  it('does not let the cold-start read overwrite a slice persisted before it', async () => {
    persistStoreCache('trns', { t2: 2 })
    getItem.mockResolvedValueOnce({ trns: { t1: 1 } })
    await readStoreCache()
    await vi.advanceTimersByTimeAsync(400)

    expect(setItem).toHaveBeenLastCalledWith('finapp.cache.u1', { trns: { t2: 2 } })
  })

  it('forgets the seeded slices on clear', async () => {
    getItem.mockResolvedValueOnce({ trns: { t1: 1 } })
    await readStoreCache()
    await clearStoreCache()

    persistStoreCache('user', { name: 'b' })
    await vi.advanceTimersByTimeAsync(400)

    expect(setItem).toHaveBeenLastCalledWith('finapp.cache.u1', { user: { name: 'b' } })
  })
})
