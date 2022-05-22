import dayjs from 'dayjs'
import type { DateValueOf } from '~/components/date/types'
import type { TrnID, TrnItem } from '~/components/trns/types'

/**
 * Get the oldest Transaction date
 */
export function getOldestTrnDate(trnsItems: Record<TrnID, TrnItem>): DateValueOf {
  const startOfToday = dayjs().startOf('day').valueOf()
  const minDate = Math.min(...Object.values(trnsItems).map(trn => trn.date))
  return minDate || startOfToday
}
