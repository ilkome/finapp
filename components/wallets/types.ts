export type WalletID = string

export interface WalletItem {
  name: string
  color: string
  currency: string
}

export interface WalletItemWithAmount extends WalletItem {
  amount: number
}
