import type { WalletItem } from '~/components/wallets/types'

export const walletsItems = {
  walletCashUSD: {
    color: 'orange',
    currencyCode: 'USD',
    name: 'Wallet Cash USD',
  } as WalletItem,

  walletCreditUSD: {
    color: 'red',
    currencyCode: 'USD',
    name: 'Wallet Credit USD',
  } as WalletItem,

  walletDeprecatedTransferExpense: {
    color: 'yellow',
    currencyCode: 'RUB',
    name: 'Wallet for deprecated Transfer expense',
  } as WalletItem,

  walletDeprecatedTransferIncome: {
    color: 'yellow',
    currencyCode: 'RUB',
    name: 'Wallet for deprecated Transfer income',
  } as WalletItem,

  walletOneRUB: {
    color: 'yellow',
    currencyCode: 'RUB',
    name: 'Wallet One Transaction RUB',
  } as WalletItem,

  walletRUB: {
    color: 'yellow',
    currencyCode: 'RUB',
    name: 'Wallet RUB',
  } as WalletItem,
}
