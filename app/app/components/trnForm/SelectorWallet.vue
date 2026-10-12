<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  disabledWalletIds?: WalletId[]
  drawerStyle?: Record<string, string>
  title?: string
  walletId: WalletId
}>()

const emit = defineEmits<{
  selected: [id: WalletId]
}>()

const walletsStore = useWalletsStore()

const isShow = ref(false)

const isLaptop = useIsLaptop()
</script>

<template>
  <DrawerOrDropdown
    v-model:open="isShow"
    :drawerStyle="props.drawerStyle"
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
        :filterAtTop="isLaptop"
        withHeader
        class="min-w-80 px-2"
        @selected="(id: WalletId) => emit('selected', id)"
      />
    </template>
  </DrawerOrDropdown>
</template>
