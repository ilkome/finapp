import type { WalletId, WalletItem } from '~/components/wallets/types'
import type { CategoryId, CategoryItem } from '~/components/categories/types'

export type TrnId = string

export enum TrnType {
  Expense,
  Income,
  Transfer,
}

export enum TransferType {
  Expense,
  Income,
}

export enum TrnTypeSlug {
  Expense = 'expense',
  Income = 'income',
  Transfer = 'transfer',
}

interface BaseTrn {
  date: number
  desc?: string
  // @deprecated
  description?: string
  edited: number
}

export interface Transaction extends BaseTrn {
  amount: number
  categoryId: CategoryId
  type: TrnType.Income | TrnType.Expense
  walletId: WalletId
}

export interface Transfer extends BaseTrn {
  categoryId: 'transfer'
  expenseAmount: number

  expenseWalletId: WalletId
  incomeAmount: number

  incomeWalletId: WalletId
  type: TrnType.Transfer
}

/** @deprecated: use Transfer */
export interface TransferDeprecated {
  amountFrom: number
  amountTo: number
  categoryId: 'transfer'
  date: number

  edited: number
  type: TrnType.Transfer

  walletFromId: WalletId
  walletToId: WalletId
}

export type TrnItem = Transaction | Transfer
export type TrnItemWithId = (Transaction | Transfer) & TrnId
export type TrnItemFull = (Transaction | Transfer)
  & { id: TrnId }
  & { category: CategoryItem }
  & { categoryParent?: CategoryItem }
  & { wallet: WalletItem }

export type TrnItemDirty = Transaction | Transfer | TransferDeprecated

export type Trns = Record<TrnId, TrnItem>
export type TrnsDirty = Record<TrnId, TrnItemDirty>

export interface TrnsGetterProps {
  categoriesIds?: CategoryId[]
  dates?: {
    from: number
    until: number
  }
  trnType?: TrnType
  trnsItems: Record<string, TrnItem>
  untilDate?: number
  walletsIds?: WalletId[]
}

export interface TrnsGetterProps2 {
  categoriesIds?: CategoryId[]
  dates?: {
    from: number
    until: number
  }
  trnType?: TrnType
  untilDate?: number
  walletsIds?: WalletId[]
}
