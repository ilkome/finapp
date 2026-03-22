import { z } from 'zod/v4'

import type { CategoryItem } from '~/components/categories/types'
import type { OfflineOp } from '~/components/offline/types'
import type { TrnItem } from '~/components/trns/types'
import type { WalletItem } from '~/components/wallets/types'

import { categoryFormSchema } from '~/components/categories/types'
import { localeSchema } from '~/components/locale/types'
import { removeOfflineOp } from '~/components/offline/helpers'
import { OfflineEntityType } from '~/components/offline/types'
import { trnItemSchema, TrnType } from '~/components/trns/types'
import { walletItemSchema } from '~/components/wallets/types'
import { createLogger } from '~/utils/logger'

const logger = createLogger('offline/replayHelpers')

const categoryItemSchema = categoryFormSchema.extend({
  updatedAt: z.number().optional(),
})

const settingsSchema = z.object({
  baseCurrency: z.string().min(1).optional(),
  locale: localeSchema.optional(),
}).passthrough()

/**
 * Validate offline op data against a Zod schema.
 * Returns parsed data on success, or null if validation fails (logs warning and removes op).
 */
async function validateOpData<T>(
  op: OfflineOp,
  schema: z.ZodType<T>,
  label: string,
): Promise<T | null> {
  const result = schema.safeParse(op.data)
  if (result.success)
    return result.data

  logger.warn(`corrupted ${label} data, removing op ${op.entity}/${op.id}:`, result.error.issues)
  await removeOfflineOp(op.entity, op.id)
  return null
}

/**
 * Remap local IDs in trn data using the collected remap map.
 */
