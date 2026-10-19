import { expect, it } from 'vitest'

import { buildWalletGroups, reorderInSlots } from '~/components/wallets/grouping'

it('reorders only the moved ids, inside the slots they hold', () => {
  expect(reorderInSlots(['a', 'x', 'b', 'y', 'c'], ['c', 'a', 'b'])).toEqual(['c', 'x', 'a', 'y', 'b'])
  expect(reorderInSlots(['a', 'b'], [])).toEqual(['a', 'b'])
})

it('orders groups by their first wallet in the given order', () => {
  const wallets = {
    c1: { currencyCode: 'RUB', type: 'credit_card' },
    r1: { currencyCode: 'RUB', type: 'cash' },
    u1: { currencyCode: 'USD', type: 'cash' },
  } as any
  const groups = buildWalletGroups(['c1', 'u1', 'r1'], wallets, 'type', true) as any
  expect(Object.keys(groups)).toEqual(['credit_card', 'cash'])
  expect(Object.keys(groups.cash.groups)).toEqual(['USD', 'RUB'])
})
