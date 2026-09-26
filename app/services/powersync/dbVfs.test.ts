// @vitest-environment happy-dom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const created: { vfs: string }[] = []

vi.mock('@powersync/web', () => {
  class PowerSyncDatabase {
    vfs: string

    constructor(options: { database: { vfs: string } }) {
      this.vfs = options.database.vfs
      created.push(this)
    }
  }
  return { LogLevels: { info: 30 }, PowerSyncDatabase, WASQLiteVFS: { IDBBatchAtomicVFS: 'IDBBatchAtomicVFS', OPFSWriteAheadVFS: 'OPFSWriteAheadVFS' } }
})
vi.mock('~~/services/powersync/AppSchema', () => ({ AppSchema: {} }))

const chrome = (version: string) => ({ onLine: true, storage: { getDirectory: () => {} }, userAgentData: { brands: [{ brand: 'Chromium', version }] } })

async function openDb() {
  const { getPowerSyncDb } = await import('~~/services/powersync/db')
  return await getPowerSyncDb() as unknown as (typeof created)[number]
}

beforeEach(() => {
  vi.resetModules()
  created.length = 0
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
  vi.stubGlobal('navigator', { onLine: true })
  expect((await openDb()).vfs).toBe('IDBBatchAtomicVFS')
})

it('opens OPFS on Chromium', async () => {
  vi.stubGlobal('navigator', chrome('140'))
  expect((await openDb()).vfs).toBe('OPFSWriteAheadVFS')
})
