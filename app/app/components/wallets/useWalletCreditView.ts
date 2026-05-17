import type { RemovableRef } from '@vueuse/core'

import { useStorage } from '@vueuse/core'

import type { WalletId } from '~/components/wallets/types'

import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'

export const CREDIT_VIEWS = ['debt', 'summary'] as const
export type CreditView = typeof CREDIT_VIEWS[number]

// Cache one ref per walletId so multiple consumers in the same tab share
// reactive updates. useStorage creates a fresh ref on each call and only
// syncs across tabs via storage events, not within the same document.
const cache = new Map<WalletId, RemovableRef<CreditView>>()

export function useWalletCreditView(walletId: WalletId) {
  let view = cache.get(walletId)
  if (!view) {
    view = useStorage<CreditView>(
      `${WALLET_STORAGE_KEYS.creditViewPrefix}${walletId}`,
      'debt',
    )
    cache.set(walletId, view)
  }

  function cycle() {
    const i = CREDIT_VIEWS.findIndex(v => v === view!.value)
    view!.value = CREDIT_VIEWS[(i + 1) % CREDIT_VIEWS.length]!
  }

  return { cycle, view }
}
