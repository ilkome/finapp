import moment from 'moment'

export const formatDate = (value, type) => {
  const date = moment(+value)
  const today = moment()

  switch (type) {
    case 'full':
      return {
        day: date.format('D'),
        weekday: date.calendar(null, {
          sameDay: '[Today] ddd',
          nextDay: '[Tomorrow] ddd',
          nextWeek: 'dddd',
          lastDay: '[Yesterday] ddd',
          lastWeek: 'dddd',
          sameElse: 'dddd'
        }),
        month: date.format('MMM'),
        year: date.format('YYYY')
      }

    case 'number':
      return date.format('DD.MM.YY')

    case 'numberDay':
      return date.format('DD.MM')

    case 'trnItem':
      if (today.isSame(date, 'day')) {
        return 'Today'
      }
      if (today.isSame(moment(date).add(1, 'day'), 'day')) {
        return 'Yesterday'
      }
      if (today.isSame(date, 'year')) {
        return date.format('DD.MM')
      }
      return date.format('DD.MM.YY')

    default:
      return date.format('D MMMM YY')
  }
}
