<script setup lang="ts">
import dayjs from 'dayjs'
import type { IntervalRangeProvider, Range } from '~/components/date/types'
import type { MiniItemConfig } from '~/components/stat/types'
import type { ChartType } from '~/components/stat/chart/types'

const props = defineProps<{
  config: MiniItemConfig
  maxRange: Range
  series: unknown[]
  xAxisLabels: number[]
}>()

const emit = defineEmits<{
  onClickChart: [idx: number]
  updateConfig: [key: keyof MiniItemConfig, value: MiniItemConfig[keyof MiniItemConfig]]
}>()

const isShowDateSelector = defineModel('isShowDateSelector', {
  default: false,
})

const intervalRange = inject('intervalRange') as IntervalRangeProvider
</script>

<template>
  <div
    class="xl:rounded-xl"
    :class="{
      '': props.config?.chartView === 'full',
      'md:max-w-md': props.config?.chartView === 'half',
    }"
  >
    <div
      v-if="props.config?.chartShow && (intervalRange.interval.value.duration !== 1 || intervalRange.interval.value.period !== 'day')"
      class="pb-2"
    >
      <div class="flex justify-between">
        <LazyStatChartTypeSelector
          :chartType="props.config.chartType"
          @update:chartType="(value: ChartType) => emit('updateConfig', 'chartType', value)"
        />
        <LazyStatChartIntervals
          v-model:period="intervalRange.grouped.value.period"
          :range="intervalRange.range.value"
        />
      </div>

      <StatChartView2
        :xAxisLabels
        :chartType="props.config.chartType"
        :period="intervalRange.grouped.value.period"
        :series="props.series"
        @click=" v => emit('onClickChart', v)"
      />
    </div>

    <div class="flex items-end justify-between gap-2">
      <UiTitle10 @click="isShowDateSelector = !isShowDateSelector">
        <DateViewRange
          :isShowAll="intervalRange.viewConfig.value.isShowAll"
          :range="intervalRange.interval.value.selected !== -1
            ? (intervalRange.groupedPeriods.value[intervalRange.interval.value.selected]
              ? intervalRange.groupedPeriods.value[intervalRange.interval.value.selected]
              : intervalRange.range.value)
            : intervalRange.range.value"
          :interval="intervalRange.interval.value"
        />
      </UiTitle10>

      <div
        v-if="!intervalRange.params.value.customDate"
        class="flex gap-1"
      >
        <DateNavHome
          v-if="intervalRange.interval.value.selected !== -1 || (intervalRange.range.value.start !== dayjs().subtract(intervalRange.interval.value.duration - 1, intervalRange.interval.value.period).startOf(intervalRange.interval.value.period).valueOf() && intervalRange.range.value.end !== dayjs().endOf(intervalRange.interval.value.period).valueOf() && !intervalRange.viewConfig.value.isShowAll)"
          :intervalRange
        />

        <DateNav
          v-if="!intervalRange.viewConfig.value.isShowAll && (intervalRange.range.value.start < dayjs().valueOf() || (intervalRange.range.value.start !== maxRange.start && intervalRange.range.value.end !== maxRange.end))"
          :maxRange
          :intervalRange
        />
      </div>
    </div>
  </div>
</template>
