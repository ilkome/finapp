<script setup lang="ts">
import type { TrnId } from '~/components/trns/types'

defineProps<{
  isPeriodOneDay: boolean
  selectedTrnsIds: TrnId[]
}>()
</script>

<template>
  <div class="mb-4 min-w-0 @3xl/main:max-w-md">
    <TrnsList
      v-if="selectedTrnsIds.length > 0"
      :isShowDates="!isPeriodOneDay"
      :isShowGroupSum="!isPeriodOneDay"
      :trnsIds="selectedTrnsIds"
      isShowExpense
      isShowFilterByDesc
      isShowIncome
      isShowHeader
      isShowTransfers
      isShowFilterByType
    />

    <TrnsNoTrns v-else />
  </div>
</template>
