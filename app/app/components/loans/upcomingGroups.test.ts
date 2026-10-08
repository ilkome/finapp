import { describe, expect, it } from 'vitest'

import { groupUpcoming } from '~/components/loans/upcomingGroups'

const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)
const today = day('2026-09-10')
const charge = (iso: string, amount = 100, currency = 'RUB') => ({ amount, currency, date: day(iso) })
// 1 USD = 90 RUB
const toBase = (amount: number, currency: string) => (currency === 'USD' ? amount * 90 : amount)

describe('groupUpcoming', () => {
  it('splits charges into overdue, nearest day, week, month and later, in that order', () => {
    const groups = groupUpcoming([
      charge('2026-12-01'),
      charge('2026-09-03'),
      charge('2026-09-11'),
      charge('2026-09-14'),
      charge('2026-09-17'),
      charge('2026-10-09'),
      charge('2026-10-10'),
    ], today, toBase)

    expect(groups.map(group => group.key)).toEqual(['overdue', 'nearest', 'week', 'month', 'later'])
    expect(groups.map(group => group.days.map(d => d.date))).toEqual([
      [day('2026-09-03')],
      [day('2026-09-11')],
      [day('2026-09-14')],
      [day('2026-09-17'), day('2026-10-09')],
      [day('2026-10-10'), day('2026-12-01')],
    ])
  })

  it('drops empty groups and treats today as the nearest day', () => {
    expect(groupUpcoming([charge('2026-09-10')], today, toBase).map(group => group.key)).toEqual(['nearest'])
    expect(groupUpcoming([], today, toBase)).toEqual([])
  })

  it('sums a day in the base currency only with two or more charges', () => {
    const [nearest, week] = groupUpcoming([
      charge('2026-09-12', 1000),
      charge('2026-09-12', 10, 'USD'),
      charge('2026-09-15', 500),
    ], today, toBase)

    expect(nearest!.days[0]!.sum).toBe(1900)
    expect(week!.days[0]!.sum).toBeNull()
  })
})
