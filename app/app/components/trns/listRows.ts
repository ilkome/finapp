import { civilDayStart } from '~~/utils/date/civil'

import type { TrnId, TrnItem } from '~/components/trns/types'

export type TrnsDisplayRow
  = | { date: number, id: string, trnsIds: TrnId[], type: 'dateHeader' }
    | { id: string, trnId: TrnId, type: 'transaction' }

export function buildTrnsDisplayRows(
  trnsIds: TrnId[],
  items: Record<TrnId, TrnItem> | null | undefined,
  options: { idPrefix?: string } = {},
): TrnsDisplayRow[] {
  const rows: TrnsDisplayRow[] = []
  const prefix = options.idPrefix ?? ''
  let currentDate: number | undefined
  let currentHeader: Extract<TrnsDisplayRow, { type: 'dateHeader' }> | undefined

  for (const trnId of trnsIds) {
    const trn = items?.[trnId]
    if (!trn)
      continue

    const date = civilDayStart(trn.date)
    if (date !== currentDate) {
      currentDate = date
      currentHeader = {
        date,
        id: `date:${prefix}${date}`,
        trnsIds: [],
        type: 'dateHeader',
      }
      rows.push(currentHeader)
    }

    currentHeader?.trnsIds.push(trnId)
    rows.push({
      id: `trn:${prefix}${trnId}`,
      trnId,
      type: 'transaction',
    })
  }

  return rows
}
