<script setup lang="ts">
import type { TotalReturns } from '~/components/amount/getTotal'
import type { StatTabSlug } from '~/components/stat/types'

import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  averageTotal?: Record<string, number>
  isShowAverage: boolean
  isShowExpense: boolean
  isShowIncome: boolean
  selectedType: StatTabSlug
  total: TotalReturns
  type: StatTabSlug
}>()

const emit = defineEmits<{
  click: [type: StatTabSlug]
  clickAverage: []
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
  <div>
    <div
      v-if="props.type === 'netIncome'"
      class="flex flex-wrap justify-stretch md:max-w-lg"
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
        :averageTotal="props.isShowAverage ? props.averageTotal : undefined"
        :amountProps="{
          variant: '3xl',
        }"
        @click="emit('clickAverage')"
      >
        <slot v-if="props.isShowAverage" name="average" />
      </StatSumItem>
    </div>
  </div>
</template>
