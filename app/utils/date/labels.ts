import type { Period, Range } from '~~/utils/date/types'

import { UTCDate } from '@date-fns/utc'
import { isSameDay as dfIsSameDay, isSameMonth as dfIsSameMonth, isSameWeek as dfIsSameWeek, isSameYear as dfIsSameYear, differenceInDays, sub } from 'date-fns'
import { civilDayStart, formatByLocale, todayCivilDayEpoch } from '~~/utils/date/civil'
import { toDuration } from '~~/utils/date/period'

import type { LocaleSlug } from '~/components/locale/types'
import type { StatDateParams } from '~/components/stat/date/types'

type DateFormatParams = {
  by: StatDateParams['rangeBy']
  duration: StatDateParams['rangeDuration']
  end: Date
  start: Date
}

// Civil-day model: compare in UTC (via UTCDate) so labels match the rendered civil day on any device.
const u = (d: Date): UTCDate => new UTCDate(d.getTime())

function isSameYear(a: Date, b: Date): boolean {
  return dfIsSameYear(u(a), u(b))
}

function isSameMonth(a: Date, b: Date): boolean {
  return dfIsSameMonth(u(a), u(b))
}

function isSamePeriod(a: Date, b: Date, by: Period): boolean {
  switch (by) {
    case 'year': return isSameYear(a, b)
    case 'month': return isSameMonth(a, b)
    case 'week': return dfIsSameWeek(u(a), u(b), { weekStartsOn: 1 })
    case 'day': return dfIsSameDay(u(a), u(b))
  }
}

function subOnePeriod(date: Date, by: Period): Date {
  return sub(u(date), toDuration(by, 1))
}

export function createRangeFormatter(t: (key: string, choice?: number) => string, locale?: LocaleSlug) {
  const today = new Date(todayCivilDayEpoch())

  function formatYearRange({ duration, end, start }: DateFormatParams): string {
    return duration === 1
      ? formatByLocale(start, 'yyyy', locale)
      : `${formatByLocale(start, 'yyyy', locale)} - ${formatByLocale(end, 'yyyy', locale)}`
  }

  function formatMonthRange({ duration, end, start }: DateFormatParams): string {
    if (isSameYear(start, today)) {
      if (isSameMonth(start, today) || duration === 1)
        return formatByLocale(start, 'LLLL', locale)
      return `${formatByLocale(start, 'LLL', locale)} - ${formatByLocale(end, 'LLL', locale)}`
    }

    if (isSameYear(start, end)) {
      if (isSameMonth(start, end))
        return formatByLocale(start, 'LLL yyyy', locale)
      return `${formatByLocale(start, 'LLL', locale)} - ${formatByLocale(end, 'LLL yyyy', locale)}`
    }

    return `${formatByLocale(start, 'LLL yyyy', locale)} - ${formatByLocale(end, 'LLL yyyy', locale)}`
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

  function formatRangeWithLast(params: DateFormatParams, isShowMaxRange?: boolean): string {
    const { by, duration, end, start } = params

    if (!isShowMaxRange && duration === 1) {
      if (isSamePeriod(start, today, by))
        return t(`dates.${by}.current`)

      if (isSamePeriod(start, subOnePeriod(today, by), by))
        return t(`dates.${by}.last`)

      if (by === 'day' && isSameYear(start, today))
        return formatByLocale(start, 'd MMMM', locale)
    }

    if (!isShowMaxRange && isSamePeriod(end, today, by))
      return `${t(`dates.last.${by}`, duration)} ${duration} ${t(`dates.${by}.plural`, duration)}`

    return formatByPeriod(params)
  }

  function formatRangeShort(params: DateFormatParams): string {
    const { by, duration, start } = params

    if (duration === 1 && isSamePeriod(start, today, by)) {
      if (by === 'day')
        return t('dates.day.current')
      if (by === 'week')
        return t('dates.week.current')
    }

    if (duration === 1 && by === 'day' && isSameYear(start, today))
      return formatByLocale(start, 'd MMMM', locale)

    return formatByPeriod(params)
  }

  function formatRange(range: Range, by: StatDateParams['rangeBy'], duration: StatDateParams['rangeDuration']) {
    return formatRangeShort({
      by,
      duration,
      end: new Date(range.end),
      start: new Date(range.start),
    })
  }

  return {
    formatRange,
    formatRangeShort,
    formatRangeWithLast,
  }
}

export type TrnDateParts = {
  day: string
  full: string
  month: string
  week: string
  weekday: string
  year: string
}

export function formatTrnDateLabel(value: number, type: 'trnItem' | 'full', t: (key: string, choice?: number) => string, locale?: LocaleSlug): string | TrnDateParts | undefined {
  if (!value)
    return undefined

  const { formatRangeWithLast } = createRangeFormatter(t, locale)
  const date = new Date(value)
  // Compare civil days (UTC-midnight) so "today"/"yesterday" labels are timezone-stable.
  const diff = differenceInDays(todayCivilDayEpoch(), civilDayStart(value))

  switch (type) {
    case 'full':
      return {
        day: formatByLocale(date, 'd', locale),
        full: formatByLocale(date, 'dd.MM.yyyy HH:mm', locale),
        month: formatByLocale(date, 'MMM', locale),
        week: formatByLocale(date, 'dd.MM', locale),
        weekday: `${diff < 2 ? `${formatRangeWithLast({ by: 'day', duration: 1, end: date, start: date })}, ` : ''} ${formatByLocale(date, 'EEEE', locale)}`,
        year: formatByLocale(date, 'yyyy', locale),
      }

    case 'trnItem':
      return formatRangeWithLast({ by: 'day', duration: 1, end: date, start: date })
  }
}
