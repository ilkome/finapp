import { describe, expect, it } from 'vitest'

import type { WalletsToggleMap } from '~/components/wallets/grouping'
import type { WalletItemComputed } from '~/components/wallets/types'

import { applyToggle, applyToggleAll, buildWalletGroups, computeToggleStatus, groupWalletsByProperty } from '~/components/wallets/grouping'

function wallet(overrides: Partial<WalletItemComputed> & Pick<WalletItemComputed, 'amount' | 'currencyCode' | 'type'>): WalletItemComputed {
  return {
    color: 'blue',
    description: '',
    isArchived: false,
    isExcludedFromTotal: false,
    isWithdrawable: false,
    name: 'Test',
    sortOrder: 0,
    updatedAt: 0,
    ...overrides,
  } as WalletItemComputed
}

const wallets = {
  cardRUB: wallet({ amount: 3000, currencyCode: 'RUB', type: 'bank_account' }),
  cardUSD: wallet({ amount: 500, currencyCode: 'USD', type: 'bank_account' }),
  cashRUB: wallet({ amount: 5000, currencyCode: 'RUB', type: 'cash' }),
  cashUSD: wallet({ amount: 100, currencyCode: 'USD', type: 'cash' }),
  creditUSD: wallet({ amount: -200, creditLimit: 5000, currencyCode: 'USD', type: 'credit_card' }),
} as Record<string, WalletItemComputed>

const allIds = Object.keys(wallets)

describe('groupWalletsByProperty', () => {
  it('groups by type', () => {
    const result = groupWalletsByProperty(allIds, wallets, 'type')
    expect(Object.keys(result).sort()).toEqual(['bank_account', 'cash', 'credit_card'])
    expect(result.bank_account).toEqual(['cardRUB', 'cardUSD'])
    expect(result.cash).toEqual(['cashRUB', 'cashUSD'])
    expect(result.credit_card).toEqual(['creditUSD'])
  })

  it('groups by currency', () => {
    const result = groupWalletsByProperty(allIds, wallets, 'currencyCode')
    expect(Object.keys(result).sort()).toEqual(['RUB', 'USD'])
    expect(result.RUB).toEqual(['cardRUB', 'cashRUB'])
    expect(result.USD).toEqual(['cardUSD', 'cashUSD', 'creditUSD'])
  })

  it('handles missing wallet IDs gracefully', () => {
    const result = groupWalletsByProperty(['missing', 'cashUSD'], wallets, 'type')
    expect(result['']).toEqual(['missing'])
    expect(result.cash).toEqual(['cashUSD'])
  })

  it('returns empty groups for empty IDs', () => {
    const result = groupWalletsByProperty([], wallets, 'type')
    expect(Object.keys(result)).toEqual([])
  })
})

describe('buildWalletGroups', () => {
  it('returns false for groupedBy "none"', () => {
    expect(buildWalletGroups(allIds, wallets, 'none', false)).toBe(false)
  })

  it('moves archived wallets into a trailing archived group by type', () => {
    const withArchived = { ...wallets, oldCash: wallet({ amount: 1, currencyCode: 'RUB', isArchived: true, type: 'cash' }) }
    const result = buildWalletGroups([...allIds, 'oldCash'], withArchived, 'type', true)
    if (!result)
      throw new Error('expected groups')

    expect(result.cash!.ids).not.toContain('oldCash')
    expect(result.isArchived!.ids).toEqual(['oldCash'])
    expect(Object.keys(result).at(-1)).toBe('isArchived')
    expect(buildWalletGroups([...allIds, 'oldCash'], withArchived, 'currency', false)).not.toHaveProperty('isArchived')
  })

  it('moves excluded-from-total wallets into their own group before archived', () => {
    const withFlags = {
      ...wallets,
      hidden: wallet({ amount: 1, currencyCode: 'RUB', isExcludedFromTotal: true, type: 'cash' }),
      oldHidden: wallet({ amount: 1, currencyCode: 'RUB', isArchived: true, isExcludedFromTotal: true, type: 'cash' }),
    }
    const result = buildWalletGroups([...allIds, 'hidden', 'oldHidden'], withFlags, 'type', false)
    if (!result)
      throw new Error('expected groups')

    expect(result.isExcludedFromTotal!.ids).toEqual(['hidden', 'oldHidden'])
    expect(result).not.toHaveProperty('isArchived')
  })

  it('builds primary groups by type', () => {
    const result = buildWalletGroups(allIds, wallets, 'type', false)
    expect(result).not.toBe(false)
    if (!result)
      return

    expect(result.bank_account!.ids).toEqual(['cardRUB', 'cardUSD'])
    expect(result.cash!.ids).toEqual(['cashRUB', 'cashUSD'])
    expect(result.cash!.groups).toEqual({})
  })

  it('builds primary groups by currency', () => {
    const result = buildWalletGroups(allIds, wallets, 'currency', false)
    if (!result)
      return

    expect(result.RUB!.ids).toEqual(['cardRUB', 'cashRUB'])
    expect(result.USD!.ids).toEqual(['cardUSD', 'cashUSD', 'creditUSD'])
  })

  it('builds secondary groups: type → currency', () => {
    const result = buildWalletGroups(allIds, wallets, 'type', true)
    if (!result)
      return

    expect(result.cash!.groups).toBeDefined()
    expect(result.cash!.groups!.RUB).toEqual(['cashRUB'])
    expect(result.cash!.groups!.USD).toEqual(['cashUSD'])
  })

  it('builds secondary groups: currency → type', () => {
    const result = buildWalletGroups(allIds, wallets, 'currency', true)
    if (!result)
      return

    expect(result.USD!.groups!.cash).toEqual(['cashUSD'])
    expect(result.USD!.groups!.bank_account).toEqual(['cardUSD'])
    expect(result.USD!.groups!.credit_card).toEqual(['creditUSD'])
  })
})

