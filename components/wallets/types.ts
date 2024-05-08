import type { CurrencyCode } from '../currencies/types'
import type { TotalReturns } from '~/components/amount/getTotal'

export type WalletId = string

export enum WalletType {
  Cash,
  Card,
  Deposit,
  Electron,
  Credit,
}

export interface WalletItem {
  archived?: boolean
  color: string
  // @deprecated: use withdrawal
  countTotal?: boolean
  currency: CurrencyCode
  description?: string
  id: WalletId
  // @deprecated: use withdrawal type
  isCredit?: boolean
  name: string
  order: number
  type: WalletType
  withdrawal?: boolean
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

export interface WalletForm {
  color: string
  countTotal: boolean
  creditLimit?: number
  currency: string
  description?: string
  isCredit: boolean
  name: string
  order: number
}
