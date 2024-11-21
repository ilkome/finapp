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

  function handleCurrentPeriod(by: StatDateParams['rangeBy'], type: 'start' | 'end') {
    return type === 'start' ? t(`dates.${by}.current`) : ''
  }

  function handleLastPeriod(by: StatDateParams['rangeBy'], type: 'start' | 'end') {
    return type === 'start' ? t(`dates.${by}.last`) : ''
  }

  function handleLastNPeriods(by: StatDateParams['rangeBy'], duration: number, type: 'start' | 'end') {
    return type === 'start' ? '' : `${t('dates.last')} ${duration} ${t(`dates.${by}.simple`)}`
  }

  function calculateDate({ by, duration, end, start, type }: DateFormatParams): string {
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

    // Specific format cases
    switch (by) {
      case 'year':
        if (type === 'start')
          return duration === 1 ? start.format('YYYY') : `${start.format('YYYY')} - ${end.format('YYYY')}`
        return ''

      case 'month':
        if (start.isSame(end, 'year')) {
          if (start.isSame(end, 'month'))
            return type === 'start' ? start.format('MMMM YYYY') : ''
          return type === 'start' ? start.format('MMMM') : ` - ${end.format('MMMM YYYY')}`
        }
        return type === 'start' ? start.format('MMMM YYYY') : ` - ${end.format('MMMM YYYY')}`

      case 'week':
        if (start.isSame(end, 'year')) {
          if (start.isSame(end, 'month'))
            return type === 'start' ? start.format('D') : ` - ${end.format('D MMMM YYYY')}`
          return type === 'start' ? start.format('D MMMM') : ` - ${end.format('D MMMM YYYY')}`
        }
        return type === 'start' ? start.format('D MMMM YYYY') : ` - ${end.format('D MMMM YYYY')}`

      case 'day':
        if (start.isSame(today, 'year')) {
          if (start.isSame(end, 'month'))
            return type === 'start' ? start.format('D') : `-${end.format('D MMMM')}`
          return type === 'start' ? start.format('D MMMM') : ` - ${end.format('D MMMM')}`
        }
        if (start.isSame(end, 'year')) {
          if (start.isSame(end, 'month'))
            return type === 'start' ? start.format('D') : `-${end.format('D MMMM YYYY')}`
          return type === 'start' ? start.format('D MMMM') : ` - ${end.format('D MMMM YYYY')}`
        }
        return type === 'start' ? start.format('D MMMM YYYY') : ` - ${end.format('D MMMM YYYY')}`
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

  return {
    getDate,
  }
}
