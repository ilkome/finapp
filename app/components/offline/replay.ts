import type { CategoryItem } from '~/components/categories/types'
import type { CurrencyCode } from '~/components/currencies/types'
import type { LocaleSlug } from '~/components/locale/types'
import type { OfflineOp } from '~/components/offline/types'
import type { TrnItem } from '~/components/trns/types'
import type { WalletItem } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { clearOfflineQueue, getAllOfflineOps, getQueueUserId, removeOfflineOp, setOfflineQueueUserId, setQueueUserId } from '~/components/offline/helpers'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { createLogger } from '~/utils/logger'

const logger = createLogger('offline/replay')

let _isReplaying = false

export function isReplaying(): boolean {
  return _isReplaying
}

/**
 * Remap local IDs in trn data using the collected remap map.
 */
function remapTrnIds(data: TrnItem, remapIds: Map<string, string>): TrnItem {
  if (data.type === TrnType.Transfer) {
    return {
      ...data,
      expenseWalletId: remapIds.get(data.expenseWalletId) ?? data.expenseWalletId,
      incomeWalletId: remapIds.get(data.incomeWalletId) ?? data.incomeWalletId,
    }
  }
  return {
    ...data,
    categoryId: remapIds.get(data.categoryId) ?? data.categoryId,
    walletId: remapIds.get(data.walletId) ?? data.walletId,
  }
}

/**
 * Check if a trn references wallets/categories that don't exist in the store.
 */
function isTrnOrphaned(data: TrnItem, walletsStore: ReturnType<typeof useWalletsStore>, categoriesStore: ReturnType<typeof useCategoriesStore>): boolean {
  if (data.type === TrnType.Transfer)
    return !walletsStore.items?.[data.expenseWalletId] || !walletsStore.items?.[data.incomeWalletId]
  return !walletsStore.items?.[data.walletId] || !categoriesStore.items[data.categoryId]
}

/**
 * Collect remap info from resolved promises into the remap map.
 */
async function collectRemaps(promises: (Promise<unknown> | undefined)[], remapIds: Map<string, string>) {
  const results = await Promise.all(promises.map(p => p ?? Promise.resolve()))
  for (const r of results) {
    if (r && typeof r === 'object' && 'localId' in r && 'convexId' in r)
      remapIds.set(r.localId as string, r.convexId as string)
  }
}

