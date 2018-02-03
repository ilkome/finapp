import moment from 'moment'

export default function formatDate(date) {
  let formatedDate
  if (moment.isDate(date)) {
    formatedDate = moment(date)
  } else {
    formatedDate = moment(date, 'D.MM.YY')
  }
  const nDate = moment(formatedDate).startOf('day').valueOf()

  // same year
  if (moment(formatedDate).isSame(moment(), 'year')) {
    formatedDate = moment(formatedDate).format('D MMM ddd')
  } else {
    formatedDate = moment(formatedDate).format('D MMM YY')
  }

  const today = moment().startOf('day').valueOf()
  const yesterday = moment().startOf('day').subtract(1, 'days').valueOf()

  switch (nDate) {
    case today: return `Today ${moment(nDate).format('ddd')}`
    case yesterday: return `Yesterday  ${moment(nDate).format('ddd')}`
    default: return formatedDate
  }
}
