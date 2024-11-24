<script setup lang="ts">
import { sub } from 'date-fns'
import type { Range, StatDateProvider } from '~/components/date/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { ChartType } from '~/components/stat/chart/types'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { getEndOf, getStartOf } from '~/components/date/utils'

const props = defineProps<{
  maxRange: Range
  series: unknown[]
  xAxisLabels: number[]
}>()

const statDate = inject('statDate') as StatDateProvider
const statConfig = inject('statConfig') as StatConfigProvider
const trnsFormStore = useTrnsFormStore()

const isShowDateSelector = defineModel('isShowDateSelector', {
  default: false,
})

function onClickChart(idx: number) {
  const newPeriod = idx

  // Handle when click outside of chart
  if (newPeriod === statDate.groupedPeriods.value.length) {
    statDate.params.value.intervalSelected = -1
    return
  }

  // Handle when click on the same period
  if (statDate.params.value.intervalSelected === newPeriod) {
    statDate.params.value.intervalSelected = -1
  }
  else {
    statDate.params.value.intervalSelected = newPeriod

    if (statDate.params.value.intervalsBy === 'day' && statDate.params.value.intervalsDuration === 1) {
      const day = statDate.groupedPeriods.value[statDate.params.value.intervalSelected]?.start
      if (day) {
        trnsFormStore.values.date = day
      }
    }
  }
}

const isShowNavHome = computed(() => {
  const start = getStartOf(sub(new Date(), { [`${statDate.params.value.rangeBy}s`]: statDate.params.value.rangeDuration - 1 }), statDate.params.value.rangeBy).getTime()
  const end = getEndOf(new Date(), statDate.params.value.rangeBy).getTime()

  return !statDate.params.value.isShowMaxRange && (statDate.params.value.intervalSelected !== -1 || (statDate.range.value.start !== start && statDate.range.value.end !== end))
})

const isShowNavPrev = computed(() => {
  return statConfig.config.value?.chartShow && (statDate.params.value.rangeDuration !== 1 || statDate.params.value.rangeBy !== 'day') && statDate.groupedPeriods.value.length > 1
})

const isShowNavNext = computed(() => {
  return !statDate.params.value.isShowMaxRange && (statDate.range.value.start < new Date().getTime() || (statDate.range.value.start !== props.maxRange.start && statDate.range.value.end !== props.maxRange.end))
})
</script>

<template>
  <div
    :class="{
      '': statConfig.config.value?.chartView === 'full',
      'md:max-w-lg': statConfig.config.value?.chartView === 'half',
    }"
  >
    <div
      v-if="isShowNavPrev"
      class="pb-2"
    >
      <div class="flex justify-between">
        <LazyStatChartTypeSelector
          :chartType="statConfig.config.value?.chartType"
          @update:chartType="(value: ChartType) => statConfig.updateConfig('chartType', value)"
        />
        <LazyStatChartIntervals
          v-model:period="statDate.params.value.intervalsBy"
          :range="statDate.range.value"
        />
      </div>

      <StatChartView
        :xAxisLabels
        :chartType="statConfig.config.value?.chartType"
        :period="statDate.params.value.intervalsBy"
        :series="props.series"
        @click="onClickChart"
      />
    </div>

    <div class="flex items-end justify-between gap-2">
      <UiTitle10 @click="isShowDateSelector = !isShowDateSelector">
        <StatDateRange />
      </UiTitle10>

      <div
        v-if="!statDate.params.value.customDate"
        class="flex gap-1"
      >
        <DateNavHome
          v-if="isShowNavHome"
        />

        <DateNav
          v-if="isShowNavNext"
          :maxRange
        />
      </div>
    </div>
  </div>
</template>
