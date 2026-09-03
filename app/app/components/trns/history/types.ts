import type { CategoryId } from '~/components/categories/types'
import type { CurrencyCode } from '~/components/currencies/types'
import type { TrnId, TrnItem, TrnsViewType } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

export type TransactionHistoryRow = {
  amountInBase: number | null
  categoryColor: string
  categoryIcon: string
  categoryId: CategoryId
  categoryLabel: string
  categoryPath: string
  currencyCodes: CurrencyCode[]
  date: number
  description: string
  id: TrnId
  trn: TrnItem
  type: Exclude<TrnsViewType, 'all'>
  walletIds: WalletId[]
  walletLabel: string
}

export type HistoryDescriptionFilter = 'all' | 'with' | 'without'

export type HistoryAmountFilter = {
  max?: number
  min?: number
}

export type HistoryDateFilter = {
  end?: number
  start?: number
}

export type HistoryBulkEdit
  = | { type: 'setDescription', value: string }
    | { type: 'clearDescription' }
    | { type: 'setDate', value: number }
    | { type: 'setCategory', value: CategoryId }

export type HistoryBulkEditResult = {
  changedIds: TrnId[]
  ineligible: Array<{ id: TrnId, reason: 'invalidCategory' | 'transfer' }>
  unchangedIds: TrnId[]
  values: Record<TrnId, TrnItem>
}

export type HistoryColumnFiltersState = Array<{ id: string, value: unknown }>
export type HistoryColumnOrderState = string[]
export type HistoryColumnPinningState = { left?: string[], right?: string[] }
export type HistoryColumnSizingState = Record<string, number>
export type HistoryRowSelectionState = Record<string, boolean>
export type HistorySortingState = Array<{ desc: boolean, id: string }>
export type HistoryVisibilityState = Record<string, boolean>
