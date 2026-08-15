<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import defu from 'defu'
import { BarChart, LineChart } from 'echarts/charts'
import { DataZoomInsideComponent, GridComponent, MarkAreaComponent, MarkLineComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { formatByLocale } from '~~/utils/date/civil'

import type { ChartType } from '~/components/stat/chart/types'
import type { ChartSeries } from '~/components/stat/types'

import { formatChartAmount, formatChartAxisLabel, getFormatForChart } from '~/components/stat/chart/format'
import { baseOption, buildChartSeries, filterChartTooltipParams, resolveChartTooltipPosition } from '~/components/stat/chart/options'

type TooltipParam = {
  color: string
  name: string
  seriesName: string
  value: number | null
}

const {
  bufferSize = 0,
  chartType = 'line',
  commitCount = 0,
  endValue,
  isPannable = false,
  panOffset = 0,
  period,
  series,
  startValue,
  xAxisLabels,
} = defineProps<{
  bufferSize?: number
  chartType?: ChartType
  commitCount?: number
  endValue?: number
  isPannable?: boolean
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

use([BarChart, DataZoomInsideComponent, GridComponent, LineChart, MarkAreaComponent, MarkLineComponent, SVGRenderer, TooltipComponent])

const { locale, t } = useI18n()
const isDev = import.meta.dev
const chartRef = ref()
let pointerStartX = 0
let pointerStartY = 0
let pointerId: number | undefined
let consumeNextClick = false
let wheelDistance = 0

// The chart is an SVG the screen reader can't read; label it as an image. The
// underlying numbers are exposed in the summary tiles and category list.
const chartAriaLabel = computed(() => {
  const names = series
    .map(s => s.name)
    .filter(Boolean)
    .join(', ')
  return names ? `${t('chart.label')}: ${names}` : t('chart.label')
})

const option = computed(() => {
  const startIndex = xAxisLabels.indexOf(startValue ?? -1)
  const endIndex = xAxisLabels.indexOf(endValue ?? -1)
  const isDataZoomEnabled = isPannable && startIndex >= 0 && endIndex >= startIndex
  const data = defu(baseOption, {
    dataZoom: [{
      disabled: !isDataZoomEnabled,
      endValue: isDataZoomEnabled ? endIndex : Math.max(0, xAxisLabels.length - 1),
      filterMode: 'filter' as const,
      id: 'stat-window',
      moveOnMouseMove: true,
      moveOnMouseWheel: false,
      preventDefaultMouseMove: false,
      startValue: isDataZoomEnabled ? startIndex : 0,
      throttle: 50,
      type: 'inside' as const,
      xAxisIndex: 0,
      zoomLock: true,
      zoomOnMouseWheel: false,
    }],
    series: buildChartSeries(series, chartType),
    xAxis: {
      data: xAxisLabels,
      type: 'category',
    },
  })

  const xAxis = data.xAxis as Record<string, any>
  xAxis.axisLabel.formatter = (date: string) => {
    const dateValue = +date
    // ECharts reindexes visible ticks after dataZoom, so resolve the neighbour
    // from the buffered category value instead of the formatter tick index.
    const dataIndex = xAxisLabels.indexOf(dateValue)
    return formatChartAxisLabel(dateValue, xAxisLabels[dataIndex - 1], period, locale.value)
  }

  xAxis.axisPointer.label.formatter = ({ value }: { value: string }) => {
    return formatByLocale(new Date(+value), getFormatForChart(period), locale.value)
  }

  const yAxis = data.yAxis as Record<string, any>
  yAxis.axisPointer.label.formatter = (props: { value: number }) => formatChartAmount(+props.value, locale.value) ?? ''

  const tooltip = data.tooltip as Record<string, any>
  tooltip.position = (
    point: [number, number],
    _params: unknown,
    _dom: HTMLElement,
    _rect: unknown,
    size: { contentSize: [number, number], viewSize: [number, number] },
  ) => resolveChartTooltipPosition(
    point,
    size.viewSize,
  )

  return data
})

const visibleBucketCount = computed(() => {
  const startIndex = xAxisLabels.indexOf(startValue ?? -1)
  const endIndex = xAxisLabels.indexOf(endValue ?? -1)
  return startIndex >= 0 && endIndex >= startIndex ? endIndex - startIndex + 1 : xAxisLabels.length
})

function valueFromPercent(percent: number | undefined, fallback: number | undefined) {
  if (fallback !== undefined && xAxisLabels.includes(fallback))
    return fallback
  if (fallback !== undefined && Number.isInteger(fallback) && fallback >= 0 && fallback < xAxisLabels.length)
    return xAxisLabels[fallback]
  if (percent === undefined || !xAxisLabels.length)
    return undefined
  return xAxisLabels[Math.round((Math.max(0, Math.min(100, percent)) / 100) * (xAxisLabels.length - 1))]
}

type DataZoomEvent = {
  batch?: Array<{ end?: number, endValue?: number, start?: number, startValue?: number }>
  end?: number
  endValue?: number
  start?: number
  startValue?: number
}

function onDataZoom(event: unknown) {
  const dataZoomEvent = event as DataZoomEvent
  const payload = dataZoomEvent.batch?.[0] ?? dataZoomEvent
  const nextStartValue = valueFromPercent(payload.start, payload.startValue)
  const nextEndValue = valueFromPercent(payload.end, payload.endValue)
  if (nextStartValue !== undefined && nextEndValue !== undefined)
    emit('preview', nextStartValue, nextEndValue)
}

function moveViewport(delta: number) {
  if (!isPannable || startValue === undefined || endValue === undefined)
    return false
  const startIndex = xAxisLabels.indexOf(startValue)
  const endIndex = xAxisLabels.indexOf(endValue)
  const nextStartIndex = startIndex + delta
  const nextEndIndex = endIndex + delta
  if (startIndex < 0 || endIndex < 0 || nextStartIndex < 0 || nextEndIndex >= xAxisLabels.length)
    return false
  const nextStart = xAxisLabels[nextStartIndex]!
  const nextEnd = xAxisLabels[nextEndIndex]!
  chartRef.value?.dispatchAction({
    dataZoomId: 'stat-window',
    endValue: nextEndIndex,
    startValue: nextStartIndex,
    type: 'dataZoom',
  })
  emit('preview', nextStart, nextEnd)
  return true
}

function onKeyDown(event: KeyboardEvent) {
  const delta = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
  if (!delta || !moveViewport(delta))
    return
  event.preventDefault()
  emit('previewEnd')
}

function onWheel(event: WheelEvent) {
  const delta = event.shiftKey ? event.deltaY : Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0
  event.stopPropagation()
  if (!delta)
    return
  event.preventDefault()
  wheelDistance += delta
  if (Math.abs(wheelDistance) < 48)
    return
  const moved = moveViewport(wheelDistance > 0 ? 1 : -1)
  wheelDistance = 0
  if (moved)
    emit('previewEnd')
}

function onPointerDown(event: PointerEvent) {
  pointerId = event.pointerId
  pointerStartX = event.clientX
  pointerStartY = event.clientY
  consumeNextClick = false
}

function onPointerMove(event: PointerEvent) {
  if (pointerId !== event.pointerId)
    return
  if (Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY) > 6)
    consumeNextClick = true
}

function onPointerEnd(event: PointerEvent) {
  if (pointerId !== event.pointerId)
    return
  pointerId = undefined
}

function onClickChart(params: { offsetX: number, offsetY: number }) {
  if (consumeNextClick) {
    consumeNextClick = false
    return
  }
  const [axisValue] = chartRef.value.convertFromPixel('grid', [params.offsetX, params.offsetY])
  const intervalKey = xAxisLabels.includes(axisValue) ? axisValue : xAxisLabels[Math.round(axisValue)]
  if (intervalKey !== undefined)
    emit('click', intervalKey)
}
</script>

<template>
  <div
    class="h-40 touch-pan-y @3xl/stat:h-52"
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
      :updateOptions="{ replaceMerge: ['series', 'xAxis'] }"
      autoresize
      @datazoom="onDataZoom"
    >
      <template #tooltip="params">
        <div
          class="rounded-md bg-elevated px-2 pt-2"
          :data-stat-chart-tooltip="isDev ? 'true' : undefined"
        >
          <div class="pb-2 text-xs text-muted">
            {{ formatByLocale(new Date(+(params as TooltipParam[])[0]!.name), getFormatForChart(period), locale) }}
          </div>

          <div class="grid gap-0">
            <div
              v-for="(param, i) in filterChartTooltipParams(params as TooltipParam[])"
              :key="i"
              class="flex items-center justify-between gap-4 border-b border-default pb-1 last:border-b-0"
              :data-stat-chart-tooltip-value="isDev ? param.value : undefined"
            >
              <div class="flex items-center gap-2">
                <div class="size-2.5 rounded-full" :style="`background: ${param.color}`" />
                <div class="text-sm text-muted">
                  {{ param.seriesName }}
                </div>
              </div>

              <div class="text-right font-secondary text-lg text-highlighted">
                {{ formatChartAmount(param.value, locale) }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </VChart>
  </div>
</template>
