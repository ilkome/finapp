<script setup lang="ts">
import type { TotalReturns } from '~/components/amount/getTotal'
import type { MoneyTypeSlugNew } from '~/components/stat/types'

import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  averageTotal?: Record<string, number>
  isShowExpense: boolean
  isShowIncome: boolean
  selectedType: MoneyTypeSlugNew
  total: TotalReturns
  type: MoneyTypeSlugNew
}>()

const emit = defineEmits<{
  click: [type: MoneyTypeSlugNew]
}>()

const classes = computed(() => {
  const params = ['padding3', 'center', 'minh1', 'minw1', 'rounded']

  if (props.isShowIncome && props.isShowExpense && props.type === 'netIncome') {
    params.push('link')
  }

  return getStyles('item', params)
})

function onClick(type: MoneyTypeSlugNew) {
  if (props.isShowIncome && props.isShowExpense) {
    emit('click', type)
  }
}
</script>

<template>
  <div class="rounded-md md:max-w-lg">
    <div
      v-if="props.type === 'netIncome'"
      class="flex flex-wrap justify-stretch"
    >
      <StatSumItem
        v-if="props.isShowExpense"
        :amount="-total.expense"
        :isActive="selectedType === 'expense'"
        :class="classes"
        class="grow"
        type="expense"
        @click="onClick('expense')"
      />

      <StatSumItem
        v-if="props.isShowIncome"
        :amount="total.income"
        :isActive="selectedType === 'income'"
        :class="classes"
        class="grow"
        type="income"
        @click="onClick('income')"
      />

      <StatSumItem
        v-if="props.isShowIncome && props.isShowExpense"
        :amount="total.sum"
        :class="classes"
        class="grow"
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
