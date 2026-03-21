<script setup lang="ts">
import type { TrnId } from '~/components/trns/types'

defineProps<{
  isPeriodOneDay: boolean
  selectedTrnsIds: TrnId[]
  storageKey: string
}>()

const { t } = useI18n()
</script>

<template>
  <div class="mb-4 min-w-0 @3xl/main:max-w-md">
    <UiToggle
      v-if="selectedTrnsIds.length > 0"
      :storageKey="`${storageKey}-trns`"
      :initStatus="true"
    >
      <template #header="{ toggle, isShown }">
        <UiTitleCollapse :isShown @click="toggle">
          {{ t('trns.title') }} {{ (!isShown && selectedTrnsIds.length > 0) ? selectedTrnsIds.length : '' }}
        </UiTitleCollapse>

        <TrnsList
          v-if="isShown"
          :isShowDates="!isPeriodOneDay"
          :isShowGroupSum="!isPeriodOneDay"
          :trnsIds="selectedTrnsIds"
          isShowExpense
          isShowFilterByDesc
          isShowIncome
          isShowTransfers
          isShowFilterByType
          class="pt-2"
        />
      </template>
    </UiToggle>

    <TrnsNoTrns v-else />
  </div>
</template>
