import { UTCDate } from '@date-fns/utc'
import { getLocalTimeZone, today } from '@internationalized/date'
import { addDays, addMonths, addYears, format, lastDayOfMonth, startOfDay, startOfMonth } from 'date-fns'
import { ru } from 'date-fns/locale'

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
export const u = (ms: number): UTCDate => new UTCDate(ms)

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

/** First civil day (UTC-midnight) of the month containing `ms`. */
export function startOfMonthCivil(ms: number): number {
  return startOfMonth(u(ms)).getTime()
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

// Format a civil-day / interval-boundary value (UTC-midnight epoch) using its UTC
// wall-clock, so the stored day renders identically on any device.
export function formatByLocale(date: Date | number, formatter: string, locale?: LocaleSlug) {
  const ms = date instanceof Date ? date.getTime() : date
  const formatOptions = locale === 'ru' ? { locale: ru } : {}
  return format(u(ms), formatter, formatOptions)
}
