import type { WalletItem } from '~/components/wallets/types'

export const walletsItems = {
  walletCashUSD: {
    color: 'orange',
    currency: 'USD',
    name: 'Wallet Cash USD',
  } as WalletItem,

  walletCreditUSD: {
    color: 'red',
    currency: 'USD',
    name: 'Wallet Credit USD',
  } as WalletItem,

  walletRUB: {
    color: 'yellow',
    currency: 'RUB',
    name: 'Wallet RUB',
  } as WalletItem,

  walletOneRUB: {
    color: 'yellow',
    currency: 'RUB',
    name: 'Wallet One Transaction RUB',
  } as WalletItem,

  walletDeprecatedTransferIncome: {
    color: 'yellow',
    currency: 'RUB',
    name: 'Wallet for deprecated Transfer income',
  } as WalletItem,

  walletDeprecatedTransferExpense: {
    color: 'yellow',
    currency: 'RUB',
    name: 'Wallet for deprecated Transfer expense',
  } as WalletItem,
}
