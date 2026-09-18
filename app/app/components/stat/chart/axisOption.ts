import type { Period } from '~~/utils/date/types'

import defu from 'defu'

import type { LocaleSlug } from '~/components/locale/types'
import type { AxisChartType } from '~/components/stat/chart/types'
import type { MiniItemConfig } from '~/components/stat/config/schema'
import type { ChartSeries } from '~/components/stat/types'

import { formatChartAmount, formatChartAxisLabel, formatChartTooltipLabel } from '~/components/stat/chart/format'
import { baseOption, buildChartGuideMarkLine, buildChartSeries, resolveCenteredBarGeometry, resolveChartScale, resolveChartScaleWidth, resolveChartSeriesAverages, resolveChartTooltipPosition } from '~/components/stat/chart/options'

export function buildAxisChartOption({
  chartConfig,
  chartType = 'line',
  endValue,
  isPannable = false,
  isShowMaxRange = false,
  locale,
  period,
  series,
  startValue,
  viewportWidth,
  xAxisLabels,
}: {
  chartConfig: MiniItemConfig['chart']
  chartType?: AxisChartType
  endValue?: number
  isPannable?: boolean
  isShowMaxRange?: boolean
  locale: LocaleSlug
  period: Period
  series: ChartSeries[]
  startValue?: number
  viewportWidth: number
  xAxisLabels: number[]
}) {
  const isBarGrouped = chartConfig.isGrouped
  const isShowAverage = chartConfig.isShowAverage
  const isShowScale = chartConfig.isShowScale

  const startIndex = xAxisLabels.indexOf(startValue ?? -1)
  const endIndex = xAxisLabels.indexOf(endValue ?? -1)
  const isDataZoomEnabled = isPannable && startIndex >= 0 && endIndex >= startIndex
  const visibleStartIndex = isDataZoomEnabled ? startIndex : 0
  const visibleEndIndex = isDataZoomEnabled ? endIndex + 1 : undefined
  const visibleSeries = series.map(item => ({
    ...item,
    data: item.data.slice(visibleStartIndex, visibleEndIndex),
  }))
  const lineOptions = chartConfig.line
  const activeIntervalKey = series.find(item => item.markedArea === 'markedArea')?.markArea?.data[0]?.[0].xAxis
  const activeIntervalIndex = activeIntervalKey === undefined
    ? -1
    : xAxisLabels.findIndex(label => `${label}` === activeIntervalKey)
  const scale = resolveChartScale(visibleSeries, chartType, lineOptions, isBarGrouped)
  const averages = isShowAverage ? resolveChartSeriesAverages(visibleSeries) : []
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
  if (isShowScale && visibleAverages.length === 1) {
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
    isShowScale
      ? [...seriesWithVisibleAverage.filter(item => item.markedArea !== 'markedArea'), guideSeries]
      : seriesWithVisibleAverage.filter(item => item.markedArea !== 'markedArea'),
    chartType,
    lineOptions,
    isBarGrouped,
  )
  const renderedSeries = chartType === 'bar'
    && !isBarGrouped
    && chartConfig.breakdown === 'categories'
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
    const previousDate = dataIndex === visibleStartIndex ? undefined : xAxisLabels[dataIndex - 1]
    return formatChartAxisLabel(dateValue, previousDate, period, locale, isShowMaxRange)
  }
  xAxis.axisLabel.alignMaxLabel = 'right'
  xAxis.axisLabel.showMaxLabel = true

  xAxis.axisPointer.label.formatter = ({ value }: { value: string }) => {
    return formatChartTooltipLabel(+value, period, locale)
  }

  const yAxis = data.yAxis as Record<string, any>
  const grid = data.grid as Record<string, any>
  grid.bottom = isShowScale ? 22 : 0
  grid.outerBoundsMode = isShowScale ? 'none' : 'same'
  grid.right = isShowScale ? resolveChartScaleWidth(scale, visibleAverages) : 5
  yAxis.axisLabel.align = 'left'
  yAxis.axisLabel.inside = false
  yAxis.axisLabel.margin = 6
  yAxis.axisLabel.show = false
  yAxis.interval = isShowScale ? scale.interval : undefined
  yAxis.max = isShowScale ? scale.max : undefined
  yAxis.min = isShowScale ? scale.min : undefined
  yAxis.splitNumber = 2
  yAxis.splitLine.show = false
  yAxis.axisPointer.label.formatter = (props: { value: number }) => formatChartAmount(+props.value, locale) ?? ''

  const tooltip = data.tooltip as Record<string, any>
  tooltip.show = viewportWidth >= 500
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
}
