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
  id: WalletId
  name: string
  type: WalletType
  withdrawal?: boolean
  currency: string
  color: string
  order: number
  // @deprecated: use withdrawal type
  isCredit?: boolean
  // @deprecated: use withdrawal
  countTotal?: boolean
  archived?: boolean
}

export interface WalletWithTotal extends WalletItem {
  total: TotalReturns
}

export type Wallets = Record<WalletId, WalletItem>

export interface WalletsCurrenciesGroup {
  card: (v: WalletWithTotal) => boolean
  electron: (v: WalletWithTotal) => boolean
  deposit: (v: WalletWithTotal) => boolean
  cash: (v: WalletWithTotal) => boolean
  credits: (v: WalletWithTotal) => boolean
  savings: (v: WalletWithTotal) => boolean
  withdrawal: (v: WalletWithTotal) => boolean
  all: () => true
}

export interface Item {
  count: number
  total: number
  totalInBase: number
  ids: WalletId[]
}

export type WalletId = string

export interface WalletItemWithAmount extends WalletItem {
  amount: number
}

export interface WalletForm {
  color: string
  countTotal: boolean
  currency: string
  description?: string
  isCredit: boolean
  name: string
  order: number
}
