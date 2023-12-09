import type { TransferType, TrnId, TrnType } from '~/components/trns/types'
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

export enum AmountsType {
  Transaction = 0,
  TransferIncome = 1,
  TransferExpense = 2,
}

export interface TrnFormValues {
  trnId: null | TrnId
  // TODO: is better way to show array meaning?
  // ['Transaction', 'expenseTransfer', 'incomeTransfer']
  amount: [number, number, number]
  // TODO: is better way to show array meaning?
  // ['Transaction', 'expenseTransfer', 'incomeTransfer']
  amountRaw: [string, string, string]
  date: number
  desc?: string
  transferType: TransferType
  trnType: TrnType
  categoryId: CategoryId | null
  walletId: WalletId | null

  expenseWalletId: WalletId | null
  incomeWalletId: WalletId | null
}

// export type TrnFormValues = {
//   // TODO: is better way to show array meaning?
//   // ['Transaction', 'expenseTransfer', 'incomeTransfer']

//   amount: [number, number, number]
//   amountRaw: [string, string, string]
//   date: number
//   desc: string | null
//   trnId: null | TrnId
//   trnType: TrnType
// } & ({
//   categoryId: CategoryId | null
//   trnType: TrnType.Expense | TrnType.Income
//   walletId: WalletId | null
// } | {
//   categoryId: 'transfer' | null
//   expenseWalletId: WalletId | null
//   incomeWalletId: WalletId | null
//   transferType: TransferType
//   trnType: TrnType.Transfer
// })

export interface TrnFormUi {
  isShow: boolean
  walletsTab: string // TODO: add typing
  walletsModal: boolean
  catsRootModal: boolean
  walletsViewAs: 'big' | 'small' // TODO: add typing
  tab: 'main' | 'date' | 'desc'

  walletTransferModal: boolean
  walletTransferType: 'expense' | 'income'
}