export function remapTrnIds(data: TrnItem, remapIds: Map<string, string>): TrnItem {
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
 * Check if a trn references wallets/categories that don't exist.
 */
export function isTrnOrphaned(
  data: TrnItem,
  walletsItems: Record<string, unknown>,
  categoriesItems: Record<string, unknown>,
): boolean {
  if (data.type === TrnType.Transfer)
    return !walletsItems[data.expenseWalletId] || !walletsItems[data.incomeWalletId]
  return !walletsItems[data.walletId] || !categoriesItems[data.categoryId]
}

type GroupedOps = {
  categoryOps: OfflineOp[]
  settingsOps: OfflineOp[]
  trnOps: OfflineOp[]
  walletOps: OfflineOp[]
}

/**
 * Group offline operations by entity type.
 */
export function groupOpsByEntity(ops: OfflineOp[]): GroupedOps {
  const walletOps: OfflineOp[] = []
  const categoryOps: OfflineOp[] = []
  const trnOps: OfflineOp[] = []
  const settingsOps: OfflineOp[] = []

  for (const op of ops) {
    switch (op.entity) {
      case OfflineEntityType.Wallets:
        walletOps.push(op)
        break
      case OfflineEntityType.Categories:
        categoryOps.push(op)
        break
      case OfflineEntityType.Trns:
        trnOps.push(op)
        break
      case OfflineEntityType.UserSettings:
        settingsOps.push(op)
        break
    }
  }

  return { categoryOps, settingsOps, trnOps, walletOps }
}

/**
 * Split category ops into parent-first and child-second groups.
 * Delete ops go into parents (processed first).
 */
export function splitCategoryOps(ops: OfflineOp[]): {
  childOps: OfflineOp[]
  parentOps: OfflineOp[]
} {
  const parentOps: OfflineOp[] = []
  const childOps: OfflineOp[] = []

  for (const op of ops) {
    if (op.type === 'delete') {
      parentOps.push(op)
      continue
    }
    const data = op.data as Record<string, unknown> | undefined
    const parentId = data?.parentId
    if (!parentId || parentId === 0) {
      parentOps.push(op)
    }
    else {
      childOps.push(op)
    }
  }

  return { childOps, parentOps }
}

/**
 * Extract remap entries (localId -> convexId) from resolved promise results.
 */
export function extractRemaps(results: unknown[]): Array<{ convexId: string, localId: string }> {
  const remaps: Array<{ convexId: string, localId: string }> = []
  for (const r of results) {
    if (r && typeof r === 'object' && 'localId' in r && 'convexId' in r)
      remaps.push({ convexId: r.convexId as string, localId: r.localId as string })
  }
  return remaps
}

// --- Per-entity replay functions ---

/**
 * Collect remap entries from resolved promises into the remap map.
 */
export async function collectRemaps(promises: (Promise<unknown> | void | undefined)[], remapIds: Map<string, string>): Promise<void> {
  const results = await Promise.all(promises.map(p => p ?? Promise.resolve()))
  for (const { convexId, localId } of extractRemaps(results)) {
    remapIds.set(localId, convexId)
  }
}

type WalletActions = {
  deleteWallet: (id: string) => Promise<unknown> | void | undefined
  saveWallet: (params: { id: string, values: WalletItem }) => Promise<unknown> | void | undefined
}

/**
 * Replay wallet operations: save or delete each wallet, collecting ID remaps.
 */
export async function replayWalletOps(ops: OfflineOp[], remapIds: Map<string, string>, actions: WalletActions): Promise<void> {
  if (ops.length === 0)
    return

  const promises: (Promise<unknown> | void | undefined)[] = []
  for (const op of ops) {
    if (op.type === 'delete') {
      promises.push(actions.deleteWallet(op.id))
      continue
    }
    const values = await validateOpData<WalletItem>(op, walletItemSchema, 'wallet')
    if (!values)
      continue
    promises.push(actions.saveWallet({ id: op.id, values }))
  }
  await collectRemaps(promises, remapIds)
}

type CategoryActions = {
  deleteCategory: (id: string) => Promise<unknown> | void | undefined
  saveCategory: (params: { id: string, isUpdateChildCategoriesColor: boolean, values: CategoryItem }) => Promise<unknown> | void | undefined
}

/**
 * Replay category operations: parents first, then children (with parentId remapping).
 * Collects ID remaps after each sub-phase.
 */
export async function replayCategoryOps(ops: OfflineOp[], remapIds: Map<string, string>, actions: CategoryActions): Promise<void> {
  if (ops.length === 0)
    return

  const { childOps, parentOps } = splitCategoryOps(ops)

  // Parents first
  if (parentOps.length > 0) {
    const promises: (Promise<unknown> | void | undefined)[] = []
    for (const op of parentOps) {
      if (op.type === 'delete') {
        promises.push(actions.deleteCategory(op.id))
        continue
      }
      const values = await validateOpData<CategoryItem>(op, categoryItemSchema, 'category')
      if (!values)
        continue
      promises.push(actions.saveCategory({
        id: op.id,
        isUpdateChildCategoriesColor: false,
        values,
      }))
    }
    await collectRemaps(promises, remapIds)
  }

  // Children second (remap parentId if needed)
  if (childOps.length > 0) {
    const promises: (Promise<unknown> | void | undefined)[] = []
    for (const op of childOps) {
      const data = await validateOpData<CategoryItem>(op, categoryItemSchema, 'category')
      if (!data)
        continue
      const remappedParentId = remapIds.get(String(data.parentId)) ?? data.parentId
      const values = remappedParentId !== data.parentId
        ? { ...data, parentId: remappedParentId }
        : data
      promises.push(actions.saveCategory({
        id: op.id,
        isUpdateChildCategoriesColor: false,
        values,
      }))
    }
    await collectRemaps(promises, remapIds)
  }
}

type TrnActions = {
  deleteTrn: (id: string) => void
  removeOfflineOp: (entity: string, id: string) => Promise<void>
  saveTrn: (params: { id: string, values: TrnItem }) => void
}

type TrnContext = {
  categoriesItems: Record<string, unknown>
  walletsItems: Record<string, unknown>
}

/**
 * Replay trn operations: remap wallet/category IDs, skip orphaned trns.
 * Returns the number of orphaned trns that were skipped.
 */
export async function replayTrnOps(ops: OfflineOp[], remapIds: Map<string, string>, actions: TrnActions, context: TrnContext): Promise<number> {
  if (ops.length === 0)
    return 0

  let orphanCount = 0

  for (const op of ops) {
    if (op.type === 'delete') {
      actions.deleteTrn(op.id)
      continue
    }

    const data = await validateOpData<TrnItem>(op, trnItemSchema, 'trn')
    if (!data)
      continue

    const remapped = remapTrnIds(data, remapIds)

    if (isTrnOrphaned(remapped, context.walletsItems, context.categoriesItems)) {
      orphanCount++
      try {
        await actions.removeOfflineOp(op.entity, op.id)
      }
      catch (e) {
        logger.warn(`failed to remove orphan op ${op.entity}/${op.id}:`, e)
      }
      continue
    }

    actions.saveTrn({ id: op.id, values: remapped })
  }

  return orphanCount
}

type SettingsActions = {
  saveBaseCurrency: (currency: string) => void
  saveLocale: (locale: string) => void
}

/**
 * Replay user settings operations: validate and apply base currency and locale changes.
 */
export async function replaySettingsOps(ops: OfflineOp[], actions: SettingsActions): Promise<void> {
  for (const op of ops) {
    const settings = await validateOpData(op, settingsSchema, 'settings')
    if (!settings)
      continue
    if (settings.baseCurrency)
      actions.saveBaseCurrency(settings.baseCurrency)
    if (settings.locale)
      actions.saveLocale(settings.locale)
  }
}
