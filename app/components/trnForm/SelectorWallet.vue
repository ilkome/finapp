<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  bottomSheetStyle?: Record<string, string>
  isLaptop: boolean
  title?: string
  walletId: WalletId
}>()

const emit = defineEmits<{
  onOpen: [slide: number]
  onSelected: [id: WalletId]
}>()

const walletsStore = useWalletsStore()

const isShow = ref(false)
</script>

<template>
  <BottomSheetOrDropdown
    :title="props.title"
    :isOpen="isShow"
    :bottomSheetStyle="props.bottomSheetStyle"
    @onOpenModal="isShow = true"
    @onCloseModal="isShow = false"
  >
    <template #trigger>
      <WalletsItem
        :walletId
        :wallet="walletsStore.itemsComputed[walletId]"
        insideClasses="!min-h-[46px]"
        isShowIcon
        alt
      />
    </template>

    <template #content="{ close }">
      <WalletsSelector
        :hide="close"
        :activeItemId="props.walletId"
        class="min-w-72 md:px-2"
        @onSelected="id => emit('onSelected', id)"
      />
    </template>
  </BottomSheetOrDropdown>
</template>
