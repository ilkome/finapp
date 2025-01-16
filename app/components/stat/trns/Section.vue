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
  <UiToggle
    v-if="selectedTrnsIds.length > 0"
    :storageKey="`${storageKey}-${type}trns-all`"
    :initStatus="true"
    class="md:max-w-lg"
  >
    <template #header="{ toggle, isShown }">
      <div class="flex items-center justify-between">
        <UiTitle8 :isShown @click="toggle">
          {{ $t('trns.title') }} {{ (!isShown && selectedTrnsIds.length > 0) ? selectedTrnsIds.length : '' }}
        </UiTitle8>
      </div>
    </template>

    <TrnsList
      :isShowDates="!isPeriodOneDay"
      :isShowGroupSum="!isPeriodOneDay"
      :trnsIds="selectedTrnsIds"
      class="py-1"
      isShowExpense
      isShowFilterByDesc
      isShowFilterByType
      isShowIncome
      isShowTransfers
    />
  </UiToggle>

  <TrnsNoTrns
    v-else
    class="md:max-w-lg"
  />
</template>
