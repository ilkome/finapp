import type { CurrencyCode } from '~/components/currencies/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { DeepPartial } from '~~/utils/types'

export const types = [
  'available',
  'withdrawal',
  'isCash',
  'isCashless',
  'isDeposit',
  'isCredit',
  'isDebt',
  'archived',
] as const

export type WalletId = string

export type WalletItem = {
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

export type WalletTypes = Exclude<typeof types[number], 'available'>
export type WalletTypesView = Pick<WalletItem, WalletTypes> & {
  creditPossible: boolean
  withCredit: boolean
}
export type WalletTypeViewAll = keyof WalletTypesView | 'all'
