<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

defineProps<{
  title: string
}>()
const emit = defineEmits(['click', 'closed'])
const { height } = useWindowSize()

function onClickWallet(walletId, close) {
  emit('click', walletId)
  close()
}
</script>

<template lang="pug">
BaseBottomSheet(
  :maxHeight="height"
  insideClass="sm_rounded-b-2xl bg-layout-main"
  @closed="emit('closed')"
)
  template(#handler="{ close }")
    BaseBottomSheetHandler
    BaseBottomSheetClose(@onClick="close")

  template(#header)
    .py-4.px-2.text-center.text-item-base.text-xl.font-nunito.font-semibold.bg-layout-main.rounded-t-2xl
      | {{ title }}

  template(#default="{ close }")
    WalletsList(#default="{ walletsItemsSorted }")
      .pb-3.px-2.grid.gap-1
        //- Wallet
        .cursor-pointer.flex.items-center.py-2.px-3.rounded-md.bg-item-main-bg.hocus_bg-item-main-hover(
          v-for="(walletItem, walletId) in walletsItemsSorted"
          :key="walletId"
          @click="onClickWallet(walletId, close)"
        )
          .grow.gap-x-3.flex.items-center
            .grow.flex-center.gap-x-3
              //- Icon
              .w-6.h-6.rounded-md.flex-center.text-icon-base.text-xs.leading-none(
                :style="{ background: walletItem.color }"
                class="mt-[2px]"
              ) {{ walletItem.name.substring(0, 2) }}
              //- Name
              .grow.text-sm.text-item-base {{ walletItem.name }}

            //- Amount
            .text-item-base
              Amount(
                :amount="walletItem.amount"
                :currencyCode="walletItem.currency"
              )
</template>
