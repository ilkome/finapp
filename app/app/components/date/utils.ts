import type { Duration } from 'date-fns'

import { UTCDate } from '@date-fns/utc'
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import { addDays, addMonths, addYears, differenceInDays, endOfDay, endOfMonth, endOfWeek, endOfYear, format, lastDayOfMonth, startOfDay, startOfMonth, startOfWeek, startOfYear, sub } from 'date-fns'
import { ru } from 'date-fns/locale'

import type { IntervalsInRangeProps, Period, Range } from '~/components/date/types'
import type { LocaleSlug } from '~/components/locale/types'

// ---------------------------------------------------------------------------
// Civil-day model (see plans/civil-date-migration.md)
//
// A transaction is a calendar DAY, not an instant. We encode that day as the
// UTC-midnight ms-epoch and do ALL boundary/stepping math in UTC, so every
// device computes identical day/week/month/year boundaries. The civil day is
// captured in the user's LOCAL timezone at entry ("what day is it for me"),
// then stored and operated on timezone-free.
//
// We reuse date-fns for the calendar math (clamping, DST, leap years) and just
// run it in UTC via `@date-fns/utc`'s UTCDate, rather than reimplementing it.
// ---------------------------------------------------------------------------

/** Wrap an epoch in a UTCDate so date-fns operates on UTC calendar fields. */
const u = (ms: number): UTCDate => new UTCDate(ms)

/** UTC-midnight ms-epoch of a calendar day (month is 0-based, like Date.UTC). */
export function toCivilDayEpoch(year: number, month: number, day: number): number {
  return Date.UTC(year, month, day)
}

/** Calendar parts of a civil-day epoch, read in UTC. */
export function epochToCivilParts(ms: number): { day: number, month: number, year: number } {
  const d = u(ms)
  return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() }
}

/** Snap any instant to the UTC-midnight of its UTC calendar day. */
export function civilDayStart(ms: number): number {
  return startOfDay(u(ms)).getTime()
}

/** Today's civil day, captured in the user's local timezone. */
export function todayCivilDayEpoch(): number {
  const t = today(getLocalTimeZone())
  return Date.UTC(t.year, t.month - 1, t.day)
}

/** `YYYY-MM-DD` key of a civil-day epoch (UTC), used for deterministic ids. */
export function civilDayKey(ms: number): string {
  return format(u(ms), 'yyyy-MM-dd')
}

/** Add (negative n subtracts) whole civil days. */
export function addCivilDays(ms: number, n: number): number {
  return addDays(u(ms), n).getTime()
}

/** Add (negative subtracts) whole calendar months, clamped to month length (date-fns). */
export function addCivilMonths(ms: number, n: number): number {
  return addMonths(u(ms), n).getTime()
}

/** Add (negative subtracts) whole calendar years, clamping Feb 29 -> Feb 28 (date-fns). */
export function addCivilYears(ms: number, n: number): number {
  return addYears(u(ms), n).getTime()
}

/** Last civil day (UTC-midnight) of the month containing `ms`. */
export function lastDayOfMonthCivil(ms: number): number {
  return startOfDay(lastDayOfMonth(u(ms))).getTime()
}

/** Same civil day? Compares UTC calendar days. */
export function isSameCivilDay(a: number, b: number): boolean {
  return civilDayStart(a) === civilDayStart(b)
}

/** A LOCAL instant -> the civil day it falls on in the LOCAL timezone (UTC-midnight epoch). */
export function localInstantToCivilDay(ms: number): number {
  const d = new Date(ms)
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
}

export function toDuration(period: Period, value: number): Duration {
  switch (period) {
    case 'day': return { days: value }
    case 'week': return { weeks: value }
    case 'month': return { months: value }
    case 'year': return { years: value }
  }
}

// Format a civil-day / interval-boundary value (UTC-midnight epoch) using its UTC
// wall-clock, so the stored day renders identically on any device.
export function formatByLocale(date: Date | number, formatter: string, locale?: LocaleSlug) {
  const ms = date instanceof Date ? date.getTime() : date
  const formatOptions = locale === 'ru' ? { locale: ru } : {}
  return format(u(ms), formatter, formatOptions)
}

export function calculateIntervalInRange(params: IntervalsInRangeProps): Range {
  const offset = (params.rangeOffset ?? 0) * params.intervalsDuration
  const baseDate = sub(u(params.range.end), toDuration(params.intervalsBy, offset))

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
  const { range } = params

  let current = calculateIntervalInRange({ ...params, rangeOffset: 0 })

  while (current.end > range.start) {
    list.push(current)
    current = calculateIntervalInRange({ ...params, range: current, rangeOffset: 1 })
  }

  list.reverse()

  if (list.length > 0) {
    if (list.at(-1)!.end > range.end)
      list.at(-1)!.end = getEndOf(u(range.end), 'day').getTime()

    if (list.at(0)!.start < range.start)
      list.at(0)!.start = getStartOf(u(range.start), 'day').getTime()
  }

  return list
}

export function getStartOf(date: Date, intervalType: Period): Date {
  const d = u(date.getTime())
  switch (intervalType) {
    case 'year':
      return startOfYear(d)
    case 'month':
      return startOfMonth(d)
    case 'week':
      return startOfWeek(d, { weekStartsOn: 1 })
    case 'day':
      return startOfDay(d)
  }
}

export function getEndOf(date: Date, intervalType: Period): Date {
  const d = u(date.getTime())
  switch (intervalType) {
    case 'year':
      return endOfYear(d)
    case 'month':
      return endOfMonth(d)
    case 'week':
      return endOfWeek(d, { weekStartsOn: 1 })
    case 'day':
      return endOfDay(d)
  }
}

export function getUCalendarToday() {
  return today(getLocalTimeZone())
}

/** Read a civil-day epoch (UTC-midnight) back into a CalendarDate for the picker. */
export function parseUCalendarDate(date: number) {
  const { day, month, year } = epochToCivilParts(date)
  return new CalendarDate(year, month + 1, day)
}

/** Picked CalendarDate -> civil-day epoch (UTC-midnight). No time-of-day stamping. */
export function getUCalendarCivilDate(date: CalendarDate) {
  return toCivilDayEpoch(date.year, date.month - 1, date.day)
}
