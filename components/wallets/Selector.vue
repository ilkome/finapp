<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

defineProps<{
  // isShow: boolean
  title: string
}>()

const emit = defineEmits<{
  onSelected: [id: WalletId]
  onClose: []
}>()

function onClickWallet(walletId: WalletId, close: () => void) {
  emit('onSelected', walletId)
  close()
}
</script>

<template lang="pug">
div
  //- Root Categories
  TrnFormModal(
    @closed="emit('onClose')"
  )
    template(#header)
      div {{ title }}

    template(#default="{ close }")
      WalletsList(#default="{ walletsItemsSorted }")
        .pb-3.px-2.grid.gap-1.text-secondary2
          //- Wallet
          .cursor-pointer.flex.items-center.py-2.px-3.rounded-md.bg-item-4.hocus_bg-item-5(
            v-for="(walletItem, walletId) in walletsItemsSorted"
            :key="walletId"
            @click="onClickWallet(walletId, close)"
          )
            .grow.gap-x-3.flex.items-center
              .grow.flex-center.gap-x-3
                //- Icon
                .w-6.h-6.rounded-md.flex-center.text-icon-primary.text-xs.leading-none(
                  :style="{ background: walletItem.color }"
                  class="mt-[2px]"
                ) {{ walletItem.name.substring(0, 2) }}
                //- Name
                .grow.text-sm {{ walletItem.name }}

              //- Amount
              .text-item-base
                Amount(
                  :amount="walletItem.amount"
                  :currencyCode="walletItem.currency"
                )
</template>
