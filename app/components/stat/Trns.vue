<script setup lang="ts">
import type { StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

defineProps<{
  isPeriodOneDay: boolean
  selectedTrnsIds: TrnId[]
  storageKey: string
  type: StatTabSlug
}>()
</script>

<template>
  <div class="mb-4 @3xl/main:max-w-md">
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
    />

    <TrnsNoTrns v-else />
  </div>
</template>
