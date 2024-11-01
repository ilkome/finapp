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
      class="bg-foreground-1 sticky top-0 z-10 px-3 pb-3 pt-4"
      @click="trnFormStore.ui.walletsModal = true"
    >
      {{ $t("wallets.title") }}
    </UiTitle3>

    <WalletsSelector
      :hide="emit('close')"
      :activeItemId="trnFormStore.values.walletId"
      class="_max-w-xs min-w-72"
      @onSelected="id => emit('onSelectWallet', id)"
    />
  </div>
</template>
