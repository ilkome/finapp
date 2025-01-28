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
  <div class="@2xl/page:my-2 mb-2 overflow-x-auto">
    <div
      v-if="props.type === 'netIncome' || props.type === 'trns'"
      class="@2xl/page:justify-start @2xl/page:gap-x-4 flex flex-wrap justify-stretch gap-2"
    >
      <StatSumItem
        v-if="props.isShowExpense"
        :amount="-total.expense"
        :isActive="selectedType === 'expense'"
        :class="classes"
        class="grow md:grow-0"
        type="expense"
        @click="onClick('expense')"
      >
        <slot v-if="props.isShowAverage" name="expense" />
      </StatSumItem>

      <StatSumItem
        v-if="props.isShowIncome"
        :amount="total.income"
        :isActive="selectedType === 'income'"
        :class="classes"
        class="grow md:grow-0"
        type="income"
        @click="onClick('income')"
      >
        <slot v-if="props.isShowAverage" name="income" />
      </StatSumItem>

      <StatSumItem
        v-if="props.isShowIncome && props.isShowExpense"
        :amount="total.sum"
        :class="classes"
        class="grow md:grow-0"
        type="summary"
        @click="onClick('summary')"
      >
        <slot v-if="props.isShowAverage" name="summary" />
      </StatSumItem>
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
