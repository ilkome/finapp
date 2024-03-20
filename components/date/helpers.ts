import dayjs from 'dayjs'
import type { PeriodName } from '~/components/stat/chart/useChartStore'

/**
 * Get max periods to show
 */
export function getMaxPeriodsToShow(periodName: PeriodName, fromDate: number): number {
  return dayjs().endOf(periodName).diff(fromDate, periodName) + 1
}
