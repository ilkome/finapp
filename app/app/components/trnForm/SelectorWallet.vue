<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  disabledWalletIds?: WalletId[]
  title?: string
  walletId: WalletId
}>()

const emit = defineEmits<{
  selected: [id: WalletId]
}>()

const walletsStore = useWalletsStore()

const isShow = ref(false)
</script>

<template>
  <DrawerOrDropdown
    v-model:open="isShow"
    :collapsedSnap="500"
    :title="props.title"
    contentClass="h-full"
    isShowCloseBtn
  >
    <template #trigger>
      <WalletsItem
        :walletId
        :wallet="walletsStore.itemsComputed[walletId]!"
        insideClasses="min-h-11.5!"
        isShowIcon
        isShowCreditLimit
        compact
      />
    </template>

    <template #custom="{ close }">
      <WalletsSelector
        :hide="close"
        :activeItemId="props.walletId"
        :disabledIds="props.disabledWalletIds"
        withHeader
        class="min-w-80"
        @selected="(id: WalletId) => emit('selected', id)"
      />
    </template>
  </DrawerOrDropdown>
</template>
