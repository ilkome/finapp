<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import { BarChart, CustomChart, LineChart } from 'echarts/charts'
import { DataZoomInsideComponent, GridComponent, MarkAreaComponent, MarkLineComponent, MarkPointComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import type { ChartScaleMode } from '~/components/stat/chart/options'
import type { AxisChartType, ChartTooltipRow } from '~/components/stat/chart/types'
import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { ChartSeries } from '~/components/stat/types'

import { buildAxisChartOption } from '~/components/stat/chart/axisOption'
import { formatChartAmount, formatChartTooltipLabel } from '~/components/stat/chart/format'
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
  tooltipLinkLabel,
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
  /** A link in the tooltip; tapping it emits `tooltipLink` with the data index. */
  tooltipLinkLabel?: string
  /** Precomputed tooltip lines per data index; without them the tooltip lists the series values. */
  tooltipRows?: ChartTooltipRow[][]
  tooltipTitles?: string[]
  xAxisLabels: number[]
}>()

const emit = defineEmits<{
  click: [intervalKey: number]
  preview: [startValue: number, endValue: number]
  previewEnd: []
  tooltipLink: [dataIndex: number]
}>()

use([BarChart, CustomChart, DataZoomInsideComponent, GridComponent, LineChart, MarkAreaComponent, MarkLineComponent, MarkPointComponent, SVGRenderer, TooltipComponent])

const { locale, t } = useI18n()
const { width: viewportWidth } = useWindowSize()
const isDev = import.meta.dev
const chartRef = ref()

// The chart is an SVG the screen reader can't read; label it as an image and
// expose its numbers in a visually hidden table.
const chartAriaLabel = computed(() => {
  const names = series
    .map(s => s.name)
    .filter(Boolean)
    .join(', ')
  return names ? `${t('chart.label')}: ${names}` : t('chart.label')
})

const tableRows = computed(() => xAxisLabels.map((date, index) => ({
  label: tooltipTitles?.[index] ?? formatChartTooltipLabel(date, period, locale.value),
  values: series.map(item => formatChartAmount(item.data[index])),
})))

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

// A pannable chart spends the arrow keys on panning; the others move the tooltip.
let keyIndex = -1
function onKeyDownChart(event: KeyboardEvent) {
  if (isPannable)
    return onKeyDown(event)
  if (event.key === 'Escape') {
    keyIndex = -1
    chartRef.value?.dispatchAction({ type: 'hideTip' })
    return
  }
  const delta = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
  if (!delta || !xAxisLabels.length)
    return
  event.preventDefault()
  keyIndex = keyIndex < 0 ? (delta > 0 ? 0 : xAxisLabels.length - 1) : Math.min(Math.max(keyIndex + delta, 0), xAxisLabels.length - 1)
  chartRef.value?.dispatchAction({ dataIndex: keyIndex, seriesIndex: 0, type: 'showTip' })
}
</script>

<template>
  <div
    class="h-40 cursor-default touch-pan-y **:cursor-default! @3xl/stat:h-52"
    role="group"
    :aria-label="chartAriaLabel"
    :data-stat-chart-buffer-size="isDev ? bufferSize : undefined"
    :data-stat-chart-commit-count="isDev ? commitCount : undefined"
    :data-stat-chart-pan-offset="panOffset"
    :data-stat-chart-pannable="isPannable ? 'true' : 'false'"
    :data-stat-chart-start-value="isDev ? startValue : undefined"
    :data-stat-chart-end-value="isDev ? endValue : undefined"
    :data-stat-chart-visible-count="isDev ? visibleBucketCount : undefined"
    tabindex="0"
    @keydown="onKeyDownChart"
    @pointercancel="onPointerEnd"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerEnd"
    @wheel.capture="onWheel"
    @click="onClickChart"
  >
    <VChart
      ref="chartRef"
      role="img"
      :aria-label="chartAriaLabel"
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
          :linkLabel="tooltipLinkLabel"
          @link="emit('tooltipLink', tooltipIndex(params))"
        />
      </template>
    </VChart>
    <table class="sr-only">
      <thead>
        <tr>
          <th />
          <th v-for="(item, index) in series" :key="index" scope="col">
            {{ item.name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in tableRows" :key="index">
          <th scope="row">
            {{ row.label }}
          </th>
          <td v-for="(value, column) in row.values" :key="column">
            {{ value }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
