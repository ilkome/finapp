import dayjs from 'dayjs'
import type { PeriodNameWithAll } from '~/components/filter/types'

export function useDateFormats() {
  const { t } = useI18n()

  function getFormatForChart(periodName: PeriodNameWithAll) {
    switch (periodName) {
      case 'day':
        return 'D MMM'
      case 'week':
        return 'D MMM'
      case 'month':
        return 'MMM'
      case 'year':
        return 'YYYY'
      default:
        return 'MM'
    }
  }

  function getDates(periodName: PeriodNameWithAll, date: number) {
    if (periodName === 'all')
      return

    const filterDate = dayjs(date)
    const from = filterDate.startOf(periodName).valueOf()
    const until = filterDate.endOf(periodName).valueOf()

    return { from, until }
  }

  function formatDate(value: number, type: 'trnItem' | 'full') {
    if (!value)
      return false

    switch (type) {
      case 'full':
        return {
          day: dayjs(+value).format('D'),
          month: dayjs(+value).format('MMM'),
          week: dayjs(+value).format('DD.MM'),
          weekday: dayjs(+value).calendar(null, {
            lastDay: `[${t('dates.day.last')}], dddd`,
            lastWeek: 'dddd',
            nextDay: `[${t('dates.day.next')}], dddd`,
            nextWeek: 'dddd',
            sameDay: `[${t('dates.day.today')}], dddd`,
            sameElse: 'dddd',
          }),
          year: dayjs(+value).format('YYYY'),
        }

      case 'trnItem':
        if (dayjs().isSame(+value, 'day'))
          return t('dates.day.today')

        if (dayjs().isSame(dayjs(+value).add(1, 'day'), 'day'))
          return t('dates.day.last')

        if (dayjs().isSame(+value, 'year'))
          return dayjs(+value).format('DD.MM')

        return dayjs(+value).format('DD.MM.YY')

      default:
        return dayjs(+value).format('D MMMM YY')
    }
  }

  return {
    formatDate,
    getDates,
    getFormatForChart,
  }
}
