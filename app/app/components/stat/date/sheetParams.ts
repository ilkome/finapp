import type { Range } from '~~/utils/date/types'

import type { StatDateParams } from '~/components/stat/date/types'

import { calculateIntervalInRange } from '~/components/stat/date/params'

export const STAT_SHEET_PERIODS = 12
/** Periods shown after an older selection, so it sits near the middle with context on both sides. */
const PERIODS_AFTER_SELECTION = 5

/**
 * A stat sheet opened from a page turns the page's selected period into the chart's unit: the selected
 * interval when one is picked, otherwise the range itself (the interval for a max or custom range,
 * which has no fixed length). The chart shows the last periods, or the ones around an older selection.
 */
export function statSheetDateParams(params: StatDateParams, selection: Range, now: number): Partial<StatDateParams> {
  const isRangeUnit = params.intervalSelected < 0 && !params.isShowMaxRange && !params.customDate
  const granularityBy = isRangeUnit ? params.rangeBy : params.granularityBy
  const granularityDuration = Math.max(1, isRangeUnit ? params.rangeDuration : params.granularityDuration)

  // Periods between the current one and the one holding the selection's end.
  let back = 0
  const today = { end: now, start: now }
  while (calculateIntervalInRange({ granularityBy, granularityDuration, range: today, rangeOffset: back }).start > selection.end)
    back++

  const rangePanOffset = Math.max(0, back - PERIODS_AFTER_SELECTION)
  return {
    customDate: false,
    granularityBy,
    granularityDuration,
    intervalSelected: STAT_SHEET_PERIODS - 1 - (back - rangePanOffset),
    isShowMaxRange: false,
    isSkipEmpty: false,
    rangeBy: granularityBy,
    rangeDuration: granularityDuration * STAT_SHEET_PERIODS,
    rangeOffset: 0,
    rangePanOffset,
  }
}
