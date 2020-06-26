import dayjs from 'dayjs'
const calendar = require('dayjs/plugin/calendar')

dayjs.extend(calendar)

export const formatDate = (value, type) => {
  switch (type) {
    case 'full':
      return {
        day: dayjs(+value).format('D'),
        weekday: dayjs(+value).calendar(null, {
          sameDay: '[Today] ddd',
          nextDay: '[Tomorrow] ddd',
          nextWeek: 'dddd',
          lastDay: '[Yesterday] ddd',
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
        return 'Today'
      }
      if (dayjs().isSame(dayjs(+value).add(1, 'day'), 'day')) {
        return 'Yesterday'
      }
      if (dayjs().isSame(+value, 'year')) {
        return dayjs(+value).format('DD.MM')
      }
      return dayjs(+value).format('DD.MM.YY')

    default:
      return dayjs(+value).format('D MMMM YY')
  }
}
