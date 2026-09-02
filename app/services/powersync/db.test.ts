import { beforeEach, describe, expect, it, vi } from 'vitest'

// Spies shared across the fake PowerSyncDatabase instances so assertions can reach them.
const disconnect = vi.fn(async () => {})
const disconnectAndClear = vi.fn(async () => {})
const getUploadQueueStats = vi.fn(async () => ({ count: 0, size: null }))
const init = vi.fn(async () => {})
const createDatabase = vi.fn()

vi.mock('@powersync/web', () => {
  class PowerSyncDatabase {
    disconnect = disconnect
    disconnectAndClear = disconnectAndClear
    getUploadQueueStats = getUploadQueueStats
    init = init

    constructor(options: unknown) {
      createDatabase(options)
    }
  }
  return { PowerSyncDatabase }
})
vi.mock('~~/services/powersync/AppSchema', () => ({ AppSchema: {} }))

const { getPendingUploadCount, getPowerSyncDb, initializePowerSyncDb, pausePowerSync } = await import('~~/services/powersync/db')

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

describe('getPowerSyncDb', () => {
  it('uses the PowerSync 2 database options API', async () => {
    await getPowerSyncDb()
    expect(createDatabase).toHaveBeenCalledWith({
      database: { dbFilename: 'finapp.db', worker: expect.any(String) },
      schema: {},
      sync: { worker: expect.any(String) },
    })
  })
})

describe('initializePowerSyncDb', () => {
  it('shares the in-flight initialization across concurrent callers', async () => {
    let resolveInit!: () => void
    init.mockImplementationOnce(() => new Promise<void>((resolve) => { resolveInit = resolve }))

    const first = initializePowerSyncDb()
    const second = initializePowerSyncDb()
    await vi.waitFor(() => expect(init).toHaveBeenCalledTimes(1))

    resolveInit()
    await expect(Promise.all([first, second])).resolves.toEqual([undefined, undefined])
  })
})

describe('getPendingUploadCount', () => {
  it('returns the local upload-queue count', async () => {
    getUploadQueueStats.mockResolvedValueOnce({ count: 3, size: null })
    expect(await getPendingUploadCount()).toBe(3)
  })
})
