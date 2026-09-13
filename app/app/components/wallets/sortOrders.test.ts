import { expect, it } from 'vitest'

import { applyStoredOrder, sortWalletGroups } from '~/components/wallets/grouping'

it('keeps stored order, drops stale keys, appends new ones', () => {
  expect(applyStoredOrder(['a', 'b', 'c', 'd'], ['c', 'x', 'a'])).toEqual(['c', 'a', 'b', 'd'])
  expect(applyStoredOrder(['a', 'b'], undefined)).toEqual(['a', 'b'])
})

it('orders primary groups, secondary groups and wallets by their own keys', () => {
  const groups = {
    cash: { groups: { RUB: ['r1', 'r2'], USD: ['u1'] }, ids: ['r1', 'r2', 'u1'] },
    credit: { groups: {}, ids: ['c1', 'c2'] },
  }
  const sorted = sortWalletGroups(groups, 'type', {
    'type': ['credit', 'cash'],
    'type/cash': ['USD', 'RUB'],
    'type/cash/RUB': ['r2', 'r1'],
    'type/credit': ['c2', 'c1'],
  })
  expect(Object.keys(sorted)).toEqual(['credit', 'cash'])
  expect(Object.keys(sorted.cash!.groups!)).toEqual(['USD', 'RUB'])
  expect(sorted.cash!.groups!.RUB).toEqual(['r2', 'r1'])
  expect(sorted.credit!.ids).toEqual(['c2', 'c1'])
})
