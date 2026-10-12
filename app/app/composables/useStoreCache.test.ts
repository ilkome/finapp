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

const removeItem = vi.mocked(localforage.removeItem)

describe('useStoreCache', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    getItem.mockReset()
    setItem.mockClear()
    removeItem.mockClear()
    await clearStoreCache()
  })
  afterEach(() => vi.useRealTimers())

  it('writes only the changed slice', async () => {
    persistStoreCache('wallets', { w1: 1 })
    await vi.advanceTimersByTimeAsync(400)

    expect(setItem).toHaveBeenCalledTimes(1)
    expect(setItem).toHaveBeenCalledWith('finapp.cache.u1.wallets', { w1: 1 })
  })

  it('reads every slice key into one snapshot', async () => {
    getItem.mockImplementation(async (key: string) => ({ 'finapp.cache.u1.trns': { t1: 1 }, 'finapp.cache.u1.wallets': { w1: 1 } } as Record<string, unknown>)[key] ?? null)

    expect(await readStoreCache()).toEqual({ trns: { t1: 1 }, wallets: { w1: 1 } })
  })

  it('splits the legacy blob into slice keys, keeping a slice persisted before the read', async () => {
    persistStoreCache('trns', { t2: 2 })
    getItem.mockImplementation(async (key: string) => key === 'finapp.cache.u1' ? { trns: { t1: 1 }, wallets: { w1: 1 } } : null)
    await readStoreCache()
    await vi.advanceTimersByTimeAsync(400)

    expect(setItem).toHaveBeenCalledWith('finapp.cache.u1.wallets', { w1: 1 })
    expect(setItem).not.toHaveBeenCalledWith('finapp.cache.u1.trns', { t1: 1 })
    expect(setItem).toHaveBeenLastCalledWith('finapp.cache.u1.trns', { t2: 2 })
    expect(removeItem).toHaveBeenCalledWith('finapp.cache.u1')
  })

  it('drops pending slices on clear', async () => {
    persistStoreCache('user', { name: 'a' })
    await clearStoreCache()
    await vi.advanceTimersByTimeAsync(400)

    expect(setItem).not.toHaveBeenCalled()
  })
})
