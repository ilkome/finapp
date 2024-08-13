import dayjs from 'dayjs'
import type { Period, Range } from '~/components/date/types'

export const periods = ['day', 'week', 'month', 'year'] as const

// export function getIntervalDates(r: Range, period: Period) {
//   const dates = []
//   let current = dayjs(r.start).startOf(period)
//   const end = dayjs(r.end).endOf(period)

//   while (current.isBefore(end) || current.isSame(end)) {
//     dates.push(dayjs(current).startOf(period).valueOf())
//     current = current.add(1, period)
//   }

//   return dates
// }

// export function getRangeFromNow(pd: RangeGrouped): Range {
//   return {
//     end: dayjs().endOf(pd.period).valueOf(),
//     start: dayjs()
//       .subtract(pd.count === 1 ? 0 : pd.count - 1, pd.period)
//       .startOf(pd.period)
//       .valueOf(),
//   }
// }

// export function getRangeFromInterval(pd: any): Range {
//   return {
//     end: dayjs().endOf(pd.period).valueOf(),
//     start: dayjs()
//       .subtract(pd.count === 1 ? 0 : pd.count - 1, pd.period)
//       .startOf(pd.period)
//       .valueOf(),
//   }
// }
