import { civilDayStart } from '~~/utils/date/civil'

import type { HistoryBulkEdit, HistoryBulkEditResult } from '~/components/trns/history/types'
import type { TrnId, Trns } from '~/components/trns/types'

import { trnItemSchema, TrnType } from '~/components/trns/types'

export function buildHistoryBulkEdit({
  action,
  ids,
  isCategoryTransactible,
  isWalletSelectable,
  items,
  now = Date.now(),
}: {
  action: HistoryBulkEdit
  ids: TrnId[]
  isCategoryTransactible: (id: string) => boolean
  isWalletSelectable: (id: string) => boolean
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

    if (action.type === 'setWallet') {
      if (current.type === TrnType.Transfer) {
        result.ineligible.push({ id, reason: 'transfer' })
        continue
      }
      if (!isWalletSelectable(action.value)) {
        result.ineligible.push({ id, reason: 'invalidWallet' })
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
    else if (action.type === 'setCategory') {
      next = { ...current, categoryId: action.value, updatedAt: now } as typeof current
    }
    else {
      if (current.type === TrnType.Transfer)
        throw new Error(`Transfer ${id} cannot use a single wallet`)
      next = { ...current, updatedAt: now, walletId: action.value }
    }

    const isUnchanged = action.type === 'setDescription'
      ? current.desc === description
      : action.type === 'clearDescription'
        ? current.desc === undefined
        : action.type === 'setDate'
          ? current.date === action.value
          : action.type === 'setCategory'
            ? current.categoryId === action.value
            : current.type !== TrnType.Transfer && current.walletId === action.value

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
