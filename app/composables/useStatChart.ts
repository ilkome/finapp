import type { DateUTC } from '~/components/date/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { ChartSeries } from '~/components/stat/types'
import { seriesOptions } from '~/components/stat/chart/config'
import { markArea } from '~/components/stat/chart/utils'
import type { ChartType } from '~/components/stat/chart/types'

export function useStatChart() {
  const { t } = useI18n()

  function createSeriesItem(typeItem: 'expense' | 'income' | 'sum', data: TotalReturns[]): ChartSeries {
    return {
      color: seriesOptions[typeItem].color,
      data: data.map(i => typeItem !== 'sum' ? Math.abs(i[typeItem]) : i[typeItem]),
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
    createSeriesItem,
  }
}
