import dayjs from 'dayjs'
import type { Range, StatDateParams } from '~/components/date/types'

type DateFormatParams = {
  by: StatDateParams['rangeBy']
  duration: StatDateParams['rangeDuration']
  end: dayjs.Dayjs
  start: dayjs.Dayjs
  type: 'start' | 'end'
}

export function useGetDateRange(t: (key: string) => string) {
  const today = dayjs()

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
      return duration === 1 ? start.format('YYYY') : `${start.format('YYYY')} - ${end.format('YYYY')}`
    return ''
  }

  function formatMonthRange({ duration, end, start, type }: DateFormatParams): string {
    if (start.isSame(today, 'year')) {
      if (start.isSame(today, 'month') || duration === 1)
        return type === 'start' ? start.format('MMMM') : ''
      return type === 'start' ? start.format('MMMM') : ` - ${end.format('MMMM')}`
    }

    if (start.isSame(end, 'year')) {
      if (start.isSame(end, 'month'))
        return type === 'start' ? start.format('MMMM YYYY') : ''
      return type === 'start' ? start.format('MMMM') : ` - ${end.format('MMMM YYYY')}`
    }

    return type === 'start' ? start.format('MMMM YYYY') : ` - ${end.format('MMMM YYYY')}`
  }

  function formatWeekRange({ end, start, type }: DateFormatParams): string {
    if (start.isSame(today, 'year')) {
      if (start.isSame(today, 'month') || start.isSame(end, 'month'))
        return type === 'start' ? start.format('D') : ` - ${end.format('D MMMM')}`
      return type === 'start' ? start.format('D MMMM') : ` - ${end.format('D MMMM')}`
    }

    if (start.isSame(end, 'year')) {
      if (start.isSame(end, 'month'))
        return type === 'start' ? start.format('D') : ` - ${end.format('D MMMM YYYY')}`
      return type === 'start' ? start.format('D MMMM') : ` - ${end.format('D MMMM YYYY')}`
    }

    return type === 'start' ? start.format('D MMMM YYYY') : ` - ${end.format('D MMMM YYYY')}`
  }

  function formatDayRange({ duration, end, start, type }: DateFormatParams): string {
    if (start.isSame(today, 'year')) {
      if (start.isSame(end, 'month'))
        return type === 'start' ? start.format('D') : `-${end.format('D MMMM')}`
      return type === 'start' ? start.format('D MMMM') : ` - ${end.format('D MMMM')}`
    }

    if (start.isSame(end, 'year')) {
      if (duration === 1)
        return type === 'start' ? start.format('D MMMM YYYY') : ''
      if (start.isSame(end, 'month'))
        return type === 'start' ? start.format('D') : `-${end.format('D MMMM YYYY')}`
      return type === 'start' ? start.format('D MMMM') : ` - ${end.format('D MMMM YYYY')}`
    }

    return type === 'start' ? start.format('D MMMM YYYY') : ` - ${end.format('D MMMM YYYY')}`
  }

  function calculateDate(params: DateFormatParams): string {
    const { by, duration, end, start, type } = params

    // Single duration cases
    if (duration === 1) {
      if (start.isSame(today, by))
        return handleCurrentPeriod(by, type)

      if (start.isSame(today.subtract(1, by), by))
        return handleLastPeriod(by, type)

      // Special case for single day in current year/month
      if (by === 'day' && start.isSame(today, 'year')) {
        if (start.isSame(today, 'month'))
          return type === 'start' ? start.format('D MMMM') : ''
        return type === 'start' ? start.format('D MMMM') : ''
      }
    }

    // Last N periods case
    if (end.isSame(today, by))
      return handleLastNPeriods(by, duration, type)

    // Format by date unit
    switch (by) {
      case 'year': return formatYearRange(params)
      case 'month': return formatMonthRange(params)
      case 'week': return formatWeekRange(params)
      case 'day': return formatDayRange(params)
    }
  }

  function getDate(range: Range, by: StatDateParams['rangeBy'], duration: StatDateParams['rangeDuration']) {
    const yearStart = calculateDate({
      by,
      duration,
      end: dayjs(range.end),
      start: dayjs(range.start),
      type: 'start',
    })

    const yearEnd = calculateDate({
      by,
      duration,
      end: dayjs(range.end),
      start: dayjs(range.start),
      type: 'end',
    })

    return `${yearStart}${yearEnd}`
  }

  return { getDate }
}
