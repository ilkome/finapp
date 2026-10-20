<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import { BarChart, CustomChart, LineChart } from 'echarts/charts'
import { DataZoomInsideComponent, GridComponent, MarkAreaComponent, MarkLineComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import type { ChartScaleMode } from '~/components/stat/chart/options'
import type { AxisChartType, ChartTooltipRow } from '~/components/stat/chart/types'
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
  isRoundIcon = false,
  isShowMaxRange = false,
  isTooltipOnTap = false,
  panOffset = 0,
  period,
  scaleMode,
  series,
  startValue,
  tooltipRows,
  tooltipTitles,
  xAxisLabels,
} = defineProps<{
  bufferSize?: number
  /** The `chart` slice of the stat config, passed as plain data so the view stays store-free. */
  chartConfig: MiniItemConfig['chart']
  chartType?: AxisChartType
  commitCount?: number
  endValue?: number
  isPannable?: boolean
  isRoundIcon?: boolean
  isShowMaxRange?: boolean
  isTooltipOnTap?: boolean
  panOffset?: number
  period: Period
  scaleMode?: ChartScaleMode
  series: ChartSeries[]
  startValue?: number
  /** Precomputed tooltip lines per data index; without them the tooltip lists the series values. */
  tooltipRows?: ChartTooltipRow[][]
  tooltipTitles?: string[]
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

function tooltipIndex(params: unknown): number {
  return (Array.isArray(params) ? params[0]?.dataIndex : undefined) ?? -1
}

const option = computed(() => buildAxisChartOption({
  chartConfig,
  chartType,
  endValue,
  isPannable,
  isShowMaxRange,
  isTooltipOnTap,
  locale: locale.value,
  period,
  scaleMode,
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
        <StatChartAxisTooltip
          :isRoundIcon
          :params
          :period
          :rows="tooltipRows?.[tooltipIndex(params)]"
          :series
          :title="tooltipTitles?.[tooltipIndex(params)]"
        />
      </template>
    </VChart>
  </div>
</template>
