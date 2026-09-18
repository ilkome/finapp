<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import { BarChart, CustomChart, LineChart } from 'echarts/charts'
import { DataZoomInsideComponent, GridComponent, MarkAreaComponent, MarkLineComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import type { AxisChartType } from '~/components/stat/chart/types'
import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { ChartSeries } from '~/components/stat/types'

import { buildAxisChartOption } from '~/components/stat/chart/axisOption'
import { useAxisChartPan } from '~/components/stat/chart/useAxisChartPan'

const {
  bufferSize = 0,
  chartConfig,
  chartType = 'line',
  commitCount = 0,
  endValue,
  isPannable = false,
  isShowMaxRange = false,
  panOffset = 0,
  period,
  series,
  startValue,
  xAxisLabels,
} = defineProps<{
  bufferSize?: number
  /** The `chart` slice of the stat config, passed as plain data so the view stays store-free. */
  chartConfig: MiniItemConfig['chart']
  chartType?: AxisChartType
  commitCount?: number
  endValue?: number
  isPannable?: boolean
  isShowMaxRange?: boolean
  panOffset?: number
  period: Period
  series: ChartSeries[]
  startValue?: number
  xAxisLabels: number[]
}>()

const emit = defineEmits<{
  click: [intervalKey: number]
  preview: [startValue: number, endValue: number]
  previewEnd: []
}>()

use([BarChart, CustomChart, DataZoomInsideComponent, GridComponent, LineChart, MarkAreaComponent, MarkLineComponent, SVGRenderer, TooltipComponent])

const { locale, t } = useI18n()
const { width: viewportWidth } = useWindowSize()
const isDev = import.meta.dev
const chartRef = ref()

// The chart is an SVG the screen reader can't read; label it as an image. The
// underlying numbers are exposed in the summary tiles and category list.
const chartAriaLabel = computed(() => {
  const names = series
    .map(s => s.name)
    .filter(Boolean)
    .join(', ')
  return names ? `${t('chart.label')}: ${names}` : t('chart.label')
})

const option = computed(() => buildAxisChartOption({
  chartConfig,
  chartType,
  endValue,
  isPannable,
  isShowMaxRange,
  locale: locale.value,
  period,
  series,
  startValue,
  viewportWidth: viewportWidth.value,
  xAxisLabels,
}))

const {
  onClickChart,
  onDataZoom,
  onKeyDown,
  onPointerDown,
  onPointerEnd,
  onPointerMove,
  onWheel,
  visibleBucketCount,
} = useAxisChartPan({
  chartRef,
  emit,
  getEndValue: () => endValue,
  getStartValue: () => startValue,
  getXAxisLabels: () => xAxisLabels,
  isPannable: () => isPannable,
})
</script>

<template>
  <div
    class="h-40 cursor-default touch-pan-y **:cursor-default! @3xl/stat:h-52"
    role="img"
    :aria-label="chartAriaLabel"
    :data-stat-chart-buffer-size="isDev ? bufferSize : undefined"
    :data-stat-chart-commit-count="isDev ? commitCount : undefined"
    :data-stat-chart-pan-offset="panOffset"
    :data-stat-chart-pannable="isPannable ? 'true' : 'false'"
    :data-stat-chart-start-value="isDev ? startValue : undefined"
    :data-stat-chart-end-value="isDev ? endValue : undefined"
    :data-stat-chart-visible-count="isDev ? visibleBucketCount : undefined"
    tabindex="0"
    @keydown="onKeyDown"
    @pointercancel="onPointerEnd"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerEnd"
    @wheel.capture="onWheel"
    @click="onClickChart"
  >
    <VChart
      ref="chartRef"
      :option
      :updateOptions="{ replaceMerge: ['series', 'xAxis', 'yAxis'] }"
      autoresize
      @datazoom="onDataZoom"
    >
      <template #tooltip="params">
        <StatChartAxisTooltip :params :period :series />
      </template>
    </VChart>
  </div>
</template>
