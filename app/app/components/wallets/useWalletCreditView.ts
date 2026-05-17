import { useStorage } from '@vueuse/core'

import type { WalletId } from '~/components/wallets/types'

import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'

export const CREDIT_VIEWS = ['debt', 'summary'] as const
export type CreditView = typeof CREDIT_VIEWS[number]

export function useWalletCreditView(walletId: WalletId) {
  const view = useStorage<CreditView>(
    `${WALLET_STORAGE_KEYS.creditViewPrefix}${walletId}`,
    'debt',
  )

  function cycle() {
    const i = CREDIT_VIEWS.findIndex(v => v === view.value)
    view.value = CREDIT_VIEWS[(i + 1) % CREDIT_VIEWS.length]!
  }

  return { cycle, view }
}
