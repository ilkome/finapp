// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const created: { close: ReturnType<typeof vi.fn>, init: ReturnType<typeof vi.fn>, multiTab: boolean, vfs: string }[] = []
let legacyPending = 0

vi.mock('@powersync/web', () => {
  class PowerSyncDatabase {
    close = vi.fn(async () => {})
    getUploadQueueStats = vi.fn(async () => ({ count: legacyPending, size: null }))
    init = vi.fn(async () => {})
    multiTab: boolean
    vfs: string

    constructor(options: { database: { enableMultiTabs?: boolean, vfs: string } }) {
      this.multiTab = options.database.enableMultiTabs !== false
      this.vfs = options.database.vfs
      created.push(this)
    }
  }
  return { LogLevels: { info: 30 }, PowerSyncDatabase, WASQLiteVFS: { IDBBatchAtomicVFS: 'IDBBatchAtomicVFS', OPFSWriteAheadVFS: 'OPFSWriteAheadVFS' } }
})
vi.mock('~~/services/powersync/AppSchema', () => ({ AppSchema: {} }))

const chrome = (version: string) => ({ onLine: true, storage: { getDirectory: () => {} }, userAgentData: { brands: [{ brand: 'Chromium', version }] } })
const deleteDatabase = vi.fn(() => {
  const request: { onsuccess?: () => void } = {}
  queueMicrotask(() => request.onsuccess?.())
  return request
})

function setup(nav: object, idbNames: string[]) {
  vi.stubGlobal('navigator', nav)
  vi.stubGlobal('indexedDB', { databases: async () => idbNames.map(name => ({ name })), deleteDatabase })
}

async function openDb() {
  const { getPowerSyncDb } = await import('~~/services/powersync/db')
  return await getPowerSyncDb() as unknown as (typeof created)[number]
}

beforeEach(() => {
  vi.resetModules()
  created.length = 0
  legacyPending = 0
  deleteDatabase.mockClear()
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('supports OPFS WAL only on Chromium 121+ with OPFS', async () => {
  const { supportsOpfsWal } = await import('~~/services/powersync/db')
  expect(supportsOpfsWal(chrome('140') as never)).toBe(true)
  expect(supportsOpfsWal(chrome('120') as never)).toBe(false)
  expect(supportsOpfsWal({ ...chrome('140'), storage: {} } as never)).toBe(false)
  expect(supportsOpfsWal({ onLine: true, storage: { getDirectory: () => {} } } as never)).toBe(false)
})

it('stays on IndexedDB outside Chromium', async () => {
  setup({ onLine: true }, ['finapp.db'])
  expect((await openDb()).vfs).toBe('IDBBatchAtomicVFS')
  expect(created).toHaveLength(1)
})

it('opens OPFS directly on a device without the old IndexedDB db', async () => {
  setup(chrome('140'), [])
  expect((await openDb()).vfs).toBe('OPFSWriteAheadVFS')
  expect(created).toHaveLength(1)
})

it('moves to OPFS and drops the old db once its upload queue is empty', async () => {
  setup(chrome('140'), ['finapp.db'])
  const db = await openDb()
  expect(db.vfs).toBe('OPFSWriteAheadVFS')
  // The probe runs outside the shared worker, whose IndexedDB connection would outlive close().
  expect(created[0]).toMatchObject({ multiTab: false, vfs: 'IDBBatchAtomicVFS' })
  expect(created[0]!.close).toHaveBeenCalled()
  expect(deleteDatabase).toHaveBeenCalledWith('finapp.db')
})

it('keeps the old db while it still has ops to upload', async () => {
  legacyPending = 2
  setup(chrome('140'), ['finapp.db'])
  const db = await openDb()
  expect(created[0]!.close).toHaveBeenCalled()
  expect(db).toMatchObject({ multiTab: true, vfs: 'IDBBatchAtomicVFS' })
  expect(deleteDatabase).not.toHaveBeenCalled()
})

it('keeps the old db offline, without probing it', async () => {
  setup({ ...chrome('140'), onLine: false }, ['finapp.db'])
  const db = await openDb()
  expect(created).toHaveLength(1)
  expect(db).toMatchObject({ multiTab: true, vfs: 'IDBBatchAtomicVFS' })
  expect(deleteDatabase).not.toHaveBeenCalled()
})
