import { describe, expect, it } from 'vitest'

import type { WalletItemComputed } from '~/components/wallets/types'

import { filterWalletsByCurrency, filterWalletsByViewType } from '~/components/wallets/filters'

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
  archived: wallet({ amount: 0, currencyCode: 'USD', isArchived: true, type: 'cash' }),
  creditUSD: wallet({ amount: -100, creditLimit: 5000, currencyCode: 'USD', type: 'credit_card' }),
  cryptoBTC: wallet({ amount: 1, currencyCode: 'BTC', type: 'crypto' }),
  excludeUSD: wallet({ amount: 500, currencyCode: 'USD', isExcludedFromTotal: true, type: 'bank_account' }),
  mainRUB: wallet({ amount: 5000, currencyCode: 'RUB', type: 'bank_account' }),
  mainUSD: wallet({ amount: 1000, currencyCode: 'USD', type: 'bank_account' }),
  withdrawalUSD: wallet({ amount: 3000, currencyCode: 'USD', isWithdrawable: true, type: 'bank_account' }),
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

  it('isWithdrawable: returns withdrawal non-archived wallets', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'isWithdrawable')
    expect(result).toEqual(['withdrawalUSD'])
  })

  it('isWithdrawable: excludes archived withdrawal wallets', () => {
    const walletsWithArchivedWithdrawal = {
      ...wallets,
      archivedW: wallet({ amount: 0, currencyCode: 'USD', isArchived: true, isWithdrawable: true, type: 'bank_account' }),
    }
    const ids = Object.keys(walletsWithArchivedWithdrawal)
    const result = filterWalletsByViewType(ids, walletsWithArchivedWithdrawal, 'isWithdrawable')
    expect(result).not.toContain('archivedW')
  })

  it('isExcludedFromTotal: returns excluded wallets', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'isExcludedFromTotal')
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

  it('isAvailable counts cards only, isAvailableAll adds loans', () => {
    const withLoan = { ...wallets, loanUSD: wallet({ amount: -900, currencyCode: 'USD', type: 'loan' }) }
    const ids = Object.keys(withLoan)
    expect(filterWalletsByViewType(ids, withLoan, 'isAvailable')).not.toContain('loanUSD')
    expect(filterWalletsByViewType(ids, withLoan, 'isAvailableAll')).toContain('loanUSD')
    expect(filterWalletsByViewType(ids, withLoan, 'isAvailableAll')).toContain('creditUSD')
  })

  it('isAvailable: excludes archived credit wallets', () => {
    const walletsWithArchivedCredit = {
      ...wallets,
      archivedCredit: wallet({ amount: -50, creditLimit: 1000, currencyCode: 'USD', isArchived: true, type: 'credit_card' }),
    }
    const ids = Object.keys(walletsWithArchivedCredit)
    const result = filterWalletsByViewType(ids, walletsWithArchivedCredit, 'isAvailable')
    expect(result).not.toContain('archivedCredit')
  })

  it('cash: returns only non-archived cash wallets', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'cash')
    expect(result).toEqual([])
  })

  it('type filter excludes archived wallets', () => {
    const walletsWithActiveCash = {
      ...wallets,
      activeCash: wallet({ amount: 100, currencyCode: 'USD', type: 'cash' }),
    }
    const ids = Object.keys(walletsWithActiveCash)
    const result = filterWalletsByViewType(ids, walletsWithActiveCash, 'cash')
    expect(result).toContain('activeCash')
    expect(result).not.toContain('archived')
  })

  it('isExcludedFromTotal: lists archived ones too, matching the row sum', () => {
    const walletsWithArchivedExcluded = {
      ...wallets,
      archivedExcluded: wallet({ amount: 200, currencyCode: 'USD', isArchived: true, isExcludedFromTotal: true, type: 'bank_account' }),
    }
    const ids = Object.keys(walletsWithArchivedExcluded)
    const result = filterWalletsByViewType(ids, walletsWithArchivedExcluded, 'isExcludedFromTotal')
    expect(result).toContain('excludeUSD')
    expect(result).toContain('archivedExcluded')
  })

  it('bank_account: returns cashless wallets', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'bank_account')
    expect(result).toEqual(['excludeUSD', 'mainRUB', 'mainUSD', 'withdrawalUSD'])
  })

  it('credit: returns only credit wallets', () => {
    const result = filterWalletsByViewType(allIds, wallets, 'credit_card')
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
