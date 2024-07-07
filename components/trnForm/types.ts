import type { TransferType, TrnId, TrnType } from '~/components/trns/types'
import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'
import type { MoneyTypeSlug } from '~/components/stat/types'

export enum AmountsType {
  Transaction = 0,
  TransferExpense = 2,
  TransferIncome = 1,
}

export interface TrnFormValues {
  // ['Transaction', 'expenseTransfer', 'incomeTransfer']
  amount: [number, number, number]
  // TODO: is better way to show array meaning?
  // ['Transaction', 'expenseTransfer', 'incomeTransfer']
  amountRaw: [string, string, string]
  // TODO: is better way to show array meaning?
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
  catsRootModal: boolean
  isShow: boolean
  tab: 'main' | 'date' | 'desc'
  walletTransferModal: boolean
  walletTransferType: MoneyTypeSlug
  walletsModal: boolean

  walletsTab: string // TODO: add typing
  walletsViewAs: 'big' | 'small' // TODO: add typing
}
