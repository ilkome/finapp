import type { CategoryId } from '~/components/categories/types'
import type { HistoryAmountFilter, HistoryDateFilter, HistoryDescriptionFilter, TransactionHistoryRow } from '~/components/trns/history/types'
import type { TrnsViewType } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

export function matchesHistorySearch(row: TransactionHistoryRow, search: string): boolean {
  const query = search.trim().toLocaleLowerCase()
  if (!query)
    return true

  return [row.description, row.categoryPath, row.walletLabel]
    .some(value => value.toLocaleLowerCase().includes(query))
}

export function matchesHistoryType(row: TransactionHistoryRow, type: TrnsViewType): boolean {
  return type === 'all' || row.type === type
}

export function matchesHistoryWallets(row: TransactionHistoryRow, walletIds: WalletId[]): boolean {
  if (!walletIds.length)
    return true
  const selected = new Set(walletIds)
  return row.walletIds.some(id => selected.has(id))
}

export function matchesHistoryCategories(row: TransactionHistoryRow, categoryIds: CategoryId[]): boolean {
  return !categoryIds.length || categoryIds.includes(row.categoryId)
}

export function matchesHistoryDescription(row: TransactionHistoryRow, filter: HistoryDescriptionFilter): boolean {
  if (filter === 'all')
    return true
  return filter === 'with' ? !!row.description.trim() : !row.description.trim()
}

export function matchesHistoryDate(row: TransactionHistoryRow, filter: HistoryDateFilter): boolean {
  if (filter.start !== undefined && row.date < filter.start)
    return false
  return filter.end === undefined || row.date <= filter.end
}

export function matchesHistoryAmount(row: TransactionHistoryRow, filter: HistoryAmountFilter): boolean {
  if (filter.min === undefined && filter.max === undefined)
    return true
  if (row.amountInBase === null)
    return false
  if (filter.min !== undefined && row.amountInBase < filter.min)
    return false
  return filter.max === undefined || row.amountInBase <= filter.max
}
