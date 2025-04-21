import { differenceInDays, endOfDay, endOfMonth, endOfWeek, endOfYear, format, startOfDay, startOfMonth, startOfWeek, startOfYear, sub } from 'date-fns'
import { ru } from 'date-fns/locale'

import type { IntervalsInRangeProps, Range } from '~/components/date/types'
import type { LocaleSlug } from '~/components/locale/types'

export function formatByLocale(date: Date, formatter: string, locale?: LocaleSlug) {
  const formatOptions = locale === 'ru' ? { locale: ru } : {}
  return format(date, formatter, formatOptions)
}

export function calculateIntervalInRange(params: IntervalsInRangeProps): Range {
  const offset = (params.rangeOffset ?? 0) * params.intervalsDuration
  const baseDate = sub(new Date(params.range.end), {
    [`${params.intervalsBy}s`]: offset,
  })

  return {
    end: getEndOf(baseDate, params.intervalsBy).getTime(),
    start: getStartOf(
      sub(baseDate, { [`${params.intervalsBy}s`]: params.intervalsDuration - 1 }),
      params.intervalsBy,
    ).getTime(),
  }
}

export function calculateBestIntervalsBy(range: Range) {
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
    list.unshift(current)

    current = calculateIntervalInRange({
      intervalsBy,
      intervalsDuration,
      range: current,
      rangeOffset: 1,
    })
  }

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

export function getStartOf(date: Date, intervalType: string): Date {
  switch (intervalType) {
    case 'year':
      return startOfYear(date)
    case 'month':
      return startOfMonth(date)
    case 'week':
      return startOfWeek(date, { weekStartsOn: 1 })
    default:
      return startOfDay(date)
  }
}

export function getEndOf(date: Date, intervalType: string): Date {
  switch (intervalType) {
    case 'year':
      return endOfYear(date)
    case 'month':
      return endOfMonth(date)
    case 'week':
      return endOfWeek(date, { weekStartsOn: 1 })
    default:
      return endOfDay(date)
  }
}
