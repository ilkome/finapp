import { addCivilDays, addCivilMonths } from '~~/utils/date/civil'

import type { CurrencyCode } from '~/components/currencies/types'

type UpcomingGroupKey = 'later' | 'month' | 'nearest' | 'overdue' | 'week'

type UpcomingDay<T> = {
  date: number
  items: T[]
  /** Day total in the base currency; null for a single-charge day. */
  sum: number | null
}

type UpcomingGroup<T> = { days: UpcomingDay<T>[], key: UpcomingGroupKey }

/** Splits date-sorted charges into fixed periods; empty periods are dropped. */
export function groupUpcoming<T extends { amount: number, currency: CurrencyCode, date: number }>(
  items: T[],
  today: number,
  toBase: (amount: number, currencyCode: CurrencyCode) => number,
): UpcomingGroup<T>[] {
  const nearestDate = items.find(item => item.date >= today)?.date
  const weekEnd = addCivilDays(today, 7)
  const monthEnd = addCivilMonths(today, 1)

  function keyOf(date: number): UpcomingGroupKey {
    if (date < today)
      return 'overdue'
    if (date === nearestDate)
      return 'nearest'
    if (date < weekEnd)
      return 'week'
    return date < monthEnd ? 'month' : 'later'
  }

  const groups = new Map<UpcomingGroupKey, UpcomingGroup<T>>()
  for (const item of items) {
    const key = keyOf(item.date)
    const group = groups.get(key) ?? { days: [], key }
    groups.set(key, group)
    let day = group.days.at(-1)
    if (day?.date !== item.date) {
      day = { date: item.date, items: [], sum: null }
      group.days.push(day)
    }
    day.items.push(item)
  }

  const order: UpcomingGroupKey[] = ['overdue', 'nearest', 'week', 'month', 'later']
  return order.flatMap((key) => {
    const group = groups.get(key)
    if (!group)
      return []
    for (const day of group.days)
      day.sum = day.items.length > 1 ? day.items.reduce((total, item) => total + toBase(item.amount, item.currency), 0) : null
    return [group]
  })
}
