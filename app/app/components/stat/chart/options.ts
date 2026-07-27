import defu from 'defu'

import type { ChartType } from '~/components/stat/chart/types'
import type { ChartSeries } from '~/components/stat/types'

import { defaultSeriesConfig } from '~/components/stat/chart/config'

export function buildChartSeries(series: ChartSeries[], chartType?: ChartType) {
  return series
    .map((item: ChartSeries) => {
      const isBar = (chartType || item.type) === 'bar'
      return {
        ...defu(defaultSeriesConfig, item),
        // Zero = no trns that period; render no bar (null), not a floored stub.
        // Lines keep 0 as a real point so they stay connected.
        data: isBar ? item.data.map(v => (v === 0 ? null : v)) : item.data,
        label: defaultSeriesConfig.label,
        stack: isBar ? 'b' : false,
        type: item.markedArea ? 'bar' : (chartType || item.type),
      }
    })
}
