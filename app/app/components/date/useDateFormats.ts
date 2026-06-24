import { differenceInDays } from 'date-fns'

import type { PeriodNameWithAll } from '~/components/stat/filter/types'

import { civilDayStart, formatByLocale, getEndOf, getStartOf, todayCivilDayEpoch } from '~/components/date/utils'
import { useGetDateRange } from '~/components/stat/date/useGetDateRange'

type FullDateParts = {
  day: string
  full: string
  month: string
  week: string
  weekday: string
  year: string
}

export function useDateFormats() {
  const { locale, t } = useI18n()
  const { formatDateToStringWithLast } = useGetDateRange(t, locale.value)

  function getDates(periodName: PeriodNameWithAll, date: number) {
    if (periodName === 'all')
      return

    const filterDate = new Date(date)
    const start = getStartOf(filterDate, periodName).getTime()
    const end = getEndOf(filterDate, periodName).getTime()

    return { end, start }
  }

  function formatDate(value: number, type: 'trnItem'): string | undefined
  function formatDate(value: number, type: 'full'): FullDateParts | undefined
  function formatDate(value: number, type: 'trnItem' | 'full'): string | FullDateParts | undefined {
    if (!value)
      return undefined

    const date = new Date(value)
    // Compare civil days (UTC-midnight) so "today"/"yesterday" labels are timezone-stable.
    const diff = differenceInDays(todayCivilDayEpoch(), civilDayStart(value))

    switch (type) {
      case 'full':
        return {
          day: formatByLocale(date, 'd', locale.value),
          full: formatByLocale(date, 'dd.MM.yyyy HH:mm', locale.value),
          month: formatByLocale(date, 'MMM', locale.value),
          week: formatByLocale(date, 'dd.MM', locale.value),
          weekday: `${diff < 2 ? `${formatDateToStringWithLast({ by: 'day', duration: 1, end: date, start: date })}, ` : ''} ${formatByLocale(date, 'EEEE', locale.value)}`,
          year: formatByLocale(date, 'yyyy', locale.value),
        }

      case 'trnItem':
        return formatDateToStringWithLast({ by: 'day', duration: 1, end: date, start: date })
    }
  }

  return {
    formatDate,
    getDates,
  }
}
