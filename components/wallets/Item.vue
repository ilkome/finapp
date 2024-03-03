<script setup lang="ts">
import type { WalletId } from './types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = withDefaults(defineProps<{
  id: WalletId
  showBase: boolean
  vertical?: 'left' | 'right'
  size: 'sm' | 'md' | 'lg' | null
  activeItemId: WalletId | null
  isShowAmount?: boolean
}>(), {
  vertical: 'left',
  showBase: true,
  isShowAmount: true,
})

const emit = defineEmits(['onClick'])

const walletsStore = useWalletsStore()

const wallet = computed(() => ({
  ...walletsStore.items[props.id],
  total: walletsStore.walletsTotal[props.id],
}))
</script>

<template lang="pug">
.p-2.rounded-md(
  :class="{ _active: activeItemId === id }"
  @click="emit('onClick', id)"
)
  div.bg-red-300.h-8(v-if="activeItemId === id")
  .gap-x-3.flex.items-center
    .text-neutral-50.text-xs.leading-none.w-6.h-6.rounded-md.justify-center.items-center.flex(
      :style="{ background: wallet.color }"
      class="mt-[2px]"
    ) {{ wallet.name.substring(0, 2) }}

    div
      .text-secondary2.text-sm {{ wallet.name }}
      template(v-if="isShowAmount")
        Amount(
          :amount="wallet.total"
          :currencyCode="wallet.currency"
          align="right"
        )
</template>
