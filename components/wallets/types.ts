import type { CurrencyCode } from '../currencies/types'
import type { TotalReturns } from '~/components/amount/getTotal'

export type WalletId = string

export interface WalletItem {
  archived?: boolean
  color: string
  creditLimit?: number
  currency: CurrencyCode
  description?: string
  id: WalletId
  isCash?: boolean
  isCashless?: boolean
  isCredit?: boolean
  isDeposit?: boolean
  name: string
  order: number
  withdrawal?: boolean
}

export interface WalletForm {
  archived: boolean
  color: string
  creditLimit: number | null
  currency: CurrencyCode
  description: string | null
  isCash: boolean | null
  isCashless: boolean | null
  isCredit: boolean | null
  isDeposit: boolean | null
  name: string
  order: number
  withdrawal: boolean | null
}

export type Wallets = Record<WalletId, WalletItem>
export type WalletsWithAmount = Record<WalletId, WalletItemWithAmount>

export interface WalletWithTotal extends WalletItem {
  total: TotalReturns
}

export interface WalletsCurrenciesGroup {
  all: () => true
  card: (v: WalletWithTotal) => boolean
  cash: (v: WalletWithTotal) => boolean
  credits: (v: WalletWithTotal) => boolean
  deposit: (v: WalletWithTotal) => boolean
  electron: (v: WalletWithTotal) => boolean
  savings: (v: WalletWithTotal) => boolean
  withdrawal: (v: WalletWithTotal) => boolean
}

export interface Item {
  count: number
  ids: WalletId[]
  total: number
  totalInBase: number
}

export interface WalletItemWithAmount extends WalletItem {
  amount: number
}
