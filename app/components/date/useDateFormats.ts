import { differenceInDays } from 'date-fns'

import type { PeriodNameWithAll } from '~/components/filter/types'

import { formatByLocale, getEndOf, getStartOf } from '~/components/date/utils'
import { useGetDateRange } from '~/components/stat/date/useGetDateRange'

export function useDateFormats() {
  const { locale, t } = useI18n()
  const { calculateDate } = useGetDateRange(t, locale.value)

  function getDates(periodName: PeriodNameWithAll, date: number) {
    if (periodName === 'all')
      return

    const filterDate = new Date(date)
    const from = getStartOf(filterDate, periodName).getTime()
    const until = getEndOf(filterDate, periodName).getTime()

    return { from, until }
  }

  function formatDate(value: number, type: 'trnItem' | 'full') {
    if (!value)
      return false

    const date = new Date(value)
    const diff = differenceInDays(new Date(), date)

    switch (type) {
      case 'full':
        return {
          day: formatByLocale(date, 'd', locale.value),
          full: formatByLocale(date, 'dd.MM.yyyy HH:mm', locale.value),
          month: formatByLocale(date, 'MMM', locale.value),
          week: formatByLocale(date, 'dd.MM', locale.value),
          weekday: `${diff < 2 ? `${calculateDate({ by: 'day', duration: 1, end: date, start: date, type: 'start' })}, ` : ''} ${formatByLocale(date, 'EEEE', locale.value)}`,
        }

      case 'trnItem':
        return calculateDate({ by: 'day', duration: 1, end: date, start: date, type: 'start' })

      default:
        return calculateDate({ by: 'day', duration: 1, end: date, start: date, type: 'start' })
    }
  }

  return {
    formatDate,
    getDates,
  }
}
