import type { Ref } from 'vue'

import { z } from 'zod/v4'

import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { WalletId, WalletItem } from '~/components/wallets/types'

const trnTypes = ['expense', 'income', 'transfer', 'adjustment'] as const
export type TrnType = typeof trnTypes[number]

export type TrnId = string

export function getTrnTypeByAmount(amount: number): 'expense' | 'income' {
  return amount > 0 ? 'income' : 'expense'
}

export const trnsViewTypes = ['adjustment', 'all', 'expense', 'income', 'transfer'] as const
export type TrnsViewType = typeof trnsViewTypes[number]

export type TrnsListFilterSnapshot = {
  filterBy: TrnsViewType
  isShowHistoryWithDesc?: boolean
  isShowWithDesc: boolean
}

export type TrnsListFilterState = {
  filterBy: Ref<TrnsViewType>
  isShowHistoryWithDesc?: Ref<boolean>
  isShowWithDesc: Ref<boolean>
}

export type TransferSide = 'from' | 'to'

/**
 * Every transaction moves money out of a wallet, into a wallet, or both; amounts are integer minor units of the
 * side's wallet currency. Mirrors the `transactions` check constraints, so a row the server would reject never
 * enters the upload queue.
 */
export const trnItemSchema = z.object({
  categoryId: z.string().min(1).optional(),
  createdAt: z.number().int(),
  // Civil day (UTC-midnight ms-epoch); the bucketing truth.
  date: z.number().int().refine(date => date % 86400000 === 0, 'date must be a civil day'),
  description: z.string().optional(),
  fromAmount: z.number().int().positive().optional(),
  fromWalletId: z.string().min(1).optional(),
  toAmount: z.number().int().positive().optional(),
  toWalletId: z.string().min(1).optional(),
  type: z.enum(trnTypes),
  updatedAt: z.number().int(),
}).superRefine((trn, ctx) => {
  const hasFrom = trn.fromWalletId !== undefined
  const hasTo = trn.toWalletId !== undefined
  const issue = (message: string) => ctx.addIssue({ code: 'custom', message })
  if (hasFrom !== (trn.fromAmount !== undefined) || hasTo !== (trn.toAmount !== undefined))
    issue('a wallet and its amount are set together')
  const hasCategory = trn.categoryId !== undefined
  if (trn.type === 'expense' && !(hasFrom && !hasTo && hasCategory))
    issue('an expense has its source wallet and a category')
  if (trn.type === 'income' && !(!hasFrom && hasTo && hasCategory))
    issue('an income has its target wallet and a category')
  if (trn.type === 'adjustment' && (hasFrom === hasTo || hasCategory))
    issue('an adjustment has exactly one side and no category')
  if (trn.type === 'transfer' && (!(hasFrom || hasTo) || hasCategory || (hasFrom && trn.fromWalletId === trn.toWalletId)))
    issue('a transfer has at least one side, two different wallets and no category')
})

export type TrnItem = z.infer<typeof trnItemSchema>

export type TrnItemFull = TrnItem & {
  category?: CategoryItem
  categoryParent?: CategoryItem
  fromWallet?: WalletItem
  id: TrnId
  toWallet?: WalletItem
}

/** The wallet a one-sided row belongs to; for a two-sided transfer, its source. */
export function trnWalletId(trn: TrnItem): WalletId | undefined {
  return trn.fromWalletId ?? trn.toWalletId
}

/** Signed change of `walletId`'s balance by this row, in its minor units. */
export function trnWalletDelta(trn: TrnItem, walletId: WalletId): number {
  return (trn.toWalletId === walletId ? trn.toAmount! : 0) - (trn.fromWalletId === walletId ? trn.fromAmount! : 0)
}

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
  // [expense or income, transfer source, transfer target], minor units
  amount: [number, number, number]
  // [expense or income, transfer source, transfer target]
  amountRaw: [string, string, string]

  categoryId: CategoryId | null
  date: number
  description?: string
  fromWalletId: WalletId | null
  toWalletId: WalletId | null
  // The transfer side that lies outside the app: left empty on save.
  transferOutside?: TransferSide
  transferType: TransferSide
  trnId: null | TrnId

  trnType: TrnType
  walletId: WalletId | null
}
