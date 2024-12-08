<script setup lang="ts">
import type { MoneyTypeSlugNew } from '~/components/stat/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
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
  const params = ['padding3', 'center', 'minh', 'minw1', 'rounded']

  if (props.isShowIncome && props.isShowExpense) {
    params.push('bg', 'link')
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
  <div>
    <div
      v-if="props.type === 'netIncome'"
      class="flex flex-wrap justify-stretch gap-1"
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

    <StatSumItem
      v-else
      :amount="props.type === 'income' ? total[props.type] : -total[props.type]"
      :class="classes"
      :type="props.type"
    />
  </div>
</template>
