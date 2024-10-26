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
    <WalletsItem
      v-if="!isLaptop"
      :walletId
      :wallet="walletsStore.sortedItems[walletId]"
      alt
      insideClasses="bg-item-4 min-h-[42px] py-2"
      isShowIcons
      @click="emit('onOpen', 0)"
    />

    <UPopover v-else>
      <WalletsItem
        :walletId
        :wallet="walletsStore.sortedItems[walletId]"
        alt
        isShowIcons
        insideClasses="bg-item-4 min-h-[42px] py-2"
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
  </div>
</template>
