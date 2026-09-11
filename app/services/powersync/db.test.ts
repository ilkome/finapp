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
  return { LogLevels: { debug: 20, error: 50, info: 30, trace: 10, warn: 40 }, PowerSyncDatabase }
})
vi.mock('~~/services/powersync/AppSchema', () => ({ AppSchema: {} }))

const { getPendingUploadCount, getPowerSyncDb, initializePowerSyncDb, pausePowerSync, waitForUploadsDrained } = await import('~~/services/powersync/db')

describe('waitForUploadsDrained', () => {
  it('resolves 0 once the queue empties', async () => {
    getUploadQueueStats
      .mockResolvedValueOnce({ count: 2, size: null })
      .mockResolvedValueOnce({ count: 0, size: null })
    expect(await waitForUploadsDrained(2000)).toBe(0)
  })

  it('resolves the remaining count when the timeout passes', async () => {
    getUploadQueueStats.mockResolvedValue({ count: 3, size: null })
    expect(await waitForUploadsDrained(1)).toBe(3)
    getUploadQueueStats.mockResolvedValue({ count: 0, size: null })
  })
})

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
      logger: { log: expect.any(Function) },
      schema: {},
      sync: { worker: expect.any(String) },
    })
  })

  it('downgrades network failures to warn and keeps other errors at error', async () => {
    const { logger } = createDatabase.mock.calls[0]![0] as { logger: { log: (r: { error?: unknown, level: number, message: string }) => void } }
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    logger.log({ error: new TypeError('Failed to fetch'), level: 50, message: 'Caught exception when connecting' })
    logger.log({ level: 50, message: 'Schema mismatch' })

    expect(warn).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('[powersync]', 'Schema mismatch')
    error.mockRestore()
    warn.mockRestore()
  })
})

describe('waitForLocalDbOwner', () => {
  beforeEach(() => localStorage.clear())

  it('resolves at once when the db is unowned or owned by the same user', async () => {
    expect(await waitForLocalDbOwner('u1')).toBe(true)
    localStorage.setItem('finapp.psDbOwnerUid', 'u1')
    expect(await waitForLocalDbOwner('u1')).toBe(true)
  })

  it('waits for the foreign owner to be wiped, and gives up on timeout', async () => {
    localStorage.setItem('finapp.psDbOwnerUid', 'other')
    expect(await waitForLocalDbOwner('u1', 5)).toBe(false)

    const pending = waitForLocalDbOwner('u1', 1000)
    await pausePowerSync() // no-op for the owner; the wipe path below clears it
    await disconnectPowerSync()
    expect(await pending).toBe(true)
  })
})

describe('initializePowerSyncDb', () => {
  it('shares the in-flight initialization across concurrent callers', async () => {
    let resolveInit!: () => void
    init.mockImplementationOnce(() => new Promise<void>((resolve) => {
      resolveInit = resolve
    }))

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
