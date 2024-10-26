import type { CurrencyCode } from '~/components/currencies/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { DeepPartial } from '~~/utils/types'

export const types = [
  'cash',
  'cashless',
  'deposit',
  'credit',
  'debt',
] as const

export const viewTypes = [
  ...types,
  'available',
  'creditPossible',
  'showWithCredit',
  'withdrawal',
  'archived',
] as const

export type WalletId = string
export type WalletTypes = typeof types[number]

type WalletItemBase = {
  color: string
  creditLimit?: number
  currency: CurrencyCode
  description?: string
  editedAt: number
  id: WalletId
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
  id: WalletId
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

export type WalletTypesView = {
  [K in WalletTypes]: boolean
} & {
  creditPossible: boolean
  showWithCredit: boolean
}

export type WalletTypeViewAll = keyof WalletTypesView | 'all'
