import type { CategoryItem } from '~/components/categories/types'
import type { CurrencyCode } from '~/components/currencies/types'
import type { LocaleSlug } from '~/components/locale/types'
import type { TrnItem } from '~/components/trns/types'
import type { WalletItem } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { clearOfflineQueue, getAllOfflineOps, getQueueUserId, removeOfflineOp, setOfflineQueueUserId, setQueueUserId } from '~/components/offline/helpers'
import { extractRemaps, groupOpsByEntity, isTrnOrphaned, remapTrnIds, splitCategoryOps } from '~/components/offline/replayHelpers'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { createLogger } from '~/utils/logger'

const logger = createLogger('offline/replay')

let _isReplaying = false

export function isReplaying(): boolean {
  return _isReplaying
}

async function collectRemaps(promises: (Promise<unknown> | void | undefined)[], remapIds: Map<string, string>) {
  const results = await Promise.all(promises.map(p => p ?? Promise.resolve()))
  for (const { convexId, localId } of extractRemaps(results)) {
    remapIds.set(localId, convexId)
  }
}

export async function replayOfflineQueue(): Promise<void> {
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

  // Filter out frontend-ID deletes and group by entity
  const filteredOps = []
  for (const op of queue) {
    if (isLocalId(op.id) && op.type === 'delete') {
      logger.log(`skip delete (frontend ID): ${op.entity}/${op.id}`)
      await removeOfflineOp(op.entity, op.id)
      continue
    }
    filteredOps.push(op)
  }

  const { categoryOps, settingsOps, trnOps, walletOps } = groupOpsByEntity(filteredOps)

  _isReplaying = true
  const remapIds = new Map<string, string>()
  let orphanCount = 0

  try {
    // Phase 1: Replay wallets
    if (walletOps.length > 0) {
      logger.log(`phase 1: ${walletOps.length} wallet ops`)
      const promises = walletOps.map((op) => {
        if (op.type === 'delete')
          return walletsStore.deleteWallet(op.id)
        return walletsStore.saveWallet({ id: op.id, values: op.data as unknown as WalletItem })
      })
      await collectRemaps(promises, remapIds)
    }

    // Phase 2: Replay categories — parents first, then children
    if (categoryOps.length > 0) {
      const { childOps, parentOps } = splitCategoryOps(categoryOps)

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

    // Phase 3: Replay trns — remap wallet/category IDs
    if (trnOps.length > 0) {
      logger.log(`phase 3: ${trnOps.length} trn ops`)
      for (const op of trnOps) {
        if (op.type === 'delete') {
          trnsStore.deleteTrn(op.id)
          continue
        }

        const data = op.data as unknown as TrnItem
        const remapped = remapTrnIds(data, remapIds)

        if (isTrnOrphaned(remapped, walletsStore.items ?? {}, categoriesStore.items)) {
          orphanCount++
          logger.log(`skip (orphaned): ${op.entity}/${op.id}`)
          await removeOfflineOp(op.entity, op.id)
          continue
        }

        trnsStore.saveTrn({ id: op.id, values: remapped })
      }
    }

    // Phase 4: Settings
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
