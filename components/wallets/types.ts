export type WalletID = string

export interface WalletItem {
  name: string
  color: string
  currency: string
}

export interface WalletItemWithAmount extends WalletItem {
  amount: number
}

export interface WalletForm {
  color: string
  countTotal: boolean
  currency: string
  isCredit: boolean
  name: string
  order: number
}
