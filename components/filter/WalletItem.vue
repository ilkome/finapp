<script setup lang="ts">
import useWallets from '~/components/wallets/useWallets'
import type { WalletId } from '~/components/wallets/types'

const props = defineProps<{
  id: WalletId
}>()

const emit = defineEmits(['click'])
const { walletsItemsSorted } = useWallets()

const wallet = computed(() => walletsItemsSorted.value[props.id])
</script>

<template lang="pug">
FilterItemBg(@click="emit('click', id)")
  .flex-center.gap-x-3
    //- Icon
    .w-6.h-6.rounded-md.flex-center.text-icon-base.text-xs.leading-none(
      :style="{ background: wallet.color }"
      class="mt-[2px]"
    ) {{ wallet.name.substring(0, 2) }}

    .grow
      .text-sm.leading-none {{ wallet.name }}
      .text-item-base
        Amount(
          :amount="wallet.amount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="false"
          align="left"
        )
</template>
