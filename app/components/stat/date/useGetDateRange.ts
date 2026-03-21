import { isSameDay, isSameMonth, isSameWeek, isSameYear, sub } from 'date-fns'

import type { Period, Range, StatDateParams } from '~/components/date/types'
import type { LocaleSlug } from '~/components/locale/types'

import { formatByLocale, toDuration } from '~/components/date/utils'

type DateFormatParams = {
  by: StatDateParams['rangeBy']
  duration: StatDateParams['rangeDuration']
  end: Date
  start: Date
}

function isSamePeriod(a: Date, b: Date, by: Period): boolean {
  switch (by) {
    case 'year': return isSameYear(a, b)
    case 'month': return isSameMonth(a, b)
    case 'week': return isSameWeek(a, b, { weekStartsOn: 1 })
    case 'day': return isSameDay(a, b)
  }
}

export function useGetDateRange(t: (key: string, choice?: number) => string, locale?: LocaleSlug) {
  const today = new Date()

  function formatYearRange({ duration, end, start }: DateFormatParams): string {
    return duration === 1
      ? formatByLocale(start, 'yyyy', locale)
      : `${formatByLocale(start, 'yyyy', locale)} - ${formatByLocale(end, 'yyyy', locale)}`
  }

  function formatMonthRange({ duration, end, start }: DateFormatParams): string {
    if (isSameYear(start, today)) {
      if (isSameMonth(start, today) || duration === 1)
        return formatByLocale(start, 'MMMM', locale)
      return `${formatByLocale(start, 'MMM', locale)} - ${formatByLocale(end, 'MMM', locale)}`
    }

    if (isSameYear(start, end)) {
      if (isSameMonth(start, end))
        return formatByLocale(start, 'MMM yyyy', locale)
      return `${formatByLocale(start, 'MMM', locale)} - ${formatByLocale(end, 'MMM yyyy', locale)}`
    }

    return `${formatByLocale(start, 'MMM yyyy', locale)} - ${formatByLocale(end, 'MMM yyyy', locale)}`
  }

  function formatWeekRange({ end, start }: DateFormatParams): string {
    if (isSameYear(start, today)) {
      if (isSameMonth(start, today) || isSameMonth(start, end))
        return `${formatByLocale(start, 'd', locale)}-${formatByLocale(end, 'd MMM', locale)}`
      return `${formatByLocale(start, 'd MMM', locale)} - ${formatByLocale(end, 'd MMM', locale)}`
    }

    if (isSameYear(start, end)) {
      if (isSameMonth(start, end))
        return `${formatByLocale(start, 'd', locale)}-${formatByLocale(end, 'd MMM yyyy', locale)}`
      return `${formatByLocale(start, 'd MMM', locale)} - ${formatByLocale(end, 'd MMM yyyy', locale)}`
    }

    return `${formatByLocale(start, 'd MMM yyyy', locale)} - ${formatByLocale(end, 'd MMM yyyy', locale)}`
  }

  function formatDayRange({ duration, end, start }: DateFormatParams): string {
    if (isSameYear(start, today)) {
      if (isSameMonth(start, end))
        return `${formatByLocale(start, 'd', locale)}-${formatByLocale(end, 'd MMM', locale)}`
      return `${formatByLocale(start, 'd MMM', locale)} - ${formatByLocale(end, 'd MMM', locale)}`
    }

    if (isSameYear(start, end)) {
      if (duration === 1)
        return formatByLocale(start, 'd MMM yyyy', locale)
      if (isSameMonth(start, end))
        return `${formatByLocale(start, 'd', locale)}-${formatByLocale(end, 'd MMM yyyy', locale)}`
      return `${formatByLocale(start, 'd MMM', locale)} - ${formatByLocale(end, 'd MMM yyyy', locale)}`
    }

    return `${formatByLocale(start, 'd MMM yyyy', locale)} - ${formatByLocale(end, 'd MMM yyyy', locale)}`
  }

  function formatByPeriod(params: DateFormatParams): string {
    switch (params.by) {
      case 'year': return formatYearRange(params)
      case 'month': return formatMonthRange(params)
      case 'week': return formatWeekRange(params)
      case 'day': return formatDayRange(params)
    }
  }

  function formatDateToStringWithLast(params: DateFormatParams, isShowMaxRange?: boolean): string {
    const { by, duration, end, start } = params

    if (duration === 1) {
      if (isSamePeriod(start, today, by))
        return t(`dates.${by}.current`)

      if (isSamePeriod(start, sub(today, toDuration(by, 1)), by))
        return t(`dates.${by}.last`)

      if (by === 'day' && isSameYear(start, today))
        return formatByLocale(start, 'd MMMM', locale)
    }

    if (!isShowMaxRange && isSamePeriod(end, today, by))
      return `${t(`dates.last.${by}`, duration)} ${duration} ${t(`dates.${by}.plural`, duration)}`

    return formatByPeriod(params)
  }

  function formatDateToString(params: DateFormatParams): string {
    const { by, duration, start } = params

    if (duration === 1 && by === 'day' && isSameYear(start, today))
      return formatByLocale(start, 'd MMMM', locale)

    return formatByPeriod(params)
  }

  function getStringDateRange(range: Range, by: StatDateParams['rangeBy'], duration: StatDateParams['rangeDuration']) {
    return formatDateToString({
      by,
      duration,
      end: new Date(range.end),
      start: new Date(range.start),
    })
  }

  return {
    formatDateToString,
    formatDateToStringWithLast,
    getStringDateRange,
  }
}
