import type { WalletId } from '~/components/wallets/types'

const walletId = ref<WalletId | null>(null)

/** The wallet the analytics page shows in its sheet; any section opens it by setting the id. */
export function useWalletSheet() {
  return walletId
}
