import type { InjectionKey, Ref } from 'vue'

import type { WalletId } from '~/components/wallets/types'

const key: InjectionKey<Ref<WalletId | null>> = Symbol('walletSheet')

/**
 * The wallet a page shows in its sheet. State is per page, not module-wide: a kept-alive page still
 * renders while hidden and would open its own copy of the sheet.
 */
export function provideWalletSheet() {
  const walletId = ref<WalletId | null>(null)
  provide(key, walletId)
  return walletId
}

export function useWalletSheet() {
  return inject(key, () => ref<WalletId | null>(null), true)
}
