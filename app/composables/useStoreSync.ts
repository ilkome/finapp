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

// Tracks ids of mutations currently being confirmed by the server. Used by
// the realtime-sync layer to suppress self-echo: subscription updates whose
// id is in-flight are skipped so the origin device doesn't apply its own change twice.
const _inFlightOps = new Set<string>()

export function trackInFlight(id: string): void {
  _inFlightOps.add(id)
}

export function untrackInFlight(id: string): void {
  _inFlightOps.delete(id)
}

export function isInFlight(id: string): boolean {
  return _inFlightOps.has(id)
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

export function handleMutationResult<T>(opts: {
  action: 'create' | 'delete' | 'update'
  entity: EntityType
  errorMessage: string
  id: string | string[]
  items?: ShallowRef<Record<string, T> | null>
  mutation: Promise<unknown>
}): Promise<RemapInfo | void> {
  const ids = Array.isArray(opts.id) ? opts.id : [opts.id]

  // Track ids as in-flight so that the subscription's own echo (for update/delete
  // this is the convex id already; for create the local id won't match, but the
  // post-mutation remap handles that path).
  for (const id of ids) trackInFlight(id)

  return opts.mutation
    .then(async (result): Promise<RemapInfo | void> => {
      logger.log(`confirmed ${opts.action}: ${ids.length > 1 ? `${ids.length} items` : ids[0]}`)

      if (ids.length === 1)
        await removeOfflineOp(opts.entity, ids[0]!)
      else
        await removeOfflineOps(opts.entity, ids)

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
          // Track convex id briefly so that a subscription echo arriving just
          // after remap is still suppressed.
          trackInFlight(convexId)
          setTimeout(untrackInFlight, 2000, convexId)
          return { convexId, localId: opts.id }
        }
      }
    })
    .catch((e) => {
      logger.error(`${opts.action} failed: ${ids.length > 1 ? `${ids.length} items` : ids[0]}`, e)
      showErrorToast(opts.errorMessage)
    })
    .finally(() => {
      for (const id of ids) untrackInFlight(id)
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

const emoByType = {
  error: errorEmo,
  success: successEmo,
  warning: warningEmo,
} as const

type ToastType = keyof typeof emoByType

export function showToast(type: ToastType, key: string, params?: Record<string, unknown>) {
  const toast = getToast()
  const t = getT()
  return toast.add({ color: type, description: t ? t(key, params ?? {}) : key, title: random(emoByType[type]) })
}

export function showErrorToast(key: string, params?: Record<string, unknown>) {
  return showToast('error', key, params)
}

export function showSuccessToast(key: string, params?: Record<string, unknown>) {
  return showToast('success', key, params)
}

export function showWarningToast(key: string, params?: Record<string, unknown>) {
  return showToast('warning', key, params)
}
