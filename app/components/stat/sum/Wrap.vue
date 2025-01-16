<script setup lang="ts">
import type { TotalReturns } from '~/components/amount/getTotal'
import type { StatTabSlug } from '~/components/stat/types'

import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  averageTotal?: Record<string, number>
  isShowExpense: boolean
  isShowIncome: boolean
  selectedType: StatTabSlug
  total: TotalReturns
  type: StatTabSlug
}>()

const emit = defineEmits<{
  click: [type: StatTabSlug]
}>()

const classes = computed(() => {
  const params = ['padding3', 'center', 'minh1', 'minw1', 'rounded']

  if (props.isShowIncome && props.isShowExpense && props.type === 'netIncome') {
    params.push('link')
  }

  return getStyles('item', params)
})

function onClick(type: StatTabSlug) {
  if (props.isShowIncome && props.isShowExpense) {
    emit('click', type)
  }
}
</script>

<template>
  <div class="rounded-md pb-4 md:max-w-lg">
    <div
      v-if="props.type === 'netIncome'"
      class="_justify-stretch flex flex-wrap"
    >
      <StatSumItem
        v-if="props.isShowExpense"
        :amount="-total.expense"
        :isActive="selectedType === 'expense'"
        :class="classes"
        class="_grow"
        type="expense"
        @click="onClick('expense')"
      />

      <StatSumItem
        v-if="props.isShowIncome"
        :amount="total.income"
        :isActive="selectedType === 'income'"
        :class="classes"
        class="_grow"
        type="income"
        @click="onClick('income')"
      />

      <StatSumItem
        v-if="props.isShowIncome && props.isShowExpense"
        :amount="total.sum"
        :class="classes"
        class="_grow"
        type="summary"
        @click="onClick('summary')"
      />
    </div>

    <div
      v-else
      class="flex items-center"
    >
      <StatSumItem
        :amount="props.type === 'income' ? total[props.type] : -total[props.type]"
        :class="classes"
        :type="props.type"
        :averageTotal="props.averageTotal"
        :amountProps="{
          variant: '3xl',
        }"
      />
    </div>
  </div>
</template>
