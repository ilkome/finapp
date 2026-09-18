<script setup lang="ts">
import type { Period, Range } from '~~/utils/date/types'

import type { AxisChartType, ChartType } from '~/components/stat/chart/types'
import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { ChartSeries } from '~/components/stat/types'

const props = defineProps<{
  chartConfig: MiniItemConfig['chart']
  chartType: ChartType
  isShowMaxRange?: boolean
  panOffset?: number
  period: Period
  range: Range
  series: ChartSeries[]
  /** Visible window of the pannable axis chart; omitted for a static chart. */
  window?: {
    bufferSize: number
    commitCount: number
    endValue?: number
    isPannable: boolean
    startValue?: number
  }
  xAxisLabels: number[]
}>()

const emit = defineEmits<{
  changePeriod: [period: Period]
  click: [intervalKey: number]
  preview: [startValue: number, endValue: number]
  previewEnd: []
  select: []
}>()

// Charts mount on the first idle frame so echarts doesn't compete with the LCP render.
const isChartMountReady = useIdleMount()
const axisChartType = computed<AxisChartType>(() => props.chartType === 'pie' ? 'bar' : props.chartType)
</script>

<template>
  <div
    v-if="props.chartConfig.isShow"
    class="relative max-w-full min-w-0"
    :class="{
      'stat-column-width': props.chartConfig.layout === 'combined-narrow',
    }"
  >
    <div class="-mb-1 flex h-8 items-center gap-1">
      <div class="h-7" :class="{ invisible: props.chartType === 'pie' }">
        <StatChartIntervalSelect
          :period="props.period"
          :range="props.range"
          @changePeriod="emit('changePeriod', $event)"
        />
      </div>
    </div>

    <div
      v-if="$slots.settings"
      class="absolute z-1"
      :class="props.chartConfig.isShowBackground
        ? '-top-1 -right-1 md:-top-2 md:-right-2'
        : 'top-1 right-1'"
    >
      <slot name="settings" />
    </div>

    <div class="min-h-40 max-w-full min-w-0 @3xl/stat:min-h-52">
      <LazyStatChartSimplePieView
        v-if="isChartMountReady && props.chartType === 'pie'"
        :endValue="props.window?.endValue"
        :isDonut="props.chartConfig.pie.shape === 'donut'"
        :isShowLabels="props.chartConfig.pie.isShowLabels"
        :isShowPercent="props.chartConfig.pie.isShowPercent"
        :series="props.series"
        :startValue="props.window?.startValue"
        :xAxisLabels="props.xAxisLabels"
        @select="emit('select')"
      />
      <LazyStatChartAxisView
        v-else-if="isChartMountReady"
        :bufferSize="props.window?.bufferSize"
        :chartConfig="props.chartConfig"
        :chartType="axisChartType"
        :commitCount="props.window?.commitCount"
        :endValue="props.window?.endValue"
        :isPannable="props.window?.isPannable"
        :isShowMaxRange="props.isShowMaxRange"
        :panOffset="props.panOffset"
        :period="props.period"
        :series="props.series"
        :startValue="props.window?.startValue"
        :xAxisLabels="props.xAxisLabels"
        @click="emit('click', $event)"
        @preview="(start, end) => emit('preview', start, end)"
        @previewEnd="emit('previewEnd')"
      />
    </div>
  </div>
</template>
