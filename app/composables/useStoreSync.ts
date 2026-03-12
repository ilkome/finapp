import type { ShallowRef } from 'vue'

import { debounce } from 'es-toolkit'
import localforage from 'localforage'

import type { EntityType } from '~/components/offline/types'

import { errorEmo, random, successEmo, warningEmo } from '~/assets/js/emo'
import { getOfflineOpsByEntity, pushOfflineOp, removeOfflineOp, removeOfflineOps } from '~/components/offline/helpers'
import { isReplaying } from '~/components/offline/replay'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { createLogger } from '~/utils/logger'

const logger = createLogger('store-sync')

/**
 * When true, all localforage persist operations are skipped.
 * Set by clearLocalData() to prevent in-flight store inits and mutation callbacks
 * from re-writing data after cleanup. Reset by loadDataFromDB().
 */
let _persistBlocked = false

export function blockPersist(): void {
  _persistBlocked = true
}

export function unblockPersist(): void {
  _persistBlocked = false
}

export function isPersistBlocked(): boolean {
  return _persistBlocked
}

export function createDebouncedPersist<T>(storageKey: string) {
  return debounce((values: T) => {
    if (_persistBlocked)
      return
    localforage.setItem(storageKey, values)
  }, 300)
}

export function pushSaveOp<T extends Record<string, unknown>>(opts: {
  entity: EntityType
  id: string
  isDemo: boolean
  isExisting: boolean
  values: T
}): boolean {
  if (opts.isDemo)
    return false

  const action = opts.isExisting ? 'update' : 'create'
  logger.log(`optimistic ${action}: ${opts.id}`)
  if (!isReplaying())
    pushOfflineOp({ data: opts.values, entity: opts.entity, id: opts.id, type: action })

  return true
}

export function pushDeleteOp(opts: {
  entity: EntityType
  id: string
  isDemo: boolean
}): boolean {
  if (opts.isDemo)
    return false

  logger.log(`optimistic delete: ${opts.id}`)
  if (!isReplaying())
    pushOfflineOp({ entity: opts.entity, id: opts.id, type: 'delete' })

  return true
}

/**
 * Merge pending offline ops on top of server data during store init.
 * Handles updates, deletes, and cleanup of stale frontend IDs.
 */
export async function mergeOfflineOps<T>(
  data: Record<string, T>,
  entity: EntityType,
): Promise<Record<string, T>> {
  const pendingOps = await getOfflineOpsByEntity(entity)

  const pendingUpdates: Record<string, T> = {}
  const pendingDeleteIds: string[] = []

  for (const op of pendingOps) {
    if (op.type === 'delete')
      pendingDeleteIds.push(op.id)
    else if (op.data)
      pendingUpdates[op.id] = op.data as unknown as T
  }

  const hasUpdates = Object.keys(pendingUpdates).length > 0
  const hasDeletes = pendingDeleteIds.length > 0

  if (hasUpdates || hasDeletes) {
    const merged = { ...data }
    for (const id of Object.keys(pendingUpdates))
      merged[id] = pendingUpdates[id]!
    for (const id of pendingDeleteIds)
      delete merged[id]
    data = merged
    logger.log(`init: merged ${Object.keys(pendingUpdates).length} updates, ${pendingDeleteIds.length} deletes`)
  }

  return cleanupFrontendIds(data, pendingUpdates)
}

export type RemapInfo = { convexId: string, localId: string }

/**
 * Handle mutation .then/.catch: remove offline op, remap frontend ID, toast errors.
 * Returns a promise that resolves with remap info (for creates) or void.
 */
export function handleMutationResult<T>(opts: {
  action: 'create' | 'delete' | 'update'
  entity: EntityType
  errorMessage: string
  id: string | string[]
  items?: ShallowRef<Record<string, T> | null>
  mutation: Promise<unknown>
}): Promise<RemapInfo | void> {
  const ids = Array.isArray(opts.id) ? opts.id : [opts.id]

  return opts.mutation
    .then(async (result): Promise<RemapInfo | void> => {
      logger.log(`confirmed ${opts.action}: ${ids.length > 1 ? `${ids.length} items` : ids[0]}`)

      if (ids.length === 1)
        await removeOfflineOp(opts.entity, ids[0]!)
      else
        await removeOfflineOps(opts.entity, ids)

      // Remap frontend ID to Convex ID for new items (single create only)
      if (opts.action === 'create' && !Array.isArray(opts.id) && result && opts.items) {
        const convexId = String(result)
        const current = opts.items.value
        if (current && opts.id in current && opts.id !== convexId) {
          const { [opts.id]: item, ...rest } = current
          const remapped = { ...rest, [convexId]: item } as Record<string, T>
          opts.items.value = remapped
          if (!_persistBlocked)
            localforage.setItem(STORAGE_KEYS[opts.entity], remapped)
          logger.log(`remapped ID: ${opts.id} → ${convexId}`)
          return { convexId, localId: opts.id }
        }
      }
    })
    .catch((e) => {
      logger.error(`${opts.action} failed: ${ids.length > 1 ? `${ids.length} items` : ids[0]}`, e)
      showErrorToast(opts.errorMessage)
    })
}

let _toast: ReturnType<typeof useToast> | null = null
let _t: ((key: string, params?: Record<string, unknown>) => string) | null = null

function getToast() {
  if (!_toast)
    _toast = useToast()
  return _toast
}

function getT() {
  if (!_t) {
    const app = tryUseNuxtApp()
    if (app?.$i18n?.t)
      _t = app.$i18n.t
  }
  return _t
}

export function showErrorToast(key: string, params?: Record<string, unknown>) {
  const toast = getToast()
  const t = getT()
  const id = toast.add({ color: 'error', description: t ? t(key, params ?? {}) : key, title: random(errorEmo) })
  return id
}

export function showSuccessToast(key: string, params?: Record<string, unknown>) {
  const toast = getToast()
  const t = getT()
  const id = toast.add({ color: 'success', description: t ? t(key, params ?? {}) : key, title: random(successEmo) })
  return id
}

export function showWarningToast(key: string, params?: Record<string, unknown>) {
  const toast = getToast()
  const t = getT()
  const id = toast.add({ color: 'warning', description: t ? t(key, params ?? {}) : key, title: random(warningEmo) })
  return id
}
