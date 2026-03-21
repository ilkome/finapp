import type { CalendarDate } from '@internationalized/date'
import type { Duration } from 'date-fns'

import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { differenceInDays, endOfDay, endOfMonth, endOfWeek, endOfYear, format, formatISO, startOfDay, startOfMonth, startOfWeek, startOfYear, sub } from 'date-fns'
import { ru } from 'date-fns/locale'

import type { IntervalsInRangeProps, Period, Range } from '~/components/date/types'
import type { LocaleSlug } from '~/components/locale/types'

export function toDuration(period: Period, value: number): Duration {
  switch (period) {
    case 'day': return { days: value }
    case 'week': return { weeks: value }
    case 'month': return { months: value }
    case 'year': return { years: value }
  }
}

export function formatByLocale(date: Date, formatter: string, locale?: LocaleSlug) {
  const formatOptions = locale === 'ru' ? { locale: ru } : {}
  return format(date, formatter, formatOptions)
}

export function calculateIntervalInRange(params: IntervalsInRangeProps): Range {
  const offset = (params.rangeOffset ?? 0) * params.intervalsDuration
  const baseDate = sub(new Date(params.range.end), toDuration(params.intervalsBy, offset))

  return {
    end: getEndOf(baseDate, params.intervalsBy).getTime(),
    start: getStartOf(
      sub(baseDate, toDuration(params.intervalsBy, params.intervalsDuration - 1)),
      params.intervalsBy,
    ).getTime(),
  }
}

export function calculateBestIntervalsBy(range: Range): Period {
  const rangeDuration = differenceInDays(range.end, range.start)
  return rangeDuration > 400
    ? 'year'
    : rangeDuration > 80
      ? 'month'
      : 'day'
}

export function getIntervalsInRange(params: IntervalsInRangeProps) {
  const list: Range[] = []
  const { intervalsBy, intervalsDuration, range } = params

  let current = calculateIntervalInRange({
    intervalsBy,
    intervalsDuration,
    range,
    rangeOffset: 0,
  })

  while (current.end > range.start) {
    list.push(current)

    current = calculateIntervalInRange({
      intervalsBy,
      intervalsDuration,
      range: current,
      rangeOffset: 1,
    })
  }

  list.reverse()

  if (list.length > 0) {
    if (list.at(-1)!.end > range.end) {
      list.at(-1)!.end = endOfDay(new Date(range.end)).getTime()
    }

    if (list.at(0)!.start < range.start) {
      list.at(0)!.start = startOfDay(new Date(range.start)).getTime()
    }
  }

  return list
}

export function getStartOf(date: Date, intervalType: Period): Date {
  switch (intervalType) {
    case 'year':
      return startOfYear(date)
    case 'month':
      return startOfMonth(date)
    case 'week':
      return startOfWeek(date, { weekStartsOn: 1 })
    case 'day':
      return startOfDay(date)
  }
}

export function getEndOf(date: Date, intervalType: Period): Date {
  switch (intervalType) {
    case 'year':
      return endOfYear(date)
    case 'month':
      return endOfMonth(date)
    case 'week':
      return endOfWeek(date, { weekStartsOn: 1 })
    case 'day':
      return endOfDay(date)
  }
}

export function getUCalendarToday() {
  return today(getLocalTimeZone())
}

export function parseUCalendarDate(date: number) {
  return parseDate(formatISO(date, { representation: 'date' }))
}

export function getUCalendarTimedDate(date: CalendarDate) {
  const now = new Date()
  const localDate = date.toDate(getLocalTimeZone())
  return localDate.setHours(now.getHours(), now.getMinutes())
}
