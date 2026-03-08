import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { showSuccessToast } from '~/composables/useStoreSync'

export function useWalletDelete() {
  const { t } = useI18n()
  const walletsStore = useWalletsStore()
  const trnsStore = useTrnsStore()

  const deleteWalletId = ref<WalletId | null>(null)

  const deleteInfo = computed(() => {
    if (!deleteWalletId.value)
      return { count: 0, descText: undefined as string | undefined, highlight: undefined as string | undefined }

    const count = trnsStore.getStoreTrnsIds({ walletsIds: [deleteWalletId.value] }).length
    return {
      count,
      descText: count > 0 ? t('wallets.form.delete.alertWithTrns') : undefined,
      highlight: count > 0 ? t('trns.plural', count) : undefined,
    }
  })

  function requestDelete(walletId: WalletId) {
    deleteWalletId.value = walletId
  }

  function cancelDelete() {
    deleteWalletId.value = null
  }

  async function confirmDelete() {
    if (!deleteWalletId.value)
      return

    const walletId = deleteWalletId.value
    const trnsIds: TrnId[] = [...trnsStore.getStoreTrnsIds({ walletsIds: [walletId] })]

    deleteWalletId.value = null
    await walletsStore.deleteWallet(walletId, trnsIds)

    setTimeout(() => {
      showSuccessToast(trnsIds.length > 0
        ? 'wallets.form.delete.okWithTrns'
        : 'wallets.form.delete.okWithoutTrns', trnsIds.length > 0
        ? { length: trnsIds.length, trns: t('trns.plural', trnsIds.length) }
        : undefined)
    }, 300)
  }

  return {
    cancelDelete,
    confirmDelete,
    deleteInfo,
    deleteWalletId,
    requestDelete,
  }
}
