import moment from 'moment'

/**
 * Format date.
 * @param {string} start - .
 * @param {string} end - .
 * @param {string} type - .
 * @return {object} Formated date.
 */
export default function formatDateForDashboardTitle(start, end) {
  const startDate = moment(start).startOf('day')
  const endDate = moment(end).endOf('day').valueOf()

  // Same year
  if (moment(startDate).format('Y') === moment(endDate).format('Y')) {
    // Same month
    if (moment(startDate).format('M') === moment(endDate).format('M')) {
      // Same day
      if (moment(startDate).format('D') === moment(endDate).format('D')) {
        return `${moment(startDate).format('D MMM')}`
      } else {
        return `${moment(startDate).format('D')} - ${moment(endDate).format('D')} ${moment(endDate).format('MMM')}`
      }
    } else {
      return `${moment(startDate).format('D MMM')} - ${moment(endDate).format('D MMM')}`
    }
  }

  // Differnt year
  if (moment(startDate).format('Y') !== moment(endDate).format('Y')) {
    // Same month
    if (moment(startDate).format('M') === moment(endDate).format('M')) {
      // Same day
      if (moment(startDate).format('D') === moment(endDate).format('D')) {
        return `${moment(startDate).format('D MMM YY')}`
      } else {
        return `${moment(startDate).format('D MMM YY')} - ${moment(endDate).format('D MMM YY')}`
      }
    } else {
      return `${moment(startDate).format('D MMM YY')} - ${moment(endDate).format('D MMM YY')}`
    }
  }
}
