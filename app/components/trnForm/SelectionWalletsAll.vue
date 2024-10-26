<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const props = defineProps<{
  maxHeight: string
}>()

const emit = defineEmits<{
  close: []
  onSelectWallet: [id: WalletId]
}>()

const trnFormStore = useTrnFormStore()
</script>

<template>
  <div>
    <UiTitle3
      class="z-10 sticky pt-4 pb-3 top-0 px-3 bg-foreground-1"
      @click="trnFormStore.ui.walletsModal = true"
    >
      {{ $t("wallets.title") }}
    </UiTitle3>

    <WalletsSelector
      :hide="emit('close')"
      :activeItemId="trnFormStore.values.walletId"
      class="min-w-72 _max-w-xs"
      @onSelected="id => emit('onSelectWallet', id)"
    />
  </div>
</template>
