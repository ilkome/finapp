import { beforeEach, describe, expect, it, vi } from 'vitest'

// Spies shared across the fake PowerSyncDatabase instances so assertions can reach them.
const disconnect = vi.fn(async () => {})
const disconnectAndClear = vi.fn(async () => {})
const getUploadQueueStats = vi.fn(async () => ({ count: 0, size: null }))

vi.mock('@powersync/web', () => {
  class PowerSyncDatabase {
    disconnect = disconnect
    disconnectAndClear = disconnectAndClear
    getUploadQueueStats = getUploadQueueStats
  }
  class WASQLiteOpenFactory {}
  return { PowerSyncDatabase, WASQLiteOpenFactory, WASQLiteVFS: { IDBBatchAtomicVFS: 'idb' } }
})
vi.mock('~~/services/powersync/AppSchema', () => ({ AppSchema: {} }))

const { getPendingUploadCount, getPowerSyncDb, pausePowerSync } = await import('~~/services/powersync/db')

describe('pausePowerSync', () => {
  beforeEach(() => {
    disconnect.mockClear()
    disconnectAndClear.mockClear()
  })

  it('disconnects but keeps local data (never disconnectAndClear)', async () => {
    await getPowerSyncDb() // populate the singleton so pausePowerSync has a db
    await pausePowerSync()
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(disconnectAndClear).not.toHaveBeenCalled()
  })
})

describe('getPendingUploadCount', () => {
  it('returns the local upload-queue count', async () => {
    getUploadQueueStats.mockResolvedValueOnce({ count: 3, size: null })
    expect(await getPendingUploadCount()).toBe(3)
  })
})
