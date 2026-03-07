import { describe, expect, it } from 'vitest'

import type { WalletItemComputed } from '~/components/wallets/types'

import { filterWalletsByCurrency, filterWalletsByViewType } from '~/components/wallets/filters'

function wallet(overrides: Partial<WalletItemComputed> & Pick<WalletItemComputed, 'amount' | 'currency' | 'type'>): WalletItemComputed {
  return {
    color: 'blue',
    desc: '',
    isArchived: false,
    isExcludeInTotal: false,
    isWithdrawal: false,
    name: 'Test',
    order: 0,
    updatedAt: 0,
    ...overrides,
  } as WalletItemComputed
}

const wallets = {
  archived: wallet({ amount: 0, currency: 'USD', isArchived: true, type: 'cash' }),
  creditUSD: wallet({ amount: -100, creditLimit: 5000, currency: 'USD', type: 'credit' }),
  cryptoBTC: wallet({ amount: 1, currency: 'BTC', type: 'crypto' }),
  excludeUSD: wallet({ amount: 500, currency: 'USD', isExcludeInTotal: true, type: 'cashless' }),
  mainRUB: wallet({ amount: 5000, currency: 'RUB', type: 'cashless' }),
  mainUSD: wallet({ amount: 1000, currency: 'USD', type: 'cashless' }),
  withdrawalUSD: wallet({ amount: 3000, currency: 'USD', isWithdrawal: true, type: 'cashless' }),
} as Record<string, WalletItemComputed>

const allIds = Object.keys(wallets)

describe('filterWalletsByCurrency', () => {
  it('returns all wallets when currencyFilter is "all"', () => {
    const result = filterWalletsByCurrency(wallets, 'type', 'all')
    expect(result).toEqual(allIds)
  })

  it('returns all wallets when groupedBy is "currency"', () => {
    const result = filterWalletsByCurrency(wallets, 'currency', 'USD')
    expect(result).toEqual(allIds)
  })

  it('filters by specific currency', () => {
    const result = filterWalletsByCurrency(wallets, 'type', 'USD')
    expect(result).toEqual(['archived', 'creditUSD', 'excludeUSD', 'mainUSD', 'withdrawalUSD'])
  })

  it('filters by RUB', () => {
    const result = filterWalletsByCurrency(wallets, 'type', 'RUB')
    expect(result).toEqual(['mainRUB'])
  })

  it('returns empty for currency with no wallets', () => {
    const result = filterWalletsByCurrency(wallets, 'type', 'EUR')
    expect(result).toEqual([])
  })

  it('returns all when groupedBy is "none"', () => {
    const result = filterWalletsByCurrency(wallets, 'none', 'all')
    expect(result).toEqual(allIds)
  })
})

describe('filterWalletsByViewType', () => {
  it('total: excludes archived', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'total')
    expect(result).not.toContain('archived')
    expect(result).toContain('mainUSD')
    expect(result).toContain('creditUSD')
    expect(result).toContain('excludeUSD')
  })

  it('isWithdrawal: returns withdrawal non-archived wallets', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'isWithdrawal')
    expect(result).toEqual(['withdrawalUSD'])
  })

  it('isWithdrawal: excludes archived withdrawal wallets', () => {
    const walletsWithArchivedWithdrawal = {
      ...wallets,
      archivedW: wallet({ amount: 0, currency: 'USD', isArchived: true, isWithdrawal: true, type: 'cashless' }),
    }
    const ids = Object.keys(walletsWithArchivedWithdrawal)
    const result = filterWalletsByViewType(ids, walletsWithArchivedWithdrawal, 'isWithdrawal')
    expect(result).not.toContain('archivedW')
  })

  it('isExcludeInTotal: returns excluded wallets', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'isExcludeInTotal')
    expect(result).toEqual(['excludeUSD'])
  })

  it('isArchived: returns only archived wallets', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'isArchived')
    expect(result).toEqual(['archived'])
  })

  it('isAvailable: returns credit and withdrawal, excludes archived', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'isAvailable')
    expect(result).toContain('creditUSD')
    expect(result).toContain('withdrawalUSD')
    expect(result).not.toContain('mainUSD')
    expect(result).not.toContain('archived')
  })

  it('isAvailable: excludes archived credit wallets', () => {
    const walletsWithArchivedCredit = {
      ...wallets,
      archivedCredit: wallet({ amount: -50, creditLimit: 1000, currency: 'USD', isArchived: true, type: 'credit' }),
    }
    const ids = Object.keys(walletsWithArchivedCredit)
    const result = filterWalletsByViewType(ids, walletsWithArchivedCredit, 'isAvailable')
    expect(result).not.toContain('archivedCredit')
  })

  it('cash: returns only cash wallets', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'cash')
    expect(result).toEqual(['archived'])
  })

  it('cashless: returns cashless wallets', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'cashless')
    expect(result).toEqual(['excludeUSD', 'mainRUB', 'mainUSD', 'withdrawalUSD'])
  })

  it('credit: returns only credit wallets', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'credit')
    expect(result).toEqual(['creditUSD'])
  })

  it('crypto: returns only crypto wallets', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'crypto')
    expect(result).toEqual(['cryptoBTC'])
  })

  it('skips missing wallet IDs', () => {
    const result = filterWalletsByViewType(['nonexistent', 'mainUSD'], wallets, 'total')
    expect(result).toEqual(['mainUSD'])
  })
})
