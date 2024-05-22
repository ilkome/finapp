import dayjs from 'dayjs'
import type { PeriodNameWithAll, PeriodNameWithoutAll } from '~/components/filter/useFilter'

export function formatDateByPeriod(date: number, periodNameWithAll: PeriodNameWithAll, names: any) {
  const periodNameWithoutAll: PeriodNameWithoutAll = periodNameWithAll === 'all' ? 'year' : periodNameWithAll

  const today = dayjs()
  let format = 'MMMM'

  const startDate = dayjs(date).startOf('week').format('D MMMM')
  const endDate = dayjs(date).endOf('week').format('D MMMM')

  switch (periodNameWithoutAll) {
    case 'day':
      today.isSame(date, 'year')
        ? (format = 'DD MMMM')
        : (format = 'DD MMMM YYYY')
      break

    case 'week':
      if (today.isSame(date, 'week'))
        return names.current
      else if (today.subtract(1, periodNameWithoutAll).isSame(date, 'week'))
        return names.last
      return `${startDate} - ${endDate}`

    case 'month':
      if (today.isSame(date, 'year')) {
        format = 'MMMM'
        break
      }
      format = 'MMMM YYYY'
      break

    case 'year':
      format = 'YYYY'
      break
  }

  return dayjs(date).format(format)
  // const fDate = dayjs(date).format(format)
  // return fDate[0].toUpperCase() + fDate.slice(1)
}

export function formatDateByPeriod2(date: number, periodName: PeriodNameWithoutAll, names: any) {
  const today = dayjs()
  let format = 'MMMM'

  const startDate = dayjs(date).startOf('week').format('DD.MM')
  const endDate = dayjs(date).endOf('week').format('DD.MM')

  switch (periodName) {
    case 'day':
      today.isSame(date, 'year')
        ? (format = 'DD MMMM')
        : (format = 'DD MMMM YYYY')
      break

    case 'week':
      if (today.isSame(date, 'week'))
        return names.current
      else if (today.subtract(1, periodName).isSame(date, 'week'))
        return names.last
      return `${startDate}-${endDate}`

    case 'month':
      if (today.isSame(date, 'year')) {
        format = 'MMM'
        break
      }
      format = 'MMM YYYY'
      break

    case 'year':
      format = 'YYYY'
      break
  }

  return dayjs(date).format(format)
}

export function getFormatForChart(periodName: PeriodNameWithAll) {
  switch (periodName) {
    case 'day':
      return 'D.MM'
    case 'week':
      return 'D.MM'
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

// export function getFromDate(periodName: PeriodNameWithAll, date: number) {
//   if (periodName === 'all')
//     return

//   const filterDate = dayjs(date)
//   const from = filterDate.startOf(periodName).valueOf()
//   const until = filterDate.endOf(periodName).valueOf()

//   return { from, until }
// }
