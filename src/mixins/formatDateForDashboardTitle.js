import moment from 'moment'
import date from 'date-fns'

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

  // Same day
  if (moment(startDate).endOf('day').valueOf() === moment(endDate).endOf('day').valueOf()) {
    // Today
    if (moment(startDate).endOf('day').valueOf() === endOfToday) {
      if (type === 'date') {
        return `${moment(startDate).format('D MMM')}`
      }
      return 'Today'
    }
    // Yestarday
    if (moment(startDate).endOf('day').valueOf() === moment(endOfToday).subtract(1, 'day').valueOf()) {
      if (type === 'date') {
        return 'Yestarday'
      }
      return `${moment(startDate).format('D MMM')}`
    }
  }

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
          difference = date.differenceInWeeks(globalDate.end, startDate)
          switch (difference) {
            case 0: return `This week`
            case 1: return `Last week`
            // TODO: change dates
            // default: return `${moment(startDate).format('D MMM YY')} - ${moment(endDate).format('D MMM YY')}`
            default: return `${difference} weeks ago`
          }
        case 'month':
          difference = date.differenceInMonths(globalDate.end, startDate)
          switch (difference) {
            case 0: return `This month`
            case 1: return `Last month`
            default: return moment(startDate).format('MMM Y')
          }
        case 'year':
          difference = date.differenceInCalendarYears(globalDate.end, startDate)
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
