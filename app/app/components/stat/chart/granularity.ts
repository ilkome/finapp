import type { Period, Range } from '~~/utils/date/types'

import { differenceInDays } from 'date-fns'

export function availableGranularities(period: Period, range: Range): Period[] {
  const dayDiff = differenceInDays(range.end, range.start)

  return ([
    { isShow: period !== 'day' || dayDiff > 7, value: 'day' },
    { isShow: dayDiff >= 7, value: 'week' },
    { isShow: dayDiff >= 30, value: 'month' },
    { isShow: dayDiff >= 400, value: 'year' },
  ] satisfies { isShow: boolean, value: Period }[])
    .filter(i => i.isShow)
    .map(i => i.value)
}
