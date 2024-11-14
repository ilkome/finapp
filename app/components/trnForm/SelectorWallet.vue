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

const { t } = useI18n()
const walletsStore = useWalletsStore()
</script>

<template>
  <div>
    <!-- Laptop -->
    <UPopover v-if="isLaptop">
      <WalletsItem
        :walletId
        :wallet="walletsStore.sortedItems[walletId]"
        insideClasses="!min-h-[46px]"
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
            class="min-w-72 max-w-xs "
            @onSelected="id => emit('onSelected', id)"
          />
        </UiPopoverWrap>
      </template>
    </UPopover>

    <!-- Mobile -->
    <WalletsItem
      v-else
      :walletId
      :wallet="walletsStore.sortedItems[walletId]"
      alt
      @click="emit('onOpen', 0)"
    />
  </div>
</template>
