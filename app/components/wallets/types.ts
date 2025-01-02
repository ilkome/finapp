import type { DeepPartial } from '~~/utils/types'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { CurrencyCode } from '~/components/currencies/types'

export const types = [
  'cash',
  'credit',
  'cashless',
  'deposit',
  'crypto',
  'debt',
] as const

export const viewTypes = [
  'available',
  ...types,
  'creditPossible',
  'withdrawal',
  'archived',
] as const

export type WalletId = string
export type WalletType = typeof types[number]

export type WalletViewTypes = typeof viewTypes[number]
export type WalletViewTypesObj = {
  [K in WalletViewTypes]: boolean
}

export const icons: Record<WalletType, string> = {
  cash: 'lucide:banknote',
  cashless: 'lucide:landmark',
  credit: 'lucide:piggy-bank',
  crypto: 'lucide:coins',
  debt: 'lucide:hand-coins',
  deposit: 'lucide:diamond-percent',
} as const

export type WalletItemBase = {
  color: string
  currency: CurrencyCode
  desc?: string
  editedAt: number
  isArchived?: boolean
  isExcludeInTotal?: boolean
  isWithdrawal?: boolean
  name: string
  order: number
}

export type WalletItemSimple = WalletItemBase & {
  type: Exclude<WalletType, 'credit'>
}

type WalletItemCredit = WalletItemBase & {
  creditLimit: number
  type: 'credit'
}

export type WalletItem = WalletItemSimple | WalletItemCredit

export type WalletItemDirty = WalletItem & Partial<{
  archived: boolean
  creditLimit: number
  description: string
  edited: number
  isCash: boolean
  isCashless: boolean
  isCredit: boolean
  isDebt: boolean
  isDeposit: boolean
  isExcludeTotal: boolean
  withdrawal: boolean
}>

export type WalletForm = DeepPartial<WalletItemDirty> & {
  creditLimit?: number | null
  description?: string | null
}

export type Wallets = Record<WalletId, WalletItem>
export type WalletsDirty = Record<WalletId, WalletItemDirty>

export type WalletItemComputed = WalletItem & {
  amount: number
  rate?: number
}
