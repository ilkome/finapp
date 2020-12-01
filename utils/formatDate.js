import dayjs from 'dayjs'
const calendar = require('dayjs/plugin/calendar')

dayjs.extend(calendar)

export const formatDate = (value, type) => {
  // eslint-disable-next-line no-undef
  const currentLocale = $nuxt.$i18n.locale

  switch (type) {
    case 'full':
      return {
        day: dayjs(+value).format('D'),
        weekday: dayjs(+value).calendar(null, {
          sameDay: `[${currentLocale === 'ru' ? 'Сегодня' : 'Today'}] dddd`,
          nextDay: `[${currentLocale === 'ru' ? 'Завтра' : 'Tomorrow'}] dddd`,
          nextWeek: 'dddd',
          lastDay: `[${currentLocale === 'ru' ? 'Вчера' : 'Yesterday'}] dddd`,
          lastWeek: 'dddd',
          sameElse: 'dddd'
        }),
        week: dayjs(+value).format('DD.MM'),
        month: dayjs(+value).format('MMM'),
        year: dayjs(+value).format('YYYY')
      }

    case 'number':
      return dayjs(+value).format('DD.MM.YY')

    case 'numberDay':
      return dayjs(+value).format('DD.MM')

    case 'trnItem':
      if (dayjs().isSame(+value, 'day')) {
        return 'dates.day.today'
      }
      if (dayjs().isSame(dayjs(+value).add(1, 'day'), 'day')) {
        return 'dates.day.yesterday'
      }
      if (dayjs().isSame(+value, 'year')) {
        return dayjs(+value).format('DD.MM')
      }
      return dayjs(+value).format('DD.MM.YY')

    default:
      return dayjs(+value).format('D MMMM YY')
  }
}
