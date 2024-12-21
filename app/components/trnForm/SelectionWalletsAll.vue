<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const props = defineProps<{
  maxHeight: string
}>()

const emit = defineEmits<{
  close: []
  onSelectWallet: [id: WalletId]
}>()

const trnsFormStore = useTrnsFormStore()
</script>

<template>
  <div>
    <UiTitleModal @click="trnsFormStore.ui.walletsModal = true">
      {{ $t("wallets.title") }}
    </UiTitleModal>

    <WalletsSelector
      :hide="emit('close')"
      :activeItemId="trnsFormStore.values.walletId"
      class="min-w-72 px-2 py-px"
      @onSelected="id => emit('onSelectWallet', id)"
    />
  </div>
</template>
