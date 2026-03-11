<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  bottomSheetStyle?: Record<string, string>
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
  <BottomSheetOrDropdown
    :bottomSheetStyle="props.bottomSheetStyle"
    :isOpen="isShow"
    :title="props.title"
    dragClassesCustom="h-full max-w-md"
    isShowCloseBtn
    @closeModal="isShow = false"
    @openModal="isShow = true"
  >
    <template #trigger>
      <WalletsItem
        :walletId
        :wallet="walletsStore.itemsComputed[walletId]!"
        insideClasses="!min-h-[46px]"
        isShowIcon
        isShowCreditLimit
        alt
      />
    </template>

    <template #custom="{ close }">
      <WalletsSelector
        :hide="close"
        :activeItemId="props.walletId"
        class="min-w-80 px-2"
        @selected="(id: WalletId) => emit('selected', id)"
      />
    </template>
  </BottomSheetOrDropdown>
</template>
