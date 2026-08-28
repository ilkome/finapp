import type { Range } from '~~/utils/date/types'

import { sub } from 'date-fns'
import { getEndOf, getStartOf, toDuration } from '~~/utils/date/period'

import type { StatDateParams } from '~/components/stat/date/types'

/** The `count` periods immediately before the current range (e.g. "average over the last 3 months"). */
export function getPreviousPeriodsRange(params: Pick<StatDateParams, 'rangeBy' | 'rangeDuration'>, count: number, now: Date): Range {
  const untilDate = getEndOf(sub(now, toDuration(params.rangeBy, params.rangeDuration)), params.rangeBy)

  return {
    end: untilDate.getTime(),
    start: getStartOf(sub(untilDate, toDuration(params.rangeBy, (params.rangeDuration * count) - 1)), params.rangeBy).getTime(),
  }
}
