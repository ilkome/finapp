import type { DateUTC } from '~~/utils/date/types'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { ChartType } from '~/components/stat/chart/types'
import type { ChartSeries, SeriesSlug } from '~/components/stat/types'

import { formatCompactChartAmount } from '~/components/stat/chart/format'
import { seriesOptions } from '~/components/stat/chart/options'

export function useStatChart() {
  const { t } = useI18n()

  function createAverageMarkLine(average: number, color?: string) {
    return {
      data: [{
        name: 'average',
        yAxis: Math.abs(average),
      }],
      index: 0,
      label: {
        align: 'left',
        color,
        distance: 6,
        fontFamily: 'var(--font-secondary)',
        formatter: ({ value }: { value: number }) => formatCompactChartAmount(value),
        position: 'end',
        show: true,
        textBorderColor: 'transparent',
        textBorderWidth: 0,
        textShadowBlur: 0,
      },
      lineStyle: {
        color,
        type: 'solid',
      },
      silent: false,
      symbol: false,
      z: 0,
    }
  }

  const chartTypeOptions = computed<{ icon: string, label: string, value: ChartType }[]>(() => [{
    icon: 'lucide:chart-column',
    label: t('stat.view.chartType.bar.label'),
    value: 'bar',
  }, {
    icon: 'lucide:chart-line',
    label: t('stat.view.chartType.line.label'),
    value: 'line',
  }, {
    icon: 'lucide:chart-pie',
    label: t('stat.view.chartType.pie.label'),
    value: 'pie',
  }])

  function createSeriesItem(typeItem: SeriesSlug, data: TotalReturns[], average?: number | false): ChartSeries {
    let markLine = {}
    if (average)
      markLine = createAverageMarkLine(average, seriesOptions[typeItem]?.color as string | undefined)

    return {
      averageMode: average ? 'series' : undefined,
      color: seriesOptions[typeItem]?.color as string | undefined,
      data: data.map(i => Math.abs(i[typeItem])),
      markLine,
      markLineValueType: typeItem,
      name: t(`money.${typeItem}`),
      type: seriesOptions[typeItem]?.type ?? 'bar',
      valueTypes: data.map(() => typeItem),
    }
  }

  function withMarkArea(series: ChartSeries[], markedDate: DateUTC, _chartType?: ChartType) {
    if (!markedDate)
      return series

    const markAreaData: {
      data: [{ xAxis: string }, { xAxis: string }][]
      itemStyle: { color: string, opacity: number }
    } = {
      data: [[{ xAxis: `${markedDate}` }, { xAxis: `${markedDate}` }]],
      itemStyle: { color: 'var(--chart-line)', opacity: 1 },
    }

    const markAreaIdx = series.findIndex(s => s.markedArea === 'markedArea')
    const markAreaSeries: ChartSeries = {
      data: [],
      markArea: markAreaData,
      markedArea: 'markedArea',
      name: '',
      type: 'bar',
    }

    return markAreaIdx === -1
      ? [...series, markAreaSeries]
      : series.map((s, i) => i === markAreaIdx ? markAreaSeries : s)
  }

  return {
    chartTypeOptions,
    createAverageMarkLine,
    createSeriesItem,
    withMarkArea,
  }
}