export async function replayOfflineQueue(): Promise<void> {
  if (!import.meta.client)
    return

  if (_isReplaying)
    return

  const userStore = useUserStore()
  const currentUserId = userStore.uid

  // Verify queue ownership — don't replay another user's queue
  try {
    const queueUserId = await getQueueUserId()
    if (queueUserId && queueUserId !== currentUserId) {
      logger.log(`queue belongs to ${queueUserId}, current user is ${currentUserId} — clearing`)
      await clearOfflineQueue()
      return
    }

    // Set ownership for future ops (both in-memory and persisted)
    if (currentUserId) {
      setOfflineQueueUserId(currentUserId)
      await setQueueUserId(currentUserId)
    }
  }
  catch (e) {
    logger.error('queue ownership check failed, clearing queue for safety', e)
    await clearOfflineQueue().catch(() => {})
    return
  }

  const queue = await getAllOfflineOps()
  if (!queue.length)
    return

  logger.log(`replaying ${queue.length} operations`)

  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  // Group operations by entity
  const walletOps: OfflineOp[] = []
  const categoryOps: OfflineOp[] = []
  const trnOps: OfflineOp[] = []
  const settingsOps: OfflineOp[] = []

  for (const op of queue) {
    // Frontend IDs: skip deletes (nothing to delete on server)
    if (isLocalId(op.id) && op.type === 'delete') {
      logger.log(`skip delete (frontend ID): ${op.entity}/${op.id}`)
      await removeOfflineOp(op.entity, op.id)
      continue
    }

    switch (op.entity) {
      case 'wallets':
        walletOps.push(op)
        break
      case 'categories':
        categoryOps.push(op)
        break
      case 'trns':
        trnOps.push(op)
        break
      case 'userSettings':
        settingsOps.push(op)
        break
    }
  }

  _isReplaying = true
  const remapIds = new Map<string, string>()
  let orphanCount = 0

  try {
    // Phase 1: Replay wallets — creates & updates in parallel, await all, collect remaps
    if (walletOps.length > 0) {
      logger.log(`phase 1: ${walletOps.length} wallet ops`)
      const promises = walletOps.map((op) => {
        if (op.type === 'delete')
          return walletsStore.deleteWallet(op.id)
        return walletsStore.saveWallet({ id: op.id, values: op.data as unknown as WalletItem })
      })
      await collectRemaps(promises, remapIds)
    }

    // Phase 2: Replay categories — parents first, then children (children may reference local parent IDs)
    if (categoryOps.length > 0) {
      const parentOps = categoryOps.filter((op) => {
        if (op.type === 'delete')
          return true
        const data = op.data as unknown as CategoryItem
        return !data.parentId || data.parentId === 0
      })
      const childOps = categoryOps.filter((op) => {
        if (op.type === 'delete')
          return false
        const data = op.data as unknown as CategoryItem
        return data.parentId && data.parentId !== 0
      })

      // Phase 2a: Parent categories
      if (parentOps.length > 0) {
        logger.log(`phase 2a: ${parentOps.length} parent category ops`)
        const promises = parentOps.map((op) => {
          if (op.type === 'delete')
            return categoriesStore.deleteCategory(op.id)
          return categoriesStore.saveCategory({
            id: op.id,
            isUpdateChildCategoriesColor: false,
            values: op.data as unknown as CategoryItem,
          })
        })
        await collectRemaps(promises, remapIds)
      }

      // Phase 2b: Child categories (remap parentId if needed)
      if (childOps.length > 0) {
        logger.log(`phase 2b: ${childOps.length} child category ops`)
        const promises = childOps.map((op) => {
          const data = op.data as unknown as CategoryItem
          const remappedParentId = remapIds.get(String(data.parentId)) ?? data.parentId
          const values = remappedParentId !== data.parentId
            ? { ...data, parentId: remappedParentId }
            : data
          return categoriesStore.saveCategory({
            id: op.id,
            isUpdateChildCategoriesColor: false,
            values: values as CategoryItem,
          })
        })
        await collectRemaps(promises, remapIds)
      }
    }

    // Phase 3: Replay trns — remap wallet/category IDs, fire-and-forget
    if (trnOps.length > 0) {
      logger.log(`phase 3: ${trnOps.length} trn ops`)
      for (const op of trnOps) {
        if (op.type === 'delete') {
          trnsStore.deleteTrn(op.id)
          continue
        }

        const data = op.data as unknown as TrnItem
        const remapped = remapTrnIds(data, remapIds)

        // Orphan detection with remapped IDs
        if (isTrnOrphaned(remapped, walletsStore, categoriesStore)) {
          orphanCount++
          logger.log(`skip (orphaned): ${op.entity}/${op.id}`)
          await removeOfflineOp(op.entity, op.id)
          continue
        }

        trnsStore.saveTrn({ id: op.id, values: remapped })
      }
    }

    // Phase 4: Settings — fire-and-forget
    for (const op of settingsOps) {
      if (op.data?.baseCurrency)
        userStore.saveUserBaseCurrency(op.data.baseCurrency as CurrencyCode)
      if (op.data?.locale)
        userStore.saveUserLocale(op.data.locale as LocaleSlug)
    }
  }
  finally {
    _isReplaying = false
  }

  if (orphanCount > 0) {
    const { showWarningToast } = await import('~/composables/useStoreSync')
    showWarningToast('trns.errors.orphanedSkipped', { count: orphanCount })
  }

  if (remapIds.size > 0)
    logger.log(`replay complete: ${remapIds.size} IDs remapped`)
  else
    logger.log('replay complete')
}
