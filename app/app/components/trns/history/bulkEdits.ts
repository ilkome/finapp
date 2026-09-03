import { civilDayStart } from '~~/utils/date/civil'

import type { HistoryBulkEdit, HistoryBulkEditResult } from '~/components/trns/history/types'
import type { TrnId, Trns } from '~/components/trns/types'

import { trnItemSchema, TrnType } from '~/components/trns/types'

export function buildHistoryBulkEdit({
  action,
  ids,
  isCategoryTransactible,
  items,
  now = Date.now(),
}: {
  action: HistoryBulkEdit
  ids: TrnId[]
  isCategoryTransactible: (id: string) => boolean
  items: Trns
  now?: number
}): HistoryBulkEditResult {
  const result: HistoryBulkEditResult = {
    changedIds: [],
    ineligible: [],
    unchangedIds: [],
    values: {},
  }

  const description = action.type === 'setDescription' ? action.value.trim() : undefined
  if (action.type === 'setDescription' && !description)
    throw new Error('Description must not be empty')
  if (action.type === 'setDate' && (!Number.isFinite(action.value) || civilDayStart(action.value) !== action.value))
    throw new Error('Date must be a civil day')

  for (const id of [...new Set(ids)]) {
    const current = items[id]
    if (!current)
      continue

    if (action.type === 'setCategory') {
      if (current.type === TrnType.Transfer || current.categoryId === 'transfer') {
        result.ineligible.push({ id, reason: 'transfer' })
        continue
      }
      if (!isCategoryTransactible(action.value) || action.value === 'transfer') {
        result.ineligible.push({ id, reason: 'invalidCategory' })
        continue
      }
    }

    let next = current
    if (action.type === 'setDescription') {
      next = { ...current, desc: description, updatedAt: now }
    }
    else if (action.type === 'clearDescription') {
      const { desc: _desc, ...withoutDescription } = current
      next = { ...withoutDescription, updatedAt: now }
    }
    else if (action.type === 'setDate') {
      next = { ...current, date: action.value, updatedAt: now }
    }
    else {
      next = { ...current, categoryId: action.value, updatedAt: now } as typeof current
    }

    const isUnchanged = action.type === 'setDescription'
      ? current.desc === description
      : action.type === 'clearDescription'
        ? current.desc === undefined
        : action.type === 'setDate'
          ? current.date === action.value
          : current.categoryId === action.value

    if (isUnchanged) {
      result.unchangedIds.push(id)
      continue
    }

    const parsed = trnItemSchema.safeParse(next)
    if (!parsed.success)
      throw new Error(`Invalid transaction ${id}`)

    result.values[id] = parsed.data
    result.changedIds.push(id)
  }

  return result
}
