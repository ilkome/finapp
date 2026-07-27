<script setup lang="ts">
import type { TrnId } from '~/components/trns/types'

const props = defineProps<{
  isPeriodOneDay: boolean
  selectedTrnsIds: TrnId[]
  storageKey: string
}>()

const { t } = useI18n()

const shown = useStoredToggle(`${props.storageKey}-trns`, true)
</script>

<template>
  <div class="mb-4 min-w-0 @3xl/main:max-w-md">
    <UCollapsible
      v-if="selectedTrnsIds.length > 0"
      v-model:open="shown"
    >
      <UiTitleCollapse :isShown="shown">
        {{ t('trns.title') }} {{ (!shown && selectedTrnsIds.length > 0) ? selectedTrnsIds.length : '' }}
      </UiTitleCollapse>

      <template #content>
        <TrnsList
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
    </UCollapsible>

    <TrnsNoTrns v-else />
  </div>
</template>
