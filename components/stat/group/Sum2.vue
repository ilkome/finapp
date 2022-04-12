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
div
  .py-3
    .overflow-hidden.overflow-x-auto.scrollbar
      .flex.items-center.gap-6
        //- Income
        div
          .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base {{ $t('money.expense') }}
          Amount(
            :currency="$store.state.currencies.base"
            :type="0"
            :value="total.expense"
            size="lg"
            vertical="left"
          )

        //- Expense
        div
          .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base {{ $t('money.income') }}
          Amount(
            :currency="$store.state.currencies.base"
            :type="1"
            :value="total.income"
            size="lg"
            vertical="left"
          )

        //- Sum
        div
          .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base {{ $t('money.sum') }}
          Amount(
            :currency="$store.state.currencies.base"
            :type="3"
            :value="total.sum"
            size="lg"
            vertical="left"
          )

        //- //- Average
        //- LazyStatSummaryRowItemView(
        //-   v-if="statPage.average[typeText] !== 0"
        //-   :amount="statPage.average[typeText]"
        //-   :title="$t(`money.average.${typeText}`)"
        //-   :type="typeNumber"
        //- )

        //- //- Today
        //- LazyStatSummaryRowItemView(
        //-   v-if="statToday && statToday[typeText].total !== 0"
        //-   :amount="statToday[typeText].total"
        //-   :title="$t('dates.day.today')"
        //-   :type="typeNumber"
        //- )
</template>
