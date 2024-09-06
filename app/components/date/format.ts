import dayjs from 'dayjs'
import type { PeriodNameWithAll } from '~/components/filter/types'

export function getFormatForChart(periodName: PeriodNameWithAll) {
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

export function getDates(periodName: PeriodNameWithAll, date: number) {
  if (periodName === 'all')
    return

  const filterDate = dayjs(date)
  const from = filterDate.startOf(periodName).valueOf()
  const until = filterDate.endOf(periodName).valueOf()

  return { from, until }
}

export function formatDate(value: number, type: 'trnItem' | 'full') {
  if (!value)
    return false

  const { $i18n } = useNuxtApp()
  const currentLocale = $i18n.locale.value

  switch (type) {
    case 'full':
      return {
        day: dayjs(+value).format('D'),
        month: dayjs(+value).format('MMM'),
        week: dayjs(+value).format('DD.MM'),
        weekday: dayjs(+value).calendar(null, {
          lastDay: `[${currentLocale === 'ru' ? 'Вчера' : 'Yesterday'}], dddd`,
          lastWeek: 'dddd',
          nextDay: `[${currentLocale === 'ru' ? 'Завтра' : 'Tomorrow'}], dddd`,
          nextWeek: 'dddd',
          sameDay: `[${currentLocale === 'ru' ? 'Сегодня' : 'Today'}], dddd`,
          sameElse: 'dddd',
        }),
        year: dayjs(+value).format('YYYY'),
      }

    case 'trnItem':
      if (dayjs().isSame(+value, 'day'))
        return $i18n.t('dates.day.today')

      if (dayjs().isSame(dayjs(+value).add(1, 'day'), 'day'))
        return $i18n.t('dates.day.yesterday')

      if (dayjs().isSame(+value, 'year'))
        return dayjs(+value).format('DD.MM')

      return dayjs(+value).format('DD.MM.YY')

    default:
      return dayjs(+value).format('D MMMM YY')
  }
}
