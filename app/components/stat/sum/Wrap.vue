<script setup lang="ts">
import type { MoneyTypeSlugNew } from '~/components/stat/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  isShowExpense: boolean
  isShowIncome: boolean
  selectedType: MoneyTypeSlugNew
  totals: TotalReturns
  type: MoneyTypeSlugNew
}>()

const emit = defineEmits<{
  onClickSum: [type: MoneyTypeSlugNew]
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
    emit('onClickSum', type)
  }
}
</script>

<template>
  <div class="pt-3 md:max-w-lg">
    <div
      v-if="props.type === 'sum'"
      class="flex flex-wrap justify-stretch gap-1"
    >
      <StatSum
        v-if="props.isShowExpense"
        :amount="-totals.expense"
        :isActive="selectedType === 'expense'"
        :class="classes"
        class="grow"
        type="expense"
        @click="onClick('expense')"
      />
      <StatSum
        v-if="props.isShowIncome"
        :amount="totals.income"
        :isActive="selectedType === 'income'"
        :class="classes"
        class="grow"
        type="income"
        @click="onClick('income')"
      />
      <StatSum
        v-if="props.isShowIncome && props.isShowExpense"
        :amount="totals.sum"
        :class="classes"
        class="grow"
        type="sum"
        @click="onClick('sum')"
      />
    </div>

    <StatSum
      v-else
      :amount="props.type === 'income' ? totals[props.type] : -totals[props.type]"
      :class="classes"
      :type="props.type"
    />
  </div>
</template>
