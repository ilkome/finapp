import type { CurrencyCode } from '~/components/currencies/types'
import type { ChartSeries } from '~/components/stat/types'

import { minorToAmount } from '~/components/amount/utils'

/** Charts read decimals; analytics keeps minor units until here. */
export function toChartSeries(series: ChartSeries[], currencyCode: CurrencyCode): ChartSeries[] {
  return series.map(item => ({ ...item, data: item.data.map(value => minorToAmount(value, currencyCode)) }))
}
