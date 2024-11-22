import { format, isSameDay, isSameMonth, isSameWeek, isSameYear, sub } from 'date-fns'
import type { Range, StatDateParams } from '~/components/date/types'

type DateFormatParams = {
  by: StatDateParams['rangeBy']
  duration: StatDateParams['rangeDuration']
  end: Date
  start: Date
  type: 'start' | 'end'
}

export function useGetDateRange(t: (key: string) => string) {
  const today = new Date()

  // Helper functions for period handling
  function handleCurrentPeriod(by: StatDateParams['rangeBy'], type: 'start' | 'end') {
    return type === 'start' ? t(`dates.${by}.current`) : ''
  }

  function handleLastPeriod(by: StatDateParams['rangeBy'], type: 'start' | 'end') {
    return type === 'start' ? t(`dates.${by}.last`) : ''
  }

  function handleLastNPeriods(by: StatDateParams['rangeBy'], duration: number, type: 'start' | 'end') {
    return type === 'start' ? '' : `${t('dates.last')} ${duration} ${t(`dates.${by}.simple`)}`
  }

  function formatYearRange({ duration, end, start, type }: DateFormatParams): string {
    if (type === 'start')
      return duration === 1 ? format(start, 'yyyy') : `${format(start, 'yyyy')} - ${format(end, 'yyyy')}`
    return ''
  }

  function formatMonthRange({ duration, end, start, type }: DateFormatParams): string {
    if (isSameYear(start, today)) {
      if (isSameMonth(start, today) || duration === 1)
        return type === 'start' ? format(start, 'MMM') : ''
      return type === 'start' ? format(start, 'MMM') : ` - ${format(end, 'MMM')}`
    }

    if (isSameYear(start, end)) {
      if (isSameMonth(start, end))
        return type === 'start' ? format(start, 'MMM yyyy') : ''
      return type === 'start' ? format(start, 'MMM') : ` - ${format(end, 'MMM yyyy')}`
    }

    return type === 'start' ? format(start, 'MMM yyyy') : ` - ${format(end, 'MMM yyyy')}`
  }

  function formatWeekRange({ end, start, type }: DateFormatParams): string {
    if (isSameYear(start, today)) {
      if (isSameMonth(start, today) || isSameMonth(start, end))
        return type === 'start' ? format(start, 'd') : `-${format(end, 'd MMM')}`
      return type === 'start' ? format(start, 'd MMM') : ` - ${format(end, 'd MMM')}`
    }

    if (isSameYear(start, end)) {
      if (isSameMonth(start, end))
        return type === 'start' ? format(start, 'd') : `-${format(end, 'd MMM yyyy')}`
      return type === 'start' ? format(start, 'd MMM') : ` - ${format(end, 'd MMM yyyy')}`
    }

    return type === 'start' ? format(start, 'd MMM yyyy') : ` - ${format(end, 'd MMM yyyy')}`
  }

  function formatDayRange({ duration, end, start, type }: DateFormatParams): string {
    if (isSameYear(start, today)) {
      if (isSameMonth(start, end))
        return type === 'start' ? format(start, 'd') : `-${format(end, 'd MMM')}`
      return type === 'start' ? format(start, 'd MMM') : ` - ${format(end, 'd MMM')}`
    }

    if (isSameYear(start, end)) {
      if (duration === 1)
        return type === 'start' ? format(start, 'd MMM yyyy') : ''
      if (isSameMonth(start, end))
        return type === 'start' ? format(start, 'd') : `-${format(end, 'd MMM yyyy')}`
      return type === 'start' ? format(start, 'd MMM') : ` - ${format(end, 'd MMM yyyy')}`
    }

    return type === 'start' ? format(start, 'd MMM yyyy') : ` - ${format(end, 'd MMM yyyy')}`
  }

  function calculateDate(params: DateFormatParams): string {
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
        if (isSameMonth(start, today))
          return type === 'start' ? format(start, 'd MMM') : ''
        return type === 'start' ? format(start, 'd MMM') : ''
      }
    }

    // Last N periods case
    const isCurrentPeriod = (() => {
      switch (by) {
        case 'year': return isSameYear(end, today)
        case 'month': return isSameYear(end, today) && isSameMonth(end, today)
        case 'week': return isSameWeek(end, today, { weekStartsOn: 1 })
        case 'day': return isSameDay(end, today)
      }
    })()

    if (isCurrentPeriod)
      return handleLastNPeriods(by, duration, type)

    // Format by date unit
    switch (by) {
      case 'year': return formatYearRange(params)
      case 'month': return formatMonthRange(params)
      case 'week': return formatWeekRange(params)
      case 'day': return formatDayRange(params)
    }
  }

  function getStringDateRange(range: Range, by: StatDateParams['rangeBy'], duration: StatDateParams['rangeDuration']) {
    const yearStart = calculateDate({
      by,
      duration,
      end: new Date(range.end),
      start: new Date(range.start),
      type: 'start',
    })

    const yearEnd = calculateDate({
      by,
      duration,
      end: new Date(range.end),
      start: new Date(range.start),
      type: 'end',
    })

    return `${yearStart}${yearEnd}`
  }

  return { getStringDateRange }
}
