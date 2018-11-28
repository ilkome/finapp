import moment from 'moment'

export const formatDate = (value, type) => {
  const date = moment(+value)
  const today = moment()

  switch (type) {
    case 'full':
      return {
        day: date.format('D'),
        weekDay: date.calendar(null, {
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

    case 'trnItem':
      if (today.isSame(date, 'year')) {
        return date.format('DD MMM')
      }
      return date.format('DD MMM YY')

    default:
      return date.format('D MMMM YY')
  }
}
