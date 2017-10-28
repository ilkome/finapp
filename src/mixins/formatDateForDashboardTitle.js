import moment from 'moment'

/**
 * Format date.
 * @param {string} start - .
 * @param {string} end - .
 * @param {string} type - .
 * @return {object} Formated date.
 */
export default function formatDateForDashboardTitle(start, end, type, timePeriod, globalDate, duration) {
  const startDate = moment(start).startOf('day')
  const endDate = moment(end).endOf('day').valueOf()
  const endOfToday = moment().endOf('day').valueOf()

  // Date
  if (type === 'date') {
    // Same yaer
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

  // Period
  if (type === 'period') {
    // Calendar Preset
    if (timePeriod) {
      let difference = ''

      switch (timePeriod) {
        case 'isoweek':
          difference = moment(globalDate.end).diff(moment(startDate), 'week')
          switch (difference) {
            case 0: return `This week`
            case 1: return `Last week`
            // TODO: change dates
            // default: return `${moment(startDate).format('D MMM YY')} - ${moment(endDate).format('D MMM YY')}`
            default: return `${difference} weeks ago`
          }
        case 'month':
          difference = moment(globalDate.end).diff(moment(startDate), 'month')
          switch (difference) {
            case 0: return `This month`
            case 1: return `Last month`
            default: return moment(startDate).format('MMM Y')
          }
        case 'year':
          difference = moment(globalDate.end).diff(moment(startDate), 'year')
          switch (difference) {
            case 0: return `This year`
            default: return moment(startDate).format('Y')
          }
        case 'all':
          return moment(startDate).format('Y')
        default: return `No date`
      }
    }

    // Numbers
    if (!timePeriod) {
      // First period
      if (endDate === endOfToday) {
        return `Last ${duration} days`
      }

      // Other periods
      if (endDate !== endOfToday) {
        return `${duration} days`
      }
    }
  }
}
