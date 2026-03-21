import { z } from 'zod/v4'

import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { WalletId, WalletItem } from '~/components/wallets/types'

export enum TrnType {
  Expense = 0,
  Income = 1,
  Transfer = 2,
}

export type TrnId = string

export function getTrnTypeByAmount(amount: number): TrnType {
  return amount > 0 ? TrnType.Income : TrnType.Expense
}

export type TrnsViewType = 'adjustment' | 'all' | 'expense' | 'income' | 'transfer'

export type TransferSide = 'expense' | 'income'

const baseTrnSchema = z.object({
  date: z.number(),
  desc: z.string().optional(),
  updatedAt: z.number(),
})

const transactionSchema = baseTrnSchema.extend({
  amount: z.number().positive(),
  categoryId: z.string().min(1),
  type: z.union([z.literal(TrnType.Expense), z.literal(TrnType.Income)]),
  walletId: z.string().min(1),
})

const transferSchema = baseTrnSchema.extend({
  categoryId: z.literal('transfer'),
  expenseAmount: z.number().positive(),
  expenseWalletId: z.string().min(1),
  incomeAmount: z.number().positive(),
  incomeWalletId: z.string().min(1),
  type: z.literal(TrnType.Transfer),
})

export const trnItemSchema = z.discriminatedUnion('type', [
  transactionSchema,
  transferSchema,
])

export type Transaction = z.infer<typeof transactionSchema>
export type Transfer = z.infer<typeof transferSchema>
export type TrnItem = z.infer<typeof trnItemSchema>
type TrnItemFullBase = {
  category: CategoryItem
  categoryParent?: CategoryItem
  id: TrnId
}

type TransactionFull = Transaction & TrnItemFullBase & {
  wallet: WalletItem
}

type TransferFull = Transfer & TrnItemFullBase & {
  expenseWallet: WalletItem
  incomeWallet: WalletItem
}

export type TrnItemFull = TransactionFull | TransferFull

export type Trns = Record<TrnId, TrnItem>

export type TrnsGetterProps = {
  categoriesIds?: CategoryId[]
  dates?: {
    end: number
    start: number
  }
  sort?: boolean
  trnsIds?: TrnId[]
  trnsItems?: Trns
  trnsTypes?: TrnType[]
  walletsIds?: WalletId[]
}

export type TrnFormValues = {
  // [transaction, expenseTransfer, incomeTransfer]
  amount: [number, number, number]
  // [transaction, expenseTransfer, incomeTransfer]
  amountRaw: [string, string, string]

  categoryId: CategoryId | null
  date: number
  desc?: string
  expenseWalletId: WalletId | null
  incomeWalletId: WalletId | null
  transferType: TransferSide
  trnId: null | TrnId

  trnType: TrnType
  walletId: WalletId | null
}
