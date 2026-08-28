import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import { epochToCivilParts, toCivilDayEpoch } from '~~/utils/date/civil'

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
