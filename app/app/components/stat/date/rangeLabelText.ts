import type { Range } from '~~/utils/date/types'

import { createRangeFormatter } from '~~/utils/date/labels'

import type { LocaleSlug } from '~/components/locale/types'
import type { StatDateParams } from '~/components/stat/date/types'

type RangeLabelInput = {
  intervalsInRange: Range[]
  params: StatDateParams
  range: Range
}

/** The range shown in the label: the selected interval when there is one, the whole range otherwise. */
export function labelRange({ intervalsInRange, params, range }: RangeLabelInput): Range {
  return (params.intervalSelected !== -1 && intervalsInRange[params.intervalSelected]) || range
}

export function statDateRangeLabel(
  input: RangeLabelInput,
  t: (key: string, choice?: number) => string,
  locale?: LocaleSlug,
): string {
  const { intervalsInRange, params } = input
  const { formatRangeExact, formatRangeWithLast } = createRangeFormatter(t, locale)
  const range = labelRange(input)

  // A panned range is an arbitrary window: it has no "last N months" reading.
  if (params.rangePanOffset !== 0) {
    return formatRangeExact({
      by: params.granularityBy,
      duration: intervalsInRange.length,
      end: new Date(range.end),
      start: new Date(range.start),
    })
  }

  const isIntervalSelected = params.intervalSelected !== -1
  if (params.isShowMaxRange && !isIntervalSelected)
    return t('dates.ranges.allTime')

  return formatRangeWithLast({
    by: isIntervalSelected ? params.granularityBy : params.rangeBy,
    duration: isIntervalSelected ? params.granularityDuration : params.rangeDuration,
    end: new Date(range.end),
    start: new Date(range.start),
  })
}
