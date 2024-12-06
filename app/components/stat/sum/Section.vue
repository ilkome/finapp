<script setup lang="ts">
import type { MoneyTypeSlugNew } from '~/components/stat/types'
import type { TotalReturns } from '~/components/amount/getTotal'

type StatTypeShow = {
  expense: boolean
  income: boolean
}

defineProps<{
  selectedType: MoneyTypeSlugNew
  statTypeShow: StatTypeShow
  total: TotalReturns
  type: MoneyTypeSlugNew
}>()

defineEmits<{
  click: [type: MoneyTypeSlugNew]
}>()
</script>

<template>
  <StatSumWrap
    :total="total"
    :isShowExpense="statTypeShow.expense"
    :isShowIncome="statTypeShow.income"
    :selectedType="selectedType"
    :type="type"
    @click="$emit('click', $event)"
  />
</template>
