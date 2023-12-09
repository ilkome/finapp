<script setup lang="ts">
import useWallets from '~/components/wallets/useWallets'
import type { WalletId } from '~/components/wallets/types'

const props = defineProps<{
  id: WalletId
  isHideDots: boolean
}>()

const emit = defineEmits(['click'])
const { walletsItemsSorted } = useWallets()

const wallet = computed(() => walletsItemsSorted.value[props.id])
</script>

<template lang="pug">
.cursor-pointer.flex.items-center.py-2.px-3.rounded-md.bg-item-main-bg.hocus_bg-item-main-hover(
  v-if="wallet"
  @click="emit('click', id)"
)
  .grow.flex-center.gap-x-3
    //- Icon
    .w-6.h-6.rounded-md.flex-center.text-icon-base.text-xs.leading-none(
      :style="{ background: wallet.color }"
      class="mt-[2px]"
    ) {{ wallet.name.substring(0, 2) }}

    .grow
      //- Name
      .text-sm.text-item-base {{ wallet.name }}

      //- Amount
      .text-item-base
        Amount(
          :amount="wallet.amount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="false"
          align="left"
        )

  .mdi.mdi-dots-vertical.-mr-1.text-lg.text-item-base-down(v-if="!isHideDots")
</template>
