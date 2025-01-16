import type { TotalReturns } from '~/components/amount/getTotal'
import type { DateUTC } from '~/components/date/types'
import type { ChartType } from '~/components/stat/chart/types'
import type { ChartSeries, StatTabSlug } from '~/components/stat/types'

import { seriesOptions } from '~/components/stat/chart/config'
import { markArea } from '~/components/stat/chart/utils'

export function useStatChart() {
  const { t } = useI18n()

  const chartTypes = computed<{ icon: string, label: string, value: ChartType }[]>(() => [{
    icon: 'lucide:chart-line',
    label: t('chart.types.bar'),
    value: 'bar',
  }, {
    icon: 'lucide:chart-column',
    label: t('chart.types.line'),
    value: 'line',
  }])

  function createSeriesItem(typeItem: StatTabSlug, data: TotalReturns[], average?: number | false): ChartSeries {
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
          color: seriesOptions[typeItem].colorLine ?? seriesOptions[typeItem].color,
          type: 'solid',
        },
        silent: false,
        symbol: false,
      }
    }

    return {
      color: seriesOptions[typeItem].color,
      data: data.map(i => typeItem !== 'summary' ? Math.abs(i[typeItem]) : i[typeItem]),
      markLine,
      name: t(`money.${typeItem}`),
      type: seriesOptions[typeItem].type,
    }
  }

  function addMarkArea(series: ChartSeries[], selectedDate: DateUTC, chartType?: ChartType) {
    if (!selectedDate)
      return series

    if (chartType === 'bar') {
      if (series[0])
        series[0].markArea = markArea(selectedDate)
      return series
    }

    const markAreaIdx = series.findIndex(s => s.markedArea === 'markedArea')
    const markAreaSeries: ChartSeries = {
      data: [],
      markArea: markArea(selectedDate),
      markedArea: 'markedArea',
      name: 'markArea',
      type: 'bar',
    }

    return markAreaIdx === -1
      ? [...series, markAreaSeries]
      : series.map((s, i) => i === markAreaIdx ? markAreaSeries : s)
  }

  return {
    addMarkArea,
    chartTypes,
    createSeriesItem,
  }
}
