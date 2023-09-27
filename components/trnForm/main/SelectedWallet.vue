<script setup lang="ts">
import useWallets from '~/components/wallets/useWallets'
import type { WalletId } from '~/components/wallets/types'

import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const props = defineProps<{
  id: WalletId
  isHideDots: boolean
}>()

const emit = defineEmits(['click'])

const $trnForm = useTrnFormStore()
const { walletsItemsSorted } = useWallets()

const wallet = computed(() => walletsItemsSorted.value[props.id])
</script>

<template lang="pug">
.cursor-pointer.flex.items-center.py-2.px-3.rounded-md.bg-skin-item-main-bg.hocus_bg-skin-item-main-hover(
  v-if="wallet"
  @click="emit('click', id)"
)
  .grow.flex-center.gap-x-3
    //- Icon
    .w-6.h-6.rounded-md.flex-center.text-skin-icon-base.text-xs.leading-none(
      :style="{ background: wallet.color }"
      class="mt-[2px]"
    ) {{ wallet.name.substring(0, 2) }}

    .grow
      //- Name
      .text-sm.text-skin-item-base {{ wallet.name }}

      //- Amount
      .text-skin-item-base
        Amount(
          :amount="wallet.amount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="false"
          align="left"
        )

  .mdi.mdi-dots-vertical.-mr-1.text-lg.text-skin-item-base-down(v-if="!isHideDots")
</template>
