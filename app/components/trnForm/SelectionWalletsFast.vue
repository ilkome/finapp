<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const trnsFormStore = useTrnsFormStore()
const walletsStore = useWalletsStore()

const recentWallets = computed(() => {
  const ids = walletsStore.recentWalletIds.slice(0, 5)
  return ids.reduce((acc, id) => {
    const wallet = walletsStore.itemsComputed[id]
    if (wallet)
      acc[id] = wallet
    return acc
  }, {} as Record<WalletId, typeof walletsStore.itemsComputed[WalletId]>)
})
</script>

<template>
  <div>
    <UiTitleModal>
      {{ t('wallets.title') }}
    </UiTitleModal>

    <div class="grid grid-cols-2 gap-1 px-3 pt-1">
      <WalletsItem
        v-for="(wallet, walletId) in recentWallets"
        :key="walletId"
        :activeItemId="trnsFormStore.values.walletId"
        :walletId="(walletId as WalletId)"
        :wallet
        isShowIcon
        isShowCreditLimit
        compact
        @click="trnsFormStore.values.walletId = (walletId as WalletId)"
      />
    </div>
  </div>
</template>
