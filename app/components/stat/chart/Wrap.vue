<script setup lang="ts">
import dayjs from 'dayjs'
import type { IntervalRangeProvider, Range } from '~/components/date/types'
import type { StatConfigProvider } from '~/components/stat/useStatConfig'
import type { ChartType } from '~/components/stat/chart/types'

const props = defineProps<{
  maxRange: Range
  series: unknown[]
  xAxisLabels: number[]
}>()

const emit = defineEmits<{
  onClickChart: [idx: number]
}>()

const intervalRange = inject('intervalRange') as IntervalRangeProvider
const statConfig = inject('statConfig') as StatConfigProvider

const isShowDateSelector = defineModel('isShowDateSelector', {
  default: false,
})
</script>

<template>
  <div
    :class="{
      '': statConfig.config.value?.chartView === 'full',
      'md:max-w-md': statConfig.config.value?.chartView === 'half',
    }"
  >
    <div
      v-if="statConfig.config.value?.chartShow && (intervalRange.params.value.intervalDuration !== 1 || intervalRange.params.value.intervalPeriod !== 'day')"
      class="pb-2"
    >
      <div class="flex justify-between">
        <LazyStatChartTypeSelector
          :chartType="statConfig.config.value?.chartType"
          @update:chartType="(value: ChartType) => statConfig.updateConfig('chartType', value)"
        />
        <LazyStatChartIntervals
          v-model:period="intervalRange.params.value.groupedBy"
          :range="intervalRange.range.value"
        />
      </div>

      <StatChartView2
        :xAxisLabels
        :chartType="statConfig.config.value?.chartType"
        :period="intervalRange.params.value.groupedBy"
        :series="props.series"
        @click="v => emit('onClickChart', v)"
      />
    </div>

    <div class="flex items-end justify-between gap-2">
      <UiTitle10 @click="isShowDateSelector = !isShowDateSelector">
        <DateViewRange />
      </UiTitle10>

      <div
        v-if="!intervalRange.params.value.customDate"
        class="flex gap-1"
      >
        <DateNavHome
          v-if="intervalRange.params.value.intervalSelected !== -1 || (intervalRange.range.value.start !== dayjs().subtract(intervalRange.params.value.intervalDuration - 1, intervalRange.params.value.intervalPeriod).startOf(intervalRange.params.value.intervalPeriod).valueOf() && intervalRange.range.value.end !== dayjs().endOf(intervalRange.params.value.intervalPeriod).valueOf() && !intervalRange.params.value.isShowAll)"
        />

        <DateNav
          v-if="!intervalRange.params.value.isShowAll && (intervalRange.range.value.start < dayjs().valueOf() || (intervalRange.range.value.start !== maxRange.start && intervalRange.range.value.end !== maxRange.end))"
          :maxRange
        />
      </div>
    </div>
  </div>
</template>
