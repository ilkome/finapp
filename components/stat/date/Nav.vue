<script setup lang="ts">
import dayjs from 'dayjs'
import { getStyles } from '~/components/ui/classes'
import type { PeriodName, PeriodNameWithAll } from '~/components/chart/useChartStore'

const setNextPeriodDate = inject('setNextPeriodDate') as () => void
const setPrevPeriodDate = inject('setPrevPeriodDate') as () => void
const date = inject('date') as Ref<number>
const periodWithoutAll = inject('periodWithoutAll') as Ref<PeriodName>
const setPeriodAndDate = inject('setPeriodAndDate') as (period: PeriodNameWithAll) => void

const isToday = computed(() => dayjs().isSame(date.value, periodWithoutAll.value))
</script>

<template>
  <div class="flex">
    <div
      :class="getStyles('item', ['link', 'rounded'])"
      @click="setNextPeriodDate"
    >
      <UiIconChevron class="size-8" />
    </div>

    <div
      :class="[...getStyles('item', ['link', 'rounded']), { 'opacity-30 !cursor-default': isToday }]"
      @click="setPrevPeriodDate"
    >
      <UiIconChevron class="size-8 rotate-180" />
    </div>

    <div
      v-if="!isToday"
      :class="getStyles('item', ['link', 'rounded'])"
      class="pt-2 px-1"
      @click="setPeriodAndDate(periodWithoutAll)"
    >
      <UiIconReturn class="size-5" />
    </div>
  </div>
</template>
