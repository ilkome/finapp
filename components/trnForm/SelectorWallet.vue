<script setup lang="ts">
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import type { WalletId } from '~/components/wallets/types'

defineProps<{
  isLaptop: boolean
  walletId: WalletId
}>()

const emit = defineEmits<{
  onOpen: [slide: number]
  onSelected: [id: WalletId]
}>()

const walletsStore = useWalletsStore()
</script>

<template>
  <div class="rounded-md bg-item-4">
    <WalletsItem
      v-if="!isLaptop"
      :walletId
      :wallet="walletsStore.sortedItems[walletId]"
      alt
      @click="emit('onOpen', 0)"
    />

    <VDropdown
      v-else
      :overflowPadding="12"
      autoBoundaryMaxSize
      placement="bottom-start"
    >
      <WalletsItem
        :walletId
        :wallet="walletsStore.sortedItems[walletId]"
        alt
      />

      <template #popper="{ hide }">
        <!-- TODO: combine -->
        <div class="flex items-center">
          <UiTitle class="px-3 pb-2 pt-1.5">
            {{ $t("wallets.title") }}
          </UiTitle>
          <BaseBottomSheetClose @onClick="hide" />
        </div>

        <WalletsSelector
          :hide
          class="w-[90vw] max-w-xs"
          @onSelected="id => emit('onSelected', id)"
        />
      </template>
    </VDropdown>
  </div>
</template>
