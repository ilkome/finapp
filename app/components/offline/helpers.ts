import localforage from 'localforage'

import type { EntityType, OfflineOp, OfflineOpInput } from '~/components/offline/types'

import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { createLogger } from '~/utils/logger'

const QUEUE_KEY = STORAGE_KEYS.offlineQueue
const QUEUE_USER_KEY = STORAGE_KEYS.offlineQueueUserId

const logger = createLogger('offline')

let _currentUserId: string | null = null

export function setOfflineQueueUserId(userId: string | null): void {
  _currentUserId = userId
}

const OLD_KEYS = [
  'finapp.wallets.offline.update',
  'finapp.wallets.offline.delete',
  'finapp.categories.offline.update',
  'finapp.categories.offline.delete',
  'finapp.trns.offline.update',
  'finapp.trns.offline.delete',
]

let isOldKeysCleaned = false

async function cleanOldKeys() {
  if (isOldKeysCleaned)
    return
  isOldKeysCleaned = true
  for (const key of OLD_KEYS)
    await localforage.removeItem(key)
}

async function readQueue(): Promise<OfflineOp[]> {
  await cleanOldKeys()
  const raw = await localforage.getItem<OfflineOp[]>(QUEUE_KEY)
  return Array.isArray(raw) ? raw : []
}

async function writeQueue(queue: OfflineOp[]): Promise<void> {
  await localforage.setItem(QUEUE_KEY, queue)
}

/**
 * Collapsing rules (matching by entity + id):
 * | Existing | New    | Result                              |
 * |----------|--------|-------------------------------------|
 * | create   | update | create with merged data             |
 * | create   | delete | remove both (never reached server)  |
 * | update   | update | update with merged data             |
 * | update   | delete | replace update with delete          |
 * | delete   | *      | ignore new (delete is terminal)     |
 * | -        | *      | append as-is                        |
 */
let writeChain = Promise.resolve()

export function pushOfflineOp(op: OfflineOpInput): Promise<void> {
  writeChain = writeChain.then(() => pushOfflineOpImpl(op), () => pushOfflineOpImpl(op))
  return writeChain
}

async function pushOfflineOpImpl(op: OfflineOpInput): Promise<void> {
  if (_currentUserId) {
    const storedUserId = await localforage.getItem<string>(QUEUE_USER_KEY)
    if (!storedUserId)
      await localforage.setItem(QUEUE_USER_KEY, _currentUserId)
  }

  const queue = await readQueue()

  const existingIdx = findLastIndex(queue, o => o.entity === op.entity && o.id === op.id)

  if (existingIdx === -1) {
    queue.push({ ...op, timestamp: Date.now() })
    await writeQueue(queue)
    logger.log(`queued ${op.type}: ${op.entity}/${op.id}`)
    return
  }

  const existing = queue[existingIdx]!

  if (existing.type === 'delete') {
    logger.log(`skip ${op.type} (already deleted): ${op.entity}/${op.id}`)
    return
  }

  if (op.type === 'delete') {
    if (existing.type === 'create') {
      queue.splice(existingIdx, 1)
      logger.log(`collapsed create+delete (removed): ${op.entity}/${op.id}`)
    }
    else {
      queue[existingIdx] = { ...op, timestamp: Date.now() } as OfflineOp
      logger.log(`collapsed update→delete: ${op.entity}/${op.id}`)
    }
    await writeQueue(queue)
    return
  }

  queue[existingIdx] = {
    ...existing,
    data: { ...existing.data, ...op.data },
    timestamp: Date.now(),
  }
  await writeQueue(queue)
  logger.log(`collapsed ${existing.type}+${op.type}: ${op.entity}/${op.id}`)
}

export function removeOfflineOp(entity: EntityType, id: string): Promise<void> {
  writeChain = writeChain.then(() => removeOfflineOpImpl(entity, id), () => removeOfflineOpImpl(entity, id))
  return writeChain
}

async function removeOfflineOpImpl(entity: EntityType, id: string): Promise<void> {
  const queue = await readQueue()
  const filtered = queue.filter(o => !(o.entity === entity && o.id === id))
  if (filtered.length !== queue.length) {
    await writeQueue(filtered)
    logger.log(`synced: ${entity}/${id}`)
  }
}

export function removeOfflineOps(entity: EntityType, ids: string[]): Promise<void> {
  writeChain = writeChain.then(() => removeOfflineOpsImpl(entity, ids), () => removeOfflineOpsImpl(entity, ids))
  return writeChain
}

async function removeOfflineOpsImpl(entity: EntityType, ids: string[]): Promise<void> {
  const idSet = new Set(ids)
  const queue = await readQueue()
  const filtered = queue.filter(o => !(o.entity === entity && idSet.has(o.id)))
  if (filtered.length !== queue.length) {
    await writeQueue(filtered)
    logger.log(`synced ${ids.length} ops: ${entity}`)
  }
}

export function removeOfflineOpByType(entity: EntityType, id: string, type: OfflineOp['type']): Promise<void> {
  writeChain = writeChain.then(() => removeOfflineOpByTypeImpl(entity, id, type), () => removeOfflineOpByTypeImpl(entity, id, type))
  return writeChain
}

async function removeOfflineOpByTypeImpl(entity: EntityType, id: string, type: OfflineOp['type']): Promise<void> {
  const queue = await readQueue()
  const filtered = queue.filter(o => !(o.entity === entity && o.id === id && o.type === type))
  if (filtered.length !== queue.length) {
    await writeQueue(filtered)
    logger.log(`synced ${type}: ${entity}/${id}`)
  }
}

export async function getAllOfflineOps(): Promise<OfflineOp[]> {
  return readQueue()
}

export async function getOfflineOpsByEntity(entity: EntityType): Promise<OfflineOp[]> {
  const queue = await readQueue()
  return queue.filter(o => o.entity === entity)
}

export async function getQueueUserId(): Promise<string | null> {
  return localforage.getItem<string>(QUEUE_USER_KEY)
}

export async function setQueueUserId(userId: string): Promise<void> {
  await localforage.setItem(QUEUE_USER_KEY, userId)
}

export function clearOfflineQueue(): Promise<void> {
  writeChain = writeChain.then(() => clearOfflineQueueImpl(), () => clearOfflineQueueImpl())
  return writeChain
}

async function clearOfflineQueueImpl(): Promise<void> {
  await localforage.removeItem(QUEUE_KEY)
  await localforage.removeItem(QUEUE_USER_KEY)
  _currentUserId = null
  logger.log('queue cleared')
}

function findLastIndex<T>(arr: T[], predicate: (item: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i] as T))
      return i
  }
  return -1
}
