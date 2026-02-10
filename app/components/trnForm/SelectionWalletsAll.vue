<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

defineProps<{
  maxHeight: string
}>()

const emit = defineEmits<{
  onSelectWallet: [id: WalletId]
}>()

const trnsFormStore = useTrnsFormStore()
</script>

<template>
  <div>
    <UiTitleModal @click="trnsFormStore.ui.walletsModal = true">
      {{ $t('wallets.title') }}
    </UiTitleModal>

    <WalletsSelector
      :activeItemId="trnsFormStore.values.walletId ?? undefined"
      class="min-w-80 px-2 py-px"
      @onSelected="id => emit('onSelectWallet', id)"
    />
  </div>
</template>
