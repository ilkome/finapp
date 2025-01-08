import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { WalletId, WalletItem } from '~/components/wallets/types'

export type TrnId = string

export enum TrnType {
  Expense,
  Income,
  Transfer,
}

export type TrnsViewType = 'all' | 'expense' | 'income' | 'transfer'

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
  /** @deprecated: use desc */
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
  trnsItems?: Trns
  trnsTypes?: TrnType[]
  trnType?: TrnType
  untilDate?: number
  walletsIds?: WalletId[]
}

export type TrnFormValues = {
  // ['Transaction', 'expenseTransfer', 'incomeTransfer']
  amount: [number, number, number]
  // TODO: is better way to show array meaning?
  // TODO: is better way to show array meaning?
  // ['Transaction', 'expenseTransfer', 'incomeTransfer']
  amountRaw: [string, string, string]

  categoryId: CategoryId | null
  date: number
  desc?: string
  expenseWalletId: WalletId | null
  incomeWalletId: WalletId | null
  transferType: TransferType
  trnId: null | TrnId

  trnType: TrnType
  walletId: WalletId | null
}
