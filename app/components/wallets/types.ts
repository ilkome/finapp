import type { CurrencyCode } from '../currencies/types'
import type { TotalReturns } from '~/components/amount/getTotal'

export type WalletId = string

export type WalletItem = {
  archived?: boolean
  color: string
  creditLimit?: number
  currency: CurrencyCode
  description?: string
  id: WalletId
  isCash?: boolean
  isCashless?: boolean
  isCredit?: boolean
  isDebt?: boolean
  isDeposit?: boolean
  isIncludeTotal?: boolean
  name: string
  order: number
  withdrawal?: boolean
}

export type WalletForm = DeepPartial<WalletItem> & {
  creditLimit?: number | null
  description?: string | null
}

export type Wallets = Record<WalletId, WalletItem>
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
