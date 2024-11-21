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

type BaseTrn = {
  date: number
  desc?: string
  // @deprecated
  description?: string
  edited: number
}

export type Transaction = {
  amount: number
  categoryId: CategoryId
  type: TrnType.Income | TrnType.Expense
  walletId: WalletId
} & BaseTrn

export type Transfer = {
  categoryId: 'transfer'
  expenseAmount: number

  expenseWalletId: WalletId
  incomeAmount: number

  incomeWalletId: WalletId
  type: TrnType.Transfer
} & BaseTrn

/** @deprecated: use Transfer */
export type TransferDeprecated = {
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

export type TrnsGetterProps = {
  categoriesIds?: CategoryId[]
  dates?: {
    from: number
    until: number
  }
  trnsIds?: TrnId[]
  trnType?: TrnType
  untilDate?: number
  walletsIds?: WalletId[]
}

export type TrnsGetterProps2 = {
  categoriesIds?: CategoryId[]
  dates?: {
    from: number
    until: number
  }
  trnsIds?: TrnId[]
  trnsItems?: Trns
  trnsTypes?: TrnType[]
  trnType?: TrnType
  untilDate?: number
  walletsIds?: WalletId[]
}
