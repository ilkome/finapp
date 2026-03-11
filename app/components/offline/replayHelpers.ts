import type { CategoryItem } from '~/components/categories/types'
import type { OfflineOp } from '~/components/offline/types'
import type { TrnItem } from '~/components/trns/types'

import { TrnType } from '~/components/trns/types'

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
    const data = op.data as unknown as CategoryItem
    if (!data.parentId || data.parentId === (0 as string | 0)) {
      parentOps.push(op)
    }
    else {
      childOps.push(op)
    }
  }

  return { childOps, parentOps }
}

/**
 * Extract remap entries (localId → convexId) from resolved promise results.
 */
export function extractRemaps(results: unknown[]): Array<{ convexId: string, localId: string }> {
  const remaps: Array<{ convexId: string, localId: string }> = []
  for (const r of results) {
    if (r && typeof r === 'object' && 'localId' in r && 'convexId' in r)
      remaps.push({ convexId: r.convexId as string, localId: r.localId as string })
  }
  return remaps
}
