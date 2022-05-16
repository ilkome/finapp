export type WalletID = string

export interface WalletItem {
  color: string
  currency: string
  name: string
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
