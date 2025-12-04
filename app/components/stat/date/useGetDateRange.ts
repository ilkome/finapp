import { isSameDay, isSameMonth, isSameWeek, isSameYear, sub } from 'date-fns'

import type { Range, StatDateParams } from '~/components/date/types'
import type { LocaleSlug } from '~/components/locale/types'

import { formatByLocale } from '~/components/date/utils'

type DateFormatParams = {
  by: StatDateParams['rangeBy']
  duration: StatDateParams['rangeDuration']
  end: Date
  start: Date
  type: 'start' | 'end'
}

export function useGetDateRange(t: (key: string, choice?: number) => string, locale?: LocaleSlug) {
  const today = new Date()

  // Helper functions for period handling
  function handleCurrentPeriod(by: StatDateParams['rangeBy'], type: 'start' | 'end') {
    return type === 'start' ? t(`dates.${by}.current`) : ''
  }

  function handleLastPeriod(by: StatDateParams['rangeBy'], type: 'start' | 'end') {
    return type === 'start' ? t(`dates.${by}.last`) : ''
  }

  function handleLastNPeriods(by: StatDateParams['rangeBy'], duration: number, type: 'start' | 'end') {
    return type === 'start' ? '' : `${t(`dates.last.${by}`, duration)} ${duration} ${t(`dates.${by}.plural`, duration)}`
  }

  function formatYearRange({ duration, end, start, type }: DateFormatParams): string {
    if (type === 'start')
      return duration === 1 ? formatByLocale(start, 'yyyy', locale) : `${formatByLocale(start, 'yyyy', locale)} - ${formatByLocale(end, 'yyyy', locale)}`
    return ''
  }

  function formatMonthRange({ duration, end, start, type }: DateFormatParams): string {
    if (isSameYear(start, today)) {
      if (isSameMonth(start, today) || duration === 1)
        return type === 'start' ? formatByLocale(start, 'MMMM', locale) : ''
      return type === 'start' ? formatByLocale(start, 'MMM', locale) : ` - ${formatByLocale(end, 'MMM', locale)}`
    }

    if (isSameYear(start, end)) {
      if (isSameMonth(start, end))
        return type === 'start' ? formatByLocale(start, 'MMM yyyy', locale) : ''
      return type === 'start' ? formatByLocale(start, 'MMM', locale) : ` - ${formatByLocale(end, 'MMM yyyy', locale)}`
    }

    return type === 'start' ? formatByLocale(start, 'MMM yyyy', locale) : ` - ${formatByLocale(end, 'MMM yyyy', locale)}`
  }

  function formatWeekRange({ end, start, type }: DateFormatParams): string {
    if (isSameYear(start, today)) {
      if (isSameMonth(start, today) || isSameMonth(start, end))
        return type === 'start' ? formatByLocale(start, 'd', locale) : `-${formatByLocale(end, 'd MMM', locale)}`
      return type === 'start' ? formatByLocale(start, 'd MMM', locale) : ` - ${formatByLocale(end, 'd MMM', locale)}`
    }

    if (isSameYear(start, end)) {
      if (isSameMonth(start, end))
        return type === 'start' ? formatByLocale(start, 'd', locale) : `-${formatByLocale(end, 'd MMM yyyy', locale)}`
      return type === 'start' ? formatByLocale(start, 'd MMM', locale) : ` - ${formatByLocale(end, 'd MMM yyyy', locale)}`
    }

    return type === 'start' ? formatByLocale(start, 'd MMM yyyy', locale) : ` - ${formatByLocale(end, 'd MMM yyyy', locale)}`
  }

  function formatDayRange({ duration, end, start, type }: DateFormatParams): string {
    if (isSameYear(start, today)) {
      if (isSameMonth(start, end))
        return type === 'start' ? formatByLocale(start, 'd', locale) : `-${formatByLocale(end, 'd MMM', locale)}`
      return type === 'start' ? formatByLocale(start, 'd MMM', locale) : ` - ${formatByLocale(end, 'd MMM', locale)}`
    }

    if (isSameYear(start, end)) {
      if (duration === 1)
        return type === 'start' ? formatByLocale(start, 'd MMM yyyy', locale) : ''
      if (isSameMonth(start, end))
        return type === 'start' ? formatByLocale(start, 'd', locale) : `-${formatByLocale(end, 'd MMM yyyy', locale)}`
      return type === 'start' ? formatByLocale(start, 'd MMM', locale) : ` - ${formatByLocale(end, 'd MMM yyyy', locale)}`
    }

    return type === 'start' ? formatByLocale(start, 'd MMM yyyy', locale) : ` - ${formatByLocale(end, 'd MMM yyyy', locale)}`
  }

  function formatDateToStringWithLast(params: DateFormatParams, isShowMaxRange?: boolean): string {
    const { by, duration, end, start, type } = params

    // Single duration cases
    if (duration === 1) {
      // Check if date is current period
      const isCurrent = (() => {
        switch (by) {
          case 'year': return isSameYear(start, today)
          case 'month': return isSameYear(start, today) && isSameMonth(start, today)
          case 'week': return isSameWeek(start, today, { weekStartsOn: 1 })
          case 'day': return isSameDay(start, today)
        }
      })()

      if (isCurrent)
        return handleCurrentPeriod(by, type)

      // Check if date is last period
      const lastPeriod = sub(today, { [`${by}s`]: 1 })
      const isLast = (() => {
        switch (by) {
          case 'year': return isSameYear(start, lastPeriod)
          case 'month': return isSameMonth(start, lastPeriod)
          case 'week': return isSameWeek(start, lastPeriod, { weekStartsOn: 1 })
          case 'day': return isSameDay(start, lastPeriod)
        }
      })()

      if (isLast)
        return handleLastPeriod(by, type)

      // Special case for single day in current year/month
      if (by === 'day' && isSameYear(start, today)) {
        return type === 'start' ? formatByLocale(start, 'd MMMM') : ''
      }
    }

    // Last N periods
    const isCurrentPeriod = (() => {
      switch (by) {
        case 'year': return isSameYear(end, today)
        case 'month': return isSameYear(end, today) && isSameMonth(end, today)
        case 'week': return isSameWeek(end, today, { weekStartsOn: 1 })
        case 'day': return isSameDay(end, today)
      }
    })()

    if (!isShowMaxRange && isCurrentPeriod)
      return handleLastNPeriods(by, duration, type)

    // Format by date unit
    switch (by) {
      case 'year': return formatYearRange(params)
      case 'month': return formatMonthRange(params)
      case 'week': return formatWeekRange(params)
      case 'day': return formatDayRange(params)
    }
  }

  /**
   * Calculates and formats a date range string based on the provided parameters.
   *
   * - If the duration is 1 day and the start date is in the current year, returns a localized date string for the start date (if `type` is `'start'`).
   * - Otherwise, formats the date range according to the specified granularity (`by`), which can be `'year'`, `'month'`, `'week'`, or `'day'`.
   *
   * @param params
   *   - `by`: The granularity of the date range ('year', 'month', 'week', or 'day').
   *   - `duration`: The length of the date range.
   *   - `start`: The start date of the range.
   *   - `type`: The type of date to format ('start' or other).
   * @returns A formatted date range string based on the input parameters.
   */
  function formatDateToString(params: DateFormatParams): string {
    const { by, duration, start, type } = params

    if (duration === 1 && by === 'day' && isSameYear(start, today)) {
      return type === 'start' ? formatByLocale(start, 'd MMMM') : ''
    }

    switch (by) {
      case 'year': return formatYearRange(params)
      case 'month': return formatMonthRange(params)
      case 'week': return formatWeekRange(params)
      case 'day': return formatDayRange(params)
    }
  }

  function getStringDateRange(range: Range, by: StatDateParams['rangeBy'], duration: StatDateParams['rangeDuration']) {
    const yearStart = formatDateToString({
      by,
      duration,
      end: new Date(range.end),
      start: new Date(range.start),
      type: 'start',
    })

    const yearEnd = formatDateToString({
      by,
      duration,
      end: new Date(range.end),
      start: new Date(range.start),
      type: 'end',
    })

    return `${yearStart}${yearEnd}`
  }

  return {
    formatDateToString,
    formatDateToStringWithLast,
    getStringDateRange,
  }
}