describe('computeToggleStatus', () => {
  it('returns all false for groupedBy "none"', () => {
    const result = computeToggleStatus({}, 'none')
    expect(result).toEqual({
      isAllOpen: false,
      isAllOpenInside: false,
      isAnyOpen: false,
      isAnyOpenInside: false,
    })
  })

  it('returns all false for empty toggle map', () => {
    const result = computeToggleStatus({}, 'type')
    expect(result.isAllOpen).toBe(false)
    expect(result.isAnyOpen).toBe(false)
  })

  it('detects all open', () => {
    const map: WalletsToggleMap = {
      type: {
        cash: { show: true },
        cashless: { show: true },
      },
    }
    const result = computeToggleStatus(map, 'type')
    expect(result.isAllOpen).toBe(true)
    expect(result.isAnyOpen).toBe(true)
  })

  it('detects some open', () => {
    const map: WalletsToggleMap = {
      type: {
        cash: { show: true },
        cashless: { show: false },
      },
    }
    const result = computeToggleStatus(map, 'type')
    expect(result.isAllOpen).toBe(false)
    expect(result.isAnyOpen).toBe(true)
  })

  it('detects secondary groups open', () => {
    const map: WalletsToggleMap = {
      type: {
        cash: { groups: { RUB: true, USD: true }, show: true },
      },
    }
    const result = computeToggleStatus(map, 'type')
    expect(result.isAllOpenInside).toBe(true)
    expect(result.isAnyOpenInside).toBe(true)
  })
})

describe('applyToggle', () => {
  it('toggles primary group from undefined to false', () => {
    const result = applyToggle({}, 'type', 'cash')
    expect(result.type!.cash!.show).toBe(false)
  })

  it('toggles primary group from false to true', () => {
    const map: WalletsToggleMap = { type: { cash: { show: false } } }
    const result = applyToggle(map, 'type', 'cash')
    expect(result.type!.cash!.show).toBe(true)
  })

  it('toggles secondary group from undefined to false', () => {
    const result = applyToggle({}, 'type', 'cash', 'RUB')
    expect(result.type!.cash!.groups!.RUB).toBe(false)
  })

  it('toggles secondary group from false to true', () => {
    const map: WalletsToggleMap = { type: { cash: { groups: { RUB: false } } } }
    const result = applyToggle(map, 'type', 'cash', 'RUB')
    expect(result.type!.cash!.groups!.RUB).toBe(true)
  })

  it('does nothing for groupedBy "none"', () => {
    const map: WalletsToggleMap = {}
    const result = applyToggle(map, 'none', 'cash')
    expect(result).toEqual({})
  })
})

describe('applyToggleAll', () => {
  const grouped = {
    bank_account: { groups: { RUB: ['cardRUB'], USD: ['cardUSD'] }, ids: ['cardRUB', 'cardUSD'] },
    cash: { groups: { RUB: ['cashRUB'], USD: ['cashUSD'] }, ids: ['cashRUB', 'cashUSD'] },
  }

  it('opens all primary groups when none are open', () => {
    const status = { isAllOpen: false, isAllOpenInside: false, isAnyOpen: false, isAnyOpenInside: false }
    const result = applyToggleAll({}, 'type', grouped, false, status)

    expect(result.type!.cash!.show).toBe(true)
    expect(result.type!.bank_account!.show).toBe(true)
  })

  it('closes all primary groups when all are open', () => {
    const map: WalletsToggleMap = {
      type: {
        cash: { show: true },
        cashless: { show: true },
      },
    }
    const status = { isAllOpen: true, isAllOpenInside: false, isAnyOpen: true, isAnyOpenInside: false }
    const result = applyToggleAll(map, 'type', grouped, false, status)

    expect(result.type!.cash!.show).toBe(false)
    expect(result.type!.bank_account!.show).toBe(false)
  })

  it('with secondary: opens secondary when primary already open', () => {
    const map: WalletsToggleMap = {
      type: {
        cash: { groups: { RUB: false, USD: false }, show: true },
        cashless: { groups: { RUB: false, USD: false }, show: true },
      },
    }
    const status = { isAllOpen: true, isAllOpenInside: false, isAnyOpen: true, isAnyOpenInside: false }
    const result = applyToggleAll(map, 'type', grouped, true, status)

    expect(result.type!.cash!.groups!.RUB).toBe(true)
    expect(result.type!.cash!.groups!.USD).toBe(true)
    expect(result.type!.bank_account!.groups!.RUB).toBe(true)
  })

  it('with secondary: closes everything when all open', () => {
    const map: WalletsToggleMap = {
      type: {
        cash: { groups: { RUB: true, USD: true }, show: true },
        cashless: { groups: { RUB: true, USD: true }, show: true },
      },
    }
    const status = { isAllOpen: true, isAllOpenInside: true, isAnyOpen: true, isAnyOpenInside: true }
    const result = applyToggleAll(map, 'type', grouped, true, status)

    expect(result.type!.cash!.show).toBe(false)
    expect(result.type!.cash!.groups!.RUB).toBe(false)
    expect(result.type!.bank_account!.show).toBe(false)
  })

  it('does nothing for groupedBy "none"', () => {
    const result = applyToggleAll({}, 'none', grouped, false, {
      isAllOpen: false,
      isAllOpenInside: false,
      isAnyOpen: false,
      isAnyOpenInside: false,
    })
    expect(result).toEqual({})
  })
})
