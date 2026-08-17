import { z } from 'zod/v4'

import type { StatNavigationReadOptions, StatNavigationSnapshot, StatNavigationSnapshotInput, StatNavigationStorageOptions } from '~/components/stat/navigation/types'

import { STAT_NAVIGATION_SNAPSHOT_VERSION, statNavigationSnapshotSchema } from '~/components/stat/navigation/schema'

const SNAPSHOT_PREFIX = 'finapp.statNavigation.'
const SNAPSHOT_INDEX_KEY = `${SNAPSHOT_PREFIX}index`
const MAX_SNAPSHOTS = 10
const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000

const snapshotIndexSchema = z.array(z.object({
  createdAt: z.number(),
  id: z.string(),
}))

type SnapshotIndex = z.infer<typeof snapshotIndexSchema>

function getDefaultStorage(): Storage | null {
  return typeof sessionStorage === 'undefined' ? null : sessionStorage
}

function resolveStorage(options: { storage?: Storage | null }): Storage | null {
  return Object.hasOwn(options, 'storage') ? options.storage ?? null : getDefaultStorage()
}

function snapshotKey(id: string) {
  return `${SNAPSHOT_PREFIX}${id}`
}

function parseIndex(storage: Storage): SnapshotIndex {
  try {
    const parsed = snapshotIndexSchema.safeParse(JSON.parse(storage.getItem(SNAPSHOT_INDEX_KEY) ?? '[]'))
    return parsed.success ? parsed.data : []
  }
  catch {
    return []
  }
}

function writeIndex(storage: Storage, index: SnapshotIndex) {
  storage.setItem(SNAPSHOT_INDEX_KEY, JSON.stringify(index))
}

function removeSnapshot(storage: Storage, id: string) {
  storage.removeItem(snapshotKey(id))
  writeIndex(storage, parseIndex(storage).filter(item => item.id !== id))
}

function tryRemoveSnapshot(storage: Storage, id: string) {
  try {
    removeSnapshot(storage, id)
  }
  catch {}
}

function pruneSnapshots(storage: Storage, now: number, currentId: string) {
  const indexed = parseIndex(storage)
  const valid = indexed
    .filter(item => item.id === currentId || now - item.createdAt <= SNAPSHOT_TTL_MS)
    .sort((a, b) => b.createdAt - a.createdAt)
  const keep = valid.slice(0, MAX_SNAPSHOTS)
  const keepIds = new Set(keep.map(item => item.id))

  for (const item of indexed) {
    if (!keepIds.has(item.id))
      storage.removeItem(snapshotKey(item.id))
  }
  writeIndex(storage, keep)
}

export function saveStatNavigationSnapshot(
  value: StatNavigationSnapshotInput,
  options: StatNavigationStorageOptions = {},
): string | null {
  const storage = resolveStorage(options)
  if (!storage)
    return null

  let id: string | null = null
  try {
    id = options.id ?? crypto.randomUUID()
    const createdAt = options.now ?? Date.now()
    const parsed = statNavigationSnapshotSchema.safeParse({
      ...JSON.parse(JSON.stringify(value)),
      createdAt,
      version: STAT_NAVIGATION_SNAPSHOT_VERSION,
    })
    if (!parsed.success)
      return null

    storage.setItem(snapshotKey(id), JSON.stringify(parsed.data))
    const nextIndex = parseIndex(storage).filter(item => item.id !== id)
    nextIndex.push({ createdAt, id })
    writeIndex(storage, nextIndex)
    pruneSnapshots(storage, createdAt, id)
    return id
  }
  catch {
    if (id)
      tryRemoveSnapshot(storage, id)
    return null
  }
}

export function getStatNavigationSnapshot(
  id: string | null | undefined,
  options: StatNavigationReadOptions = {},
): StatNavigationSnapshot | null {
  const storage = resolveStorage(options)
  if (!id || !storage)
    return null

  try {
    const stored = storage.getItem(snapshotKey(id))
    if (stored === null)
      return null
    const parsed = statNavigationSnapshotSchema.safeParse(JSON.parse(stored))
    if (!parsed.success) {
      tryRemoveSnapshot(storage, id)
      return null
    }
    if ((options.now ?? Date.now()) - parsed.data.createdAt > SNAPSHOT_TTL_MS) {
      removeSnapshot(storage, id)
      return null
    }
    return structuredClone(parsed.data)
  }
  catch {
    tryRemoveSnapshot(storage, id)
    return null
  }
}

export function getStatSnapshotQueryId(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}
