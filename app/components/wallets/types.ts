import type { CurrencyCode } from '~/components/currencies/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { DeepPartial } from '~~/utils/types'

export const types = [
  'cash',
  'cashless',
  'credit',
  'crypto',
  'debt',
  'deposit',
] as const

export const viewTypes = [
  ...types,
  'available',
  'creditPossible',
  'isWithCredit',
  'isWithdrawal',
  'isArchived',
] as const

export type WalletId = string
export type WalletTypes = typeof types[number]

export type WalletViewTypes = typeof viewTypes[number]
export type WalletViewTypesObj = {
  [K in WalletViewTypes]: boolean
}

export const icons: Record<WalletTypes, string> = {
  cash: 'lucide:banknote',
  cashless: 'lucide:landmark',
  credit: 'lucide:piggy-bank',
  crypto: 'lucide:coins',
  debt: 'lucide:hand-coins',
  deposit: 'lucide:diamond-percent',
} as const

type WalletItemBase = {
  color: string
  creditLimit?: number
  currency: CurrencyCode
  description?: string
  editedAt: number
  isArchived?: boolean
  isExcludeInTotal?: boolean
  isWithdrawal?: boolean
  name: string
  order: number
}

type WalletItemSimple = WalletItemBase & {
  type: Exclude<WalletTypes, 'credit'>
}

type WalletItemCredit = WalletItemBase & {
  creditLimit: number
  type: 'credit'
}

export type WalletItem = WalletItemSimple | WalletItemCredit

export type WalletItemRaw = {
  archived?: boolean
  color: string
  creditLimit?: number
  currency: CurrencyCode
  description?: string
  edited?: number // TODO: rename to editedAt
  isCash?: boolean
  isCashless?: boolean
  isCredit?: boolean
  isDebt?: boolean
  isDeposit?: boolean
  isExcludeTotal?: boolean
  name: string
  order: number
  withdrawal?: boolean
} & WalletItem

export type WalletForm = DeepPartial<WalletItem> & {
  creditLimit?: number | null
  description?: string | null
}

export type Wallets = Record<WalletId, WalletItem>
export type WalletsRaw = Record<WalletId, WalletItemRaw>
export type WalletsWithAmount = Record<WalletId, WalletItemWithAmount>

export type WalletWithTotal = {
  total: TotalReturns
} & WalletItem

export type Item = {
  count: number
  ids: WalletId[]
  total: number
  totalInBase: number
}

export type WalletItemWithAmount = {
  amount: number
} & WalletItem
