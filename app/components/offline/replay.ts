import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { clearOfflineQueue, getAllOfflineOps, getQueueUserId, removeOfflineOp, setOfflineQueueUserId, setQueueUserId } from '~/components/offline/helpers'
import { groupOpsByEntity, replayCategoryOps, replaySettingsOps, replayTrnOps, replayWalletOps } from '~/components/offline/replayHelpers'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import type { LocaleSlug } from '~/components/locale/types'

import { isLocalId } from '~/utils/convexId'
import { createLogger } from '~/utils/logger'

const logger = createLogger('offline/replay')

let _isReplaying = false

export function isReplaying(): boolean {
  return _isReplaying
}

export async function replayOfflineQueue(): Promise<void> {
  if (_isReplaying)
    return

  const userStore = useUserStore()
  const currentUserId = userStore.uid

  try {
    const queueUserId = await getQueueUserId()
    if (queueUserId && queueUserId !== currentUserId) {
      logger.log(`queue belongs to ${queueUserId}, current user is ${currentUserId} — clearing`)
      await clearOfflineQueue()
      return
    }

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

  try {
    // Phase 1: Replay wallets
    if (walletOps.length > 0)
      logger.log(`phase 1: ${walletOps.length} wallet ops`)
    await replayWalletOps(walletOps, remapIds, {
      deleteWallet: id => walletsStore.deleteWallet(id),
      saveWallet: ({ id, values }) => walletsStore.saveWallet({ id, values }),
    })

    // Phase 2: Replay categories — parents first, then children
    if (categoryOps.length > 0)
      logger.log(`phase 2: ${categoryOps.length} category ops`)
    await replayCategoryOps(categoryOps, remapIds, {
      deleteCategory: id => categoriesStore.deleteCategory(id),
      saveCategory: params => categoriesStore.saveCategory(params),
    })

    // Phase 3: Replay trns — remap wallet/category IDs
    if (trnOps.length > 0)
      logger.log(`phase 3: ${trnOps.length} trn ops`)
    const orphanCount = await replayTrnOps(trnOps, remapIds, {
      deleteTrn: id => trnsStore.deleteTrn(id),
      removeOfflineOp: (entity, id) => removeOfflineOp(entity as Parameters<typeof removeOfflineOp>[0], id),
      saveTrn: params => trnsStore.saveTrn(params),
    }, {
      categoriesItems: categoriesStore.items,
      walletsItems: walletsStore.items ?? {},
    })

    // Phase 4: Replay settings
    await replaySettingsOps(settingsOps, {
      saveBaseCurrency: currency => userStore.saveUserBaseCurrency(currency),
      saveLocale: locale => userStore.saveUserLocale(locale as LocaleSlug),
    })

    if (orphanCount > 0) {
      const { showWarningToast } = await import('~/composables/useStoreSync')
      showWarningToast('trns.errors.orphanedSkipped', { count: orphanCount })
    }
  }
  finally {
    _isReplaying = false
  }

  if (remapIds.size > 0)
    logger.log(`replay complete: ${remapIds.size} IDs remapped`)
  else
    logger.log('replay complete')
}
