import type { TrnId, TrnItem } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { trnWithoutWallet } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { showSuccessToast } from '~/composables/useStoreSync'

export function useWalletDelete() {
  const { t } = useI18n()
  const walletsStore = useWalletsStore()
  const trnsStore = useTrnsStore()

  const confirm = useConfirm()

  async function requestDelete(walletId: WalletId) {
    const trnsIds: TrnId[] = []
    const kept: Record<TrnId, TrnItem> = {}
    for (const id of trnsStore.getStoreTrnsIds({ walletsIds: [walletId] })) {
      const trn = trnsStore.items?.[id]
      const rest = trn && trnWithoutWallet(trn, walletId)
      if (rest)
        kept[id] = { ...rest, updatedAt: Date.now() }
      else
        trnsIds.push(id)
    }
    const count = trnsIds.length
    const confirmed = await confirm.ask({
      description: count > 0 ? t('wallets.form.delete.alertWithTrns') : undefined,
      highlight: count > 0 ? t('trns.plural', count) : undefined,
      title: t('wallets.form.delete.title'),
    })
    if (!confirmed)
      return

    await trnsStore.saveTrns(kept)
    await walletsStore.deleteWallet(walletId, trnsIds)

    setTimeout(() => {
      showSuccessToast(count > 0
        ? 'wallets.form.delete.okWithTrns'
        : 'wallets.form.delete.okWithoutTrns', count > 0
        ? { length: count, trns: t('trns.plural', count) }
        : undefined)
    }, 300)
  }

  return { requestDelete }
}
