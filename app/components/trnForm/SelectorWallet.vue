<script setup lang="ts">
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import type { WalletId } from '~/components/wallets/types'

const props = defineProps<{
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
  <div>
    <WalletsItem
      v-if="!isLaptop"
      :walletId
      :wallet="walletsStore.sortedItems[walletId]"
      alt
      insideClasses="bg-item-4 min-h-[42px] py-2"
      isShowIcons
      @click="emit('onOpen', 0)"
    />

    <VDropdown
      v-else
      :overflowPadding="12"
      autoBoundaryMaxSize
      placement="top-start"
    >
      <WalletsItem
        :walletId
        :wallet="walletsStore.sortedItems[walletId]"
        alt
        isShowIcons
        insideClasses="bg-item-4 min-h-[42px] py-2"
      />

      <template #popper="{ hide }">
        <div>
          <div class="z-10 sticky pt-4 pb-2 top-0 px-3 bg-foreground-1">
            <UiTitle class="px-3 pb-2 pt-1.5">
              {{ $t("wallets.title") }}
            </UiTitle>
            <BaseBottomSheetClose @onClick="hide" />
          </div>

          <WalletsSelector
            :hide
            :activeItemId="props.walletId"
            class="min-w-72 max-w-xs"
            @onSelected="id => emit('onSelected', id)"
          />
        </div>
      </template>
    </VDropdown>
  </div>
</template>
