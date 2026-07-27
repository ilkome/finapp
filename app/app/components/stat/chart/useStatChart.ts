import type { DateUTC } from '~~/utils/date/types'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { ChartType } from '~/components/stat/chart/types'
import type { ChartSeries, SeriesSlug } from '~/components/stat/types'

import { seriesOptions } from '~/components/stat/chart/options'

export function useStatChart() {
  const { t } = useI18n()

  const chartTypeOptions = computed<{ categoriesOnly?: boolean, icon: string, label: string, value: ChartType }[]>(() => [{
    icon: 'lucide:chart-column',
    label: t('chart.types.bar'),
    value: 'bar',
  }, {
    icon: 'lucide:chart-line',
    label: t('chart.types.line'),
    value: 'line',
  }, {
    categoriesOnly: true,
    icon: 'lucide:chart-pie',
    label: t('chart.types.pie'),
    value: 'pie',
  }])

  function createSeriesItem(typeItem: SeriesSlug, data: TotalReturns[], average?: number | false): ChartSeries {
    let markLine = {}
    if (average) {
      markLine = {
        data: [{
          name: 'average',
          yAxis: Math.abs(average),
        }],
        index: 0,
        label: {
          show: false,
        },
        lineStyle: {
          color: seriesOptions[typeItem]?.markLineColor ?? seriesOptions[typeItem]?.color,
          type: 'solid',
        },
        silent: false,
        symbol: false,
      }
    }

    return {
      color: seriesOptions[typeItem]?.color as string | undefined,
      data: data.map(i => Math.abs(i[typeItem])),
      markLine,
      name: t(`money.${typeItem}`),
      type: seriesOptions[typeItem]?.type ?? 'bar',
    }
  }

  function withMarkArea(series: ChartSeries[], markedDate: DateUTC, chartType?: ChartType) {
    if (!markedDate)
      return series

    const markAreaData: {
      data: [{ xAxis: string }, { xAxis: string }][]
      itemStyle: { color: string, opacity: number }
    } = {
      data: [[{ xAxis: `${markedDate}` }, { xAxis: `${markedDate}` }]],
      itemStyle: { color: 'var(--chart-line)', opacity: 1 },
    }

    if (chartType === 'bar') {
      if (series[0])
        series[0].markArea = markAreaData
      return series
    }

    const markAreaIdx = series.findIndex(s => s.markedArea === 'markedArea')
    const markAreaSeries: ChartSeries = {
      data: [],
      markArea: markAreaData,
      markedArea: 'markedArea',
      name: 'markArea',
      type: 'bar',
    }

    return markAreaIdx === -1
      ? [...series, markAreaSeries]
      : series.map((s, i) => i === markAreaIdx ? markAreaSeries : s)
  }

  return {
    chartTypeOptions,
    createSeriesItem,
    withMarkArea,
  }
}
