import dayjs from 'dayjs'
import type { Range, StatDateParams } from '~/components/date/types'

export function useGetDateRange(t: (key: string) => string) {
  const today = dayjs()

  function calculateDate({
    by,
    duration,
    end,
    start,
    type,
  }: {
    by: StatDateParams['rangeBy']
    duration: StatDateParams['rangeDuration']
    end: dayjs.Dayjs
    start: dayjs.Dayjs
    type: 'start' | 'end'
  }) {
    // Year
    if (by === 'year') {
      if (duration === 1) {
        if (start.isSame(today, 'year')) {
          return type === 'start' ? t('dates.year.current') : ''
        }

        if (start.isSame(today.subtract(1, 'year'), 'year'))
          return type === 'start' ? t('dates.year.last') : ''
      }

      if (end.isSame(today, 'year'))
        return type === 'start' ? '' : `${t('dates.last')} ${duration} ${t('dates.year.simple')}`

      if (type === 'start')
        return duration === 1 ? start.format('YYYY') : `${start.format('YYYY')} - ${end.format('YYYY')}`
      else
        return ''
    }

    // Month
    if (by === 'month') {
      if (duration === 1) {
        if (start.isSame(today, 'month'))
          return type === 'start' ? t('dates.month.current') : ''

        if (start.isSame(today.subtract(1, 'month'), 'month'))
          return type === 'start' ? t('dates.month.last') : ''
      }

      if (end.isSame(today, 'month'))
        return type === 'start' ? '' : `${t('dates.last')} ${duration} ${t('dates.month.simple')}`

      if (start.isSame(end, 'year')) {
        if (start.isSame(end, 'month'))
          return type === 'start' ? start.format('MMMM YYYY') : ''

        return type === 'start' ? start.format('MMMM') : ` - ${end.format('MMMM YYYY')}`
      }

      return type === 'start' ? start.format('MMMM YYYY') : ` - ${end.format('MMMM YYYY')}`
    }

    // Week
    if (by === 'week') {
      if (duration === 1) {
        if (start.isSame(today, 'week'))
          return type === 'start' ? t('dates.week.current') : ''

        if (start.isSame(today.subtract(1, 'week'), 'week'))
          return type === 'start' ? t('dates.week.last') : ''
      }

      if (end.isSame(today, 'week'))
        return type === 'start' ? '' : `${t('dates.last')} ${duration} ${t('dates.week.simple')}`

      if (start.isSame(end, 'year')) {
        if (start.isSame(end, 'month'))
          return type === 'start' ? start.format('D') : ` - ${end.format('D MMMM YYYY')}`

        return type === 'start' ? start.format('D MMMM') : ` - ${end.format('D MMMM YYYY')}`
      }

      return type === 'start' ? start.format('D MMMM YYYY') : ` - ${end.format('D MMMM YYYY')}`
    }

    // Day
    if (by === 'day') {
      if (duration === 1) {
        if (start.isSame(today, 'day'))
          return type === 'start' ? t('dates.day.current') : ''

        if (start.isSame(today.subtract(1, 'day'), 'day'))
          return type === 'start' ? t('dates.day.last') : ''

        if (start.isSame(today, 'year')) {
          if (start.isSame(today, 'month'))
            return type === 'start' ? start.format('D MMMM') : ''

          return type === 'start' ? start.format('D MMMM') : ''
        }

        return type === 'start' ? start.format('D MMMM YYYY') : ''
      }

      if (end.isSame(today, 'day'))
        return type === 'start' ? '' : `${t('dates.last')} ${duration} ${t('dates.day.simple')}`

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
