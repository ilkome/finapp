<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import defu from 'defu'
import { BarChart, CustomChart, LineChart } from 'echarts/charts'
import { DataZoomInsideComponent, GridComponent, MarkAreaComponent, MarkLineComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import type { AxisChartType } from '~/components/stat/chart/types'
import type { ChartSeries } from '~/components/stat/types'

import { formatChartAmount, formatChartAxisLabel, formatChartTooltipLabel } from '~/components/stat/chart/format'
import { baseOption, buildChartGuideMarkLine, buildChartSeries, resolveCenteredBarGeometry, resolveChartScale, resolveChartScaleWidth, resolveChartSeriesAverages, resolveChartTooltipPosition } from '~/components/stat/chart/options'
import { statConfigKey } from '~/components/stat/injectionKeys'

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
  chartType?: AxisChartType
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

use([BarChart, CustomChart, DataZoomInsideComponent, GridComponent, LineChart, MarkAreaComponent, MarkLineComponent, SVGRenderer, TooltipComponent])

const { locale, t } = useI18n()
const { width: viewportWidth } = useWindowSize()
const statConfig = inject(statConfigKey)!
const isDev = import.meta.dev
const isShowAverage = computed(() => statConfig.config.value.chart.isShowAverage)
const isShowScale = computed(() => statConfig.config.value.chart.isShowScale)
const isBarGrouped = computed(() => statConfig.config.value.chart.isGrouped)
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
  const visibleStartIndex = isDataZoomEnabled ? startIndex : 0
  const visibleEndIndex = isDataZoomEnabled ? endIndex + 1 : undefined
  const visibleSeries = series.map(item => ({
    ...item,
    data: item.data.slice(visibleStartIndex, visibleEndIndex),
  }))
  const lineOptions = statConfig.config.value.chart.line
  const activeIntervalKey = series.find(item => item.markedArea === 'markedArea')?.markArea?.data[0]?.[0].xAxis
  const activeIntervalIndex = activeIntervalKey === undefined
    ? -1
    : xAxisLabels.findIndex(label => `${label}` === activeIntervalKey)
  const scale = resolveChartScale(visibleSeries, chartType, lineOptions, isBarGrouped.value)
  const averages = isShowAverage.value ? resolveChartSeriesAverages(visibleSeries) : []
  const visibleAverages = averages.filter((value): value is number => value !== undefined)
  const guideAverage = visibleAverages.length === 1 ? visibleAverages[0] : undefined
  let seriesWithVisibleAverage = visibleAverages.length === 0
    ? series
    : series.map((item, index) => item.averageMode && averages[index] !== undefined && Array.isArray(item.markLine?.data)
        ? {
            ...item,
            markLine: {
              ...item.markLine,
              data: item.markLine.data.map((line: { name?: string, yAxis?: number }) =>
                line.name === 'average' ? { ...line, yAxis: averages[index] } : line,
              ),
            },
          }
        : item)
  if (isShowScale.value && visibleAverages.length === 1) {
    seriesWithVisibleAverage = seriesWithVisibleAverage.map(item => item.averageMode
      ? { ...item, markLine: undefined }
      : item)
  }
  const guideSeries: ChartSeries = {
    axisOverlay: true,
    data: [],
    markLine: buildChartGuideMarkLine(scale, guideAverage),
    name: 'scale-guides',
    type: 'line',
  }
  const chartSeries = buildChartSeries(
    isShowScale.value
      ? [...seriesWithVisibleAverage.filter(item => item.markedArea !== 'markedArea'), guideSeries]
      : seriesWithVisibleAverage.filter(item => item.markedArea !== 'markedArea'),
    chartType,
    lineOptions,
    isBarGrouped.value,
  )
  const renderedSeries = chartType === 'bar'
    && !isBarGrouped.value
    && statConfig.config.value.chart.breakdown === 'categories'
    ? (() => {
        const hasBarValue = (value: unknown) => Number.isFinite(Number(value)) && Number(value) !== 0
        const adjacentBarSeries = chartSeries
          .map((candidate, candidateIndex) => ({ candidate, candidateIndex }))
          .filter(({ candidate }) => !candidate.axisOverlay && candidate.type === 'bar')
        const widthCount = Math.max(1, ...xAxisLabels.map((_, dataIndex) => adjacentBarSeries
          .filter(({ candidate }) => hasBarValue(candidate.data[dataIndex]))
          .length))

        return chartSeries.map((item, seriesIndex) => {
          if (item.axisOverlay || item.type !== 'bar')
            return item

          return {
            ...item,
            coordinateSystem: 'cartesian2d',
            data: item.data.map((value, dataIndex) => [dataIndex, value]),
            encode: { tooltip: 1, x: 0, y: 1 },
            renderItem: (params: { dataIndex: number }, api: {
              coord: (value: unknown[]) => number[]
              value: (dimension: number) => unknown
            }) => {
              const value = Number(api.value(1))
              if (!Number.isFinite(value) || value === 0)
                return null

              const activeSeriesIndexes = adjacentBarSeries
                .filter(({ candidate }) => hasBarValue(candidate.data[params.dataIndex]))
                .map(({ candidateIndex }) => candidateIndex)
              const activeIndex = activeSeriesIndexes.indexOf(seriesIndex)
              if (activeIndex < 0)
                return null

              const xValue = api.value(0)
              const [, zeroY = 0] = api.coord([xValue, 0])
              const [centerX = 0, valueY = 0] = api.coord([xValue, value])
              const neighbourValue = params.dataIndex + 1 < xAxisLabels.length
                ? params.dataIndex + 1
                : params.dataIndex > 0 ? params.dataIndex - 1 : undefined
              const [neighbourX = Number.NaN] = neighbourValue === undefined ? [] : api.coord([neighbourValue, 0])
              const bucketWidth = Number.isFinite(neighbourX) ? Math.abs(neighbourX - centerX) : 12
              const geometry = resolveCenteredBarGeometry(bucketWidth, activeSeriesIndexes.length, activeIndex, { widthCount })
              const measuredHeight = Math.abs(zeroY - valueY)
              const height = Math.max(2, measuredHeight)
              const y = value >= 0 ? zeroY - height : zeroY

              return {
                emphasis: {
                  style: {
                    fill: item.color,
                    opacity: 1,
                  },
                },
                shape: {
                  height,
                  r: 2,
                  width: geometry.width,
                  x: centerX + geometry.offset - geometry.width / 2,
                  y,
                },
                style: { fill: item.color },
                type: 'rect',
              }
            },
            type: 'custom',
          }
        })
      })()
    : chartSeries
  const activeIntervalSeries = activeIntervalIndex < 0
    ? []
    : [{
        axisOverlay: true,
        coordinateSystem: 'cartesian2d',
        data: [[activeIntervalIndex, 0]],
        name: 'active-period',
        renderItem: (params: { coordSys: { height: number, y: number } }, api: {
          coord: (value: unknown[]) => number[]
          value: (dimension: number) => unknown
        }) => {
          const dataIndex = Number(api.value(0))
          const [centerX = 0] = api.coord([dataIndex, 0])
          const neighbourIndex = dataIndex + 1 < xAxisLabels.length
            ? dataIndex + 1
            : dataIndex > 0 ? dataIndex - 1 : undefined
          const [neighbourX = Number.NaN] = neighbourIndex === undefined ? [] : api.coord([neighbourIndex, 0])
          const width = Number.isFinite(neighbourX) ? Math.abs(neighbourX - centerX) : 12

          return {
            shape: {
              height: params.coordSys.height,
              width,
              x: centerX - width / 2,
              y: params.coordSys.y,
            },
            style: { fill: 'var(--ui-bg-elevated)' },
            type: 'rect',
          }
        },
        silent: true,
        tooltip: { show: false },
        type: 'custom',
        z: 0,
      }]
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
    series: [...activeIntervalSeries, ...renderedSeries],
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
  xAxis.axisLabel.alignMaxLabel = 'right'
  xAxis.axisLabel.showMaxLabel = true

  xAxis.axisPointer.label.formatter = ({ value }: { value: string }) => {
    return formatChartTooltipLabel(+value, period, locale.value)
  }

  const yAxis = data.yAxis as Record<string, any>
  const grid = data.grid as Record<string, any>
  grid.bottom = isShowScale.value ? 22 : 0
  grid.outerBoundsMode = isShowScale.value ? 'none' : 'same'
  grid.right = isShowScale.value ? resolveChartScaleWidth(scale, visibleAverages) : 5
  yAxis.axisLabel.align = 'left'
  yAxis.axisLabel.inside = false
  yAxis.axisLabel.margin = 6
  yAxis.axisLabel.show = false
  yAxis.interval = isShowScale.value ? scale.interval : undefined
  yAxis.max = isShowScale.value ? scale.max : undefined
  yAxis.min = isShowScale.value ? scale.min : undefined
  yAxis.splitNumber = 2
  yAxis.splitLine.show = false
  yAxis.axisPointer.label.formatter = (props: { value: number }) => formatChartAmount(+props.value, locale.value) ?? ''

  const tooltip = data.tooltip as Record<string, any>
  tooltip.show = viewportWidth.value >= 500
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
