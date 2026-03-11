import { describe, expect, it } from 'vitest'

import type { WalletItemComputed } from '~/components/wallets/types'

import { computeWalletCounts, sumWalletAmounts } from '~/components/wallets/counts'

const rates = { EUR: 0.96, RUB: 64.75, USD: 1 }

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

describe('computeWalletCounts', () => {
  it('returns zeros for empty wallet list', () => {
    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 0,
      walletIds: [],
      wallets: {},
    })

    expect(result.total!.value).toBe(0)
    expect(result.cash!.value).toBe(0)
    expect(result.credit!.value).toBe(0)
    expect(result.total!.isShow).toBe(true)
  })

  it('accumulates cash wallet into total', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currency: 'USD', type: 'cash' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 2,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.total!.value).toBe(1000)
    expect(result.cash!.value).toBe(1000)
  })

  it('excludes credit wallets from total', () => {
    const wallets = {
      w1: wallet({ amount: 500, currency: 'USD', type: 'cashless' }),
      w2: wallet({ amount: -200, creditLimit: 5000, currency: 'USD', type: 'credit' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 2,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    expect(result.total!.value).toBe(500)
    expect(result.credit!.value).toBe(-200)
  })

  it('puts isExcludeInTotal wallets into excludeInTotal, not total', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currency: 'USD', type: 'cash' }),
      w2: wallet({ amount: 300, currency: 'USD', isExcludeInTotal: true, type: 'cashless' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 2,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    expect(result.total!.value).toBe(1000)
    expect(result.excludeInTotal!.value).toBe(300)
    expect(result.excludeInTotal!.isShow).toBe(true)
  })

  it('computes available as withdrawal minus abs(credit)', () => {
    const wallets = {
      w1: wallet({ amount: 5000, currency: 'USD', isWithdrawal: true, type: 'cashless' }),
      w2: wallet({ amount: -1000, creditLimit: 5000, currency: 'USD', type: 'credit' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 2,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    expect(result.available!.value).toBe(4000)
    expect(result.withdrawal!.value).toBe(5000)
    expect(result.available!.isShow).toBe(true)
  })

  it('converts currencies to base rate', () => {
    const wallets = {
      w1: wallet({ amount: 6475, currency: 'RUB', type: 'cash' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 2,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.total!.value).toBe(100)
    expect(result.cash!.value).toBe(100)
  })

  it('converts creditPossible to base currency', () => {
    const wallets = {
      w1: wallet({ amount: -100, creditLimit: 6475, currency: 'RUB', type: 'credit' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 1,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.credit!.secondValue).toBe(100)
  })

  it('accumulates creditPossible from multiple credit wallets', () => {
    const wallets = {
      w1: wallet({ amount: -100, creditLimit: 5000, currency: 'USD', type: 'credit' }),
      w2: wallet({ amount: -200, creditLimit: 3000, currency: 'USD', type: 'credit' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 2,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    expect(result.credit!.secondValue).toBe(8000)
  })

  it('cash.isShow false when only 1 wallet exists', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currency: 'USD', type: 'cash' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 1,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.cash!.isShow).toBe(false)
  })

  it('cash.isShow false when sum is zero', () => {
    const wallets = {
      w1: wallet({ amount: 0, currency: 'USD', type: 'cash' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 5,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.cash!.isShow).toBe(false)
  })

  it('archived wallets tracked with isShow', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currency: 'USD', type: 'cash' }),
      w2: wallet({ amount: 500, currency: 'USD', isArchived: true, type: 'cashless' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 2,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    expect(result.archived!.value).toBe(500)
    expect(result.archived!.isShow).toBe(true)
  })

  it('archived.isShow false when no archived wallets', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currency: 'USD', type: 'cash' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 1,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.archived!.isShow).toBe(false)
  })

  it('skips missing wallets', () => {
    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 1,
      walletIds: ['nonexistent'],
      wallets: {},
    })

    expect(result.total!.value).toBe(0)
  })

  it('all wallet types accumulated correctly', () => {
    const wallets = {
      w1: wallet({ amount: 100, currency: 'USD', type: 'cash' }),
      w2: wallet({ amount: 200, currency: 'USD', type: 'cashless' }),
      w3: wallet({ amount: 300, currency: 'USD', type: 'crypto' }),
      w4: wallet({ amount: 400, currency: 'USD', type: 'deposit' }),
      w5: wallet({ amount: 500, currency: 'USD', type: 'debt' }),
      w6: wallet({ amount: -600, creditLimit: 10000, currency: 'USD', type: 'credit' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 6,
      walletIds: ['w1', 'w2', 'w3', 'w4', 'w5', 'w6'],
      wallets,
    })

    expect(result.cash!.value).toBe(100)
    expect(result.cashless!.value).toBe(200)
    expect(result.crypto!.value).toBe(300)
    expect(result.deposit!.value).toBe(400)
    expect(result.debt!.value).toBe(500)
    expect(result.credit!.value).toBe(-600)
    expect(result.credit!.secondValue).toBe(10000)
    // total = 100+200+300+400+500 = 1500 (credit excluded)
    expect(result.total!.value).toBe(1500)
  })

  it('isExcludeInTotal credit wallet goes to excludeInTotal, not credit or total', () => {
    const wallets = {
      w1: wallet({ amount: -300, creditLimit: 5000, currency: 'USD', isExcludeInTotal: true, type: 'credit' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 1,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.excludeInTotal!.value).toBe(-300)
    expect(result.total!.value).toBe(0)
    expect(result.credit!.value).toBe(-300)
  })

  it('withdrawal wallet with negative amount', () => {
    const wallets = {
      w1: wallet({ amount: -500, currency: 'USD', isWithdrawal: true, type: 'cashless' }),
      w2: wallet({ amount: -1000, creditLimit: 5000, currency: 'USD', type: 'credit' }),
    }

    const result = computeWalletCounts({
      baseCurrency: 'USD',
      rates,
      totalWalletsCount: 2,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    // available = withdrawal - |credit| = -500 - 1000 = -1500
    expect(result.available!.value).toBe(-1500)
  })
})

describe('sumWalletAmounts', () => {
  it('sums with currency conversion', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currency: 'USD', type: 'cash' }),
      w2: wallet({ amount: 6475, currency: 'RUB', type: 'cashless' }),
    }

    const result = sumWalletAmounts({
      baseCurrency: 'USD',
      convert: true,
      rates,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    // 1000 + 6475/64.75 = 1100
    expect(result).toBe(1100)
  })

  it('sums without conversion, excludes isExcludeInTotal', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currency: 'USD', type: 'cash' }),
      w2: wallet({ amount: 500, currency: 'USD', isExcludeInTotal: true, type: 'cashless' }),
    }

    const result = sumWalletAmounts({
      convert: false,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    expect(result).toBe(1000)
  })

  it('includes isExcludeInTotal when converting', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currency: 'USD', type: 'cash' }),
      w2: wallet({ amount: 500, currency: 'USD', isExcludeInTotal: true, type: 'cashless' }),
    }

    const result = sumWalletAmounts({
      baseCurrency: 'USD',
      convert: true,
      rates,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    expect(result).toBe(1500)
  })

  it('skips missing wallets', () => {
    const result = sumWalletAmounts({
      baseCurrency: 'USD',
      convert: true,
      rates,
      walletIds: ['nonexistent'],
      wallets: {},
    })

    expect(result).toBe(0)
  })

  it('defaults to convert=true', () => {
    const wallets = {
      w1: wallet({ amount: 6475, currency: 'RUB', type: 'cash' }),
    }

    const result = sumWalletAmounts({
      baseCurrency: 'USD',
      rates,
      walletIds: ['w1'],
      wallets,
    })

    expect(result).toBe(100)
  })
})
