<script setup lang="ts">
import type { TrnID } from '~/components/trns/types'

const props = withDefaults(defineProps<{
  trnsIds: TrnID[]
}>(), {
  trnsIds: () => [],
})

const { $store } = useNuxtApp()
const total = computed(() => $store.getters['trns/getTotalOfTrnsIds'](props.trnsIds))
</script>

<template lang="pug">
.py-3
  .overflow-hidden.overflow-x-auto.scrollbar
    .flex.items-center.gap-6
      //- Expense
      div
        .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base
          | {{ $t('money.expense') }}
        .text-xl
          Amount(
            :amount="total.expense"
            :currency="$store.state.currencies.base"
            :type="0"
            :isShowBaseRate="false"
            colorize="expense"
          )

      //- Income
      div
        .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base
          | {{ $t('money.income') }}
        .text-xl
          Amount(
            :amount="total.income"
            :currency="$store.state.currencies.base"
            :type="1"
            :isShowBaseRate="false"
            colorize="income"
          )

      //- Sum
      div
        .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base
          | {{ $t('money.sum') }}
        .text-xl
          Amount(
            :amount="total.sum"
            :currency="$store.state.currencies.base"
            :type="3"
            :isShowBaseRate="false"
          )
</template>
