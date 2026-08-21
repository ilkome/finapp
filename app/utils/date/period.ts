import type { Duration } from 'date-fns'
import type { Period } from '~~/utils/date/types'

import { endOfDay, endOfMonth, endOfWeek, endOfYear, startOfDay, startOfMonth, startOfWeek, startOfYear } from 'date-fns'
import { u } from '~~/utils/date/civil'

export function toDuration(period: Period, value: number): Duration {
  switch (period) {
    case 'day': return { days: value }
    case 'week': return { weeks: value }
    case 'month': return { months: value }
    case 'year': return { years: value }
  }
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
