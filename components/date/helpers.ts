import dayjs from 'dayjs'
import type { PeriodNameWithoutAll } from '~/components/stat/chart/useChartStore'

/**
 * Get max periods to show
 */
export function getMaxPeriodsToShow(periodName: PeriodNameWithoutAll, fromDate: number): number {
  return dayjs().endOf(periodName).diff(fromDate, periodName) + 1
}
