<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isLaptop: boolean
  walletId: WalletId
}>()

const emit = defineEmits<{
  onOpen: [slide: number]
  onSelected: [id: WalletId]
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
</script>

<template>
  <div>
    <!-- Laptop -->
    <UPopover v-if="isLaptop">
      <WalletsItem
        :walletId
        :wallet="walletsStore.itemsWithAmount[walletId]"
        insideClasses="!min-h-[46px]"
        isShowIcon
        alt
      />

      <template #panel="{ close }">
        <UiPopoverWrap
          :title="t('wallets.title')"
          @close="close"
        >
          <WalletsSelector
            :hide="close"
            :activeItemId="props.walletId"
            class="min-w-72 max-w-xs px-2"
            @onSelected="id => emit('onSelected', id)"
          />
        </UiPopoverWrap>
      </template>
    </UPopover>

    <!-- Mobile -->
    <WalletsItem
      v-else
      :walletId
      :wallet="walletsStore.itemsWithAmount[walletId]"
      isShowIcon
      alt
      @click="emit('onOpen', 0)"
    />
  </div>
</template>
