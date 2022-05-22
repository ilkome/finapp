import dayjs from 'dayjs'
import type { DateValueOf, PeriodsNamesExceptAll } from '~/components/date/types'

/**
 * Get max periods to show
 */
export function getMaxPeriodsToShow(periodName: PeriodsNamesExceptAll, fromDate: DateValueOf): number {
  return dayjs().endOf(periodName).diff(fromDate, periodName) + 1
}
