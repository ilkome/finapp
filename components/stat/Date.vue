<script setup lang="ts">
import { getStyles } from '~/components/ui/classes'
import type {
  PeriodName,
  PeriodNameWithAll,
} from '~/components/chart/useChart'

defineProps<{
  isShowDateSelector: boolean
  periodWithoutAll: PeriodName
  period: PeriodNameWithAll
  date: number
}>()

const emit = defineEmits<{
  open: []
  close: []
  setPrevPeriodDate: []
  setNextPeriodDate: []
  setPeriodAndDate: [period: PeriodNameWithAll]
}>()
</script>

<template>
  <div class="flex items-center justify-between gap-2 px-2">
    <div class="flex">
      <div
        :class="getStyles('item', ['link', 'rounded'])"
        @click="emit('setNextPeriodDate')"
      >
        <UiIconChevron class="size-8" />
      </div>

      <div
        :class="getStyles('item', ['link', 'rounded'])"
        @click="emit('setPrevPeriodDate')"
      >
        <UiIconChevron class="size-8 rotate-180" />
      </div>
    </div>

    <div
      :class="getStyles('item', ['link', 'rounded'])"
      class="flex grow items-center px-3 py-2"
      @click="emit('open')"
    >
      <div class="font-primary font-semibold leading-none text-item-1">
        <SharedDate :date :period />
      </div>
      <div class="mdi mdi-dots-vertical" />
    </div>

    <CurrenciesChangeBtn />
  </div>

  <LazyDateSelector
    v-if="isShowDateSelector"
    :period
    :periodWithoutAll
    @close="emit('close')"
    @setPeriodAndDate="v => emit('setPeriodAndDate', v)"
  />
</template>
