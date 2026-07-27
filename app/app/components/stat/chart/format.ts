import type { Period } from '~~/utils/date/types'

export function getFormatForChart(periodName: Period) {
  switch (periodName) {
    case 'day':
    case 'week':
      return 'd MMM'
    case 'month':
      return 'MMM'
    case 'year':
      return 'yyyy'
  }
}
