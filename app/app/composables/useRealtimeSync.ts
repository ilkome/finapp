import type { FunctionReference } from 'convex/server'

import localforage from 'localforage'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { hasAuthCookie } from '~/composables/useAuthCookie'
import { createLogger } from '~/utils/logger'

const logger = createLogger('realtime')
const RESTART_DELAY_MS = 1_000

export type RealtimeDelta<TDoc> = {
  deletedIds: string[]
  docs: TDoc[]
  serverTime: number
  truncated: boolean
}

export type SubscriptionHandle = {
  label: string
  stop: () => void
}

type ConvexOnUpdateClient = {
  onUpdate: <T>(query: FunctionReference<'query'>, args: Record<string, unknown>, cb: (value: T) => void, onError?: (e: Error) => void) => () => void
}

let _handles: SubscriptionHandle[] = []
let _restartInFlight = false
let _restartTimer: ReturnType<typeof setTimeout> | null = null

function clearPendingRestart(): void {
  if (!_restartTimer)
    return
  clearTimeout(_restartTimer)
  _restartTimer = null
}

function scheduleRealtimeRestart(reason: string): void {
  if (_restartTimer || _restartInFlight)
    return

  _restartTimer = setTimeout(() => {
    _restartTimer = null
    void restartAllRealtime(reason)
  }, RESTART_DELAY_MS)
}

async function restartAllRealtime(reason: string): Promise<void> {
  if (_restartInFlight)
    return
  if (!navigator.onLine || !hasAuthCookie())
    return

  _restartInFlight = true
  try {
    const { $waitForConvexAuth } = useNuxtApp()
    await ($waitForConvexAuth as () => Promise<void>)()
    if (!navigator.onLine || !hasAuthCookie())
      return
    await startAllRealtime()
    logger.log(`restarted subscriptions after ${reason}`)
  }
  catch (e) {
    logger.error(`restart after ${reason} failed`, e)
  }
  finally {
    _restartInFlight = false
  }
}

function handleSubscriptionError(label: string, error: Error): void {
  logger.warn(`${label}: subscription error, restarting realtime`, error.message)
  scheduleRealtimeRestart(label)
}

/**
 * Subscribe to a delta query. Convex keeps the subscription reactive — it
 * re-runs the query on the server whenever the dependent tables change and
 * pushes the updated result to `applyPatch`. No manual re-subscribe needed.
 *
 * `applyPatch` is expected to be idempotent (skip already-applied docs via
 * `updatedAt` monotonic check) because the server result accumulates all
 * changes since `initialSince`. A `truncated` flag signals the caller should
 * fall back to a fullSync; returning `null` from applyPatch stops the sub.
 */
export function subscribeDelta<TDoc>(opts: {
  applyPatch: (patch: RealtimeDelta<TDoc>) => Promise<number | null> | number | null
  client: ConvexOnUpdateClient
  initialSince: number
  label: string
  query: FunctionReference<'query'>
}): SubscriptionHandle {
  let stopped = false

  const stopInner = opts.client.onUpdate(opts.query, { since: opts.initialSince }, async (value: RealtimeDelta<TDoc> | null) => {
    if (!value || stopped)
      return
    if (value.truncated)
      logger.warn(`${opts.label}: truncated delta, caller should fullSync`)
    const next = await opts.applyPatch(value)
    if (next === null)
      stop()
  }, (error) => {
    if (stopped)
      return
    handleSubscriptionError(opts.label, error)
  })

  function stop(): void {
    stopped = true
    stopInner()
  }

  return { label: opts.label, stop }
}

export function stopAllRealtime(): void {
  clearPendingRestart()
  for (const h of _handles) {
    try {
      h.stop()
    }
    catch (e) {
      logger.warn(`stop ${h.label} failed`, e)
    }
  }
  if (_handles.length > 0)
    logger.log(`stopped ${_handles.length} subscriptions`)
  _handles = []
}

export async function startAllRealtime(): Promise<void> {
  stopAllRealtime()

  const { api, client } = useConvexClientWithApi()
  const onUpdateClient = client as unknown as ConvexOnUpdateClient

  const trnsStore = useTrnsStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const userStore = useUserStore()

  const trnsMeta = await localforage.getItem<{ lastSyncedAt: number }>(STORAGE_KEYS.trnsSyncMeta)
  const trnsSince = trnsMeta?.lastSyncedAt ?? Date.now()

  _handles.push(subscribeDelta({
    applyPatch: patch => trnsStore.applyRealtimePatch(patch as never),
    client: onUpdateClient,
    initialSince: trnsSince,
    label: 'trns',
    query: api.trns.deltaRealtime,
  }))

  _handles.push(subscribeDelta({
    applyPatch: patch => walletsStore.applyRealtimePatch(patch as never),
    client: onUpdateClient,
    initialSince: walletsStore.lastSyncedAt || Date.now(),
    label: 'wallets',
    query: api.wallets.deltaRealtime,
  }))

  _handles.push(subscribeDelta({
    applyPatch: patch => categoriesStore.applyRealtimePatch(patch as never),
    client: onUpdateClient,
    initialSince: categoriesStore.lastSyncedAt || Date.now(),
    label: 'categories',
    query: api.categories.deltaRealtime,
  }))

  const stopSettings = onUpdateClient.onUpdate(api.user.get, {}, (settings) => {
    userStore.applyRealtimeSettings(settings)
  }, (error) => {
    handleSubscriptionError('userSettings', error)
  })
  _handles.push({ label: 'userSettings', stop: stopSettings })

  logger.log(`started ${_handles.length} subscriptions`)
}
