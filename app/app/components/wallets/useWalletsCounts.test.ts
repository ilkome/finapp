import { describe, expect, it } from 'vitest'

import type { WalletItemComputed } from '~/components/wallets/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { computeWalletCounts, sumWalletsInBase, sumWalletsInOwnCurrency } from '~/components/wallets/counts'

const rates = { EUR: 0.96, RUB: 64.75, USD: 1 }
const toBaseIn = (base: string) => (amount: number, currency: string) => getAmountInRate(amount, currency, base, rates)

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

describe('computeWalletCounts', () => {
  it('returns zeros for empty wallet list', () => {
    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 0,
      walletIds: [],
      wallets: {},
    })

    expect(result.total!.value).toBe(0)
    expect(result.cash!.value).toBe(0)
    expect(result.credit_card!.value).toBe(0)
    expect(result.total!.isShow).toBe(true)
  })

  it('accumulates cash wallet into total', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currencyCode: 'USD', type: 'cash' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 2,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.total!.value).toBe(1000)
    expect(result.cash!.value).toBe(1000)
  })

  it('excludes credit wallets from total', () => {
    const wallets = {
      w1: wallet({ amount: 500, currencyCode: 'USD', type: 'bank_account' }),
      w2: wallet({ amount: -200, creditLimit: 5000, currencyCode: 'USD', type: 'credit_card' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 2,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    expect(result.total!.value).toBe(500)
    expect(result.credit_card!.value).toBe(-200)
  })

  it('puts isExcludedFromTotal wallets into excludeInTotal, not total', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currencyCode: 'USD', type: 'cash' }),
      w2: wallet({ amount: 300, currencyCode: 'USD', isExcludedFromTotal: true, type: 'bank_account' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 2,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    expect(result.total!.value).toBe(1000)
    expect(result.excludeInTotal!.value).toBe(300)
    expect(result.excludeInTotal!.isShow).toBe(true)
  })

  it('computes available as withdrawal plus the credit balance', () => {
    const wallets = {
      w1: wallet({ amount: 5000, currencyCode: 'USD', isWithdrawable: true, type: 'bank_account' }),
      w2: wallet({ amount: -1000, creditLimit: 5000, currencyCode: 'USD', type: 'credit_card' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 2,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    expect(result.available!.value).toBe(4000)
    expect(result.withdrawal!.value).toBe(5000)
    expect(result.available!.isShow).toBe(true)
  })

  it('an overpaid credit card adds to available instead of subtracting', () => {
    const wallets = {
      w1: wallet({ amount: 5000, currencyCode: 'USD', isWithdrawable: true, type: 'bank_account' }),
      w2: wallet({ amount: 200, creditLimit: 5000, currencyCode: 'USD', type: 'credit_card' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 2,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    expect(result.available!.value).toBe(5200)
  })

  it('converts currencies to base rate', () => {
    const wallets = {
      w1: wallet({ amount: 6475, currencyCode: 'RUB', type: 'cash' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 2,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.total!.value).toBe(100)
    expect(result.cash!.value).toBe(100)
  })

  it('converts creditPossible to base currency', () => {
    const wallets = {
      w1: wallet({ amount: -100, creditLimit: 6475, currencyCode: 'RUB', type: 'credit_card' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 1,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.credit_card!.secondValue).toBe(100)
  })

  it('accumulates creditPossible from multiple credit wallets', () => {
    const wallets = {
      w1: wallet({ amount: -100, creditLimit: 5000, currencyCode: 'USD', type: 'credit_card' }),
      w2: wallet({ amount: -200, creditLimit: 3000, currencyCode: 'USD', type: 'credit_card' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 2,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    expect(result.credit_card!.secondValue).toBe(8000)
  })

  it('available hidden when no credit wallets', () => {
    const wallets = {
      w1: wallet({ amount: 5000, currencyCode: 'USD', isWithdrawable: true, type: 'bank_account' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 1,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.available!.isShow).toBe(false)
  })

  it('cash.isShow false when only 1 wallet exists', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currencyCode: 'USD', type: 'cash' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 1,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.cash!.isShow).toBe(false)
  })

  it('cash.isShow false when sum is zero', () => {
    const wallets = {
      w1: wallet({ amount: 0, currencyCode: 'USD', type: 'cash' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 5,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.cash!.isShow).toBe(false)
  })

  it('archived wallets excluded from total and type sums', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currencyCode: 'USD', type: 'cash' }),
      w2: wallet({ amount: 500, currencyCode: 'USD', isArchived: true, type: 'bank_account' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 2,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    expect(result.archived!.value).toBe(500)
    expect(result.archived!.isShow).toBe(true)
    expect(result.total!.value).toBe(1000)
    expect(result.bank_account!.value).toBe(0)
  })

  it('archived wallets excluded from withdrawal and available', () => {
    const wallets = {
      w1: wallet({ amount: 3000, currencyCode: 'USD', isWithdrawable: true, type: 'bank_account' }),
      w2: wallet({ amount: 1000, currencyCode: 'USD', isArchived: true, isWithdrawable: true, type: 'bank_account' }),
      w3: wallet({ amount: -500, creditLimit: 5000, currencyCode: 'USD', type: 'credit_card' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 3,
      walletIds: ['w1', 'w2', 'w3'],
      wallets,
    })

    expect(result.withdrawal!.value).toBe(3000)
    expect(result.available!.value).toBe(2500)
  })

  it('archived.isShow false when no archived wallets', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currencyCode: 'USD', type: 'cash' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 1,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.archived!.isShow).toBe(false)
  })

  it('skips missing wallets', () => {
    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 1,
      walletIds: ['nonexistent'],
      wallets: {},
    })

    expect(result.total!.value).toBe(0)
  })

  it('all wallet types accumulated correctly', () => {
    const wallets = {
      w1: wallet({ amount: 100, currencyCode: 'USD', type: 'cash' }),
      w2: wallet({ amount: 200, currencyCode: 'USD', type: 'bank_account' }),
      w3: wallet({ amount: 300, currencyCode: 'USD', type: 'crypto' }),
      w4: wallet({ amount: 400, currencyCode: 'USD', type: 'deposit' }),
      w5: wallet({ amount: 500, currencyCode: 'USD', type: 'debt' }),
      w6: wallet({ amount: -600, creditLimit: 10000, currencyCode: 'USD', type: 'credit_card' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 6,
      walletIds: ['w1', 'w2', 'w3', 'w4', 'w5', 'w6'],
      wallets,
    })

    expect(result.cash!.value).toBe(100)
    expect(result.bank_account!.value).toBe(200)
    expect(result.crypto!.value).toBe(300)
    expect(result.deposit!.value).toBe(400)
    expect(result.debt!.value).toBe(500)
    expect(result.credit_card!.value).toBe(-600)
    expect(result.credit_card!.secondValue).toBe(10000)
    // total = 100+200+300+400+500 = 1500 (credit excluded)
    expect(result.total!.value).toBe(1500)
  })

  it('isExcludedFromTotal credit wallet goes to excludeInTotal, not credit or total', () => {
    const wallets = {
      w1: wallet({ amount: -300, creditLimit: 5000, currencyCode: 'USD', isExcludedFromTotal: true, type: 'credit_card' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 1,
      walletIds: ['w1'],
      wallets,
    })

    expect(result.excludeInTotal!.value).toBe(-300)
    expect(result.total!.value).toBe(0)
    expect(result.credit_card!.value).toBe(0)
  })

  it('includeExcludedInStats puts isExcludedFromTotal wallets back into total and type rows', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currencyCode: 'USD', type: 'cash' }),
      w2: wallet({ amount: 300, currencyCode: 'USD', isExcludedFromTotal: true, isWithdrawable: true, type: 'bank_account' }),
    }

    const params = { toBase: toBaseIn('USD'), totalWalletsCount: 2, walletIds: ['w1', 'w2'], wallets }

    const off = computeWalletCounts(params)
    expect(off.total!.value).toBe(1000)
    expect(off.bank_account!.value).toBe(0)
    expect(off.withdrawal!.value).toBe(0)
    expect(off.excludeInTotal!.value).toBe(300)

    const on = computeWalletCounts({ ...params, includeExcludedInStats: true })
    expect(on.total!.value).toBe(1300)
    expect(on.bank_account!.value).toBe(300)
    expect(on.withdrawal!.value).toBe(300)
    expect(on.excludeInTotal!.value).toBe(300)
  })

  it('a wallet that is both archived and excluded lands in both slices', () => {
    const wallets = {
      w1: wallet({ amount: 500, currencyCode: 'USD', isArchived: true, isExcludedFromTotal: true, type: 'cash' }),
    }

    const params = { toBase: toBaseIn('USD'), totalWalletsCount: 1, walletIds: ['w1'], wallets }

    const off = computeWalletCounts(params)
    expect(off.archived!.value).toBe(500)
    expect(off.excludeInTotal!.value).toBe(500)
    expect(off.total!.value).toBe(0)
    expect(off.cash!.value).toBe(0)

    // Either switch brings it in.
    expect(computeWalletCounts({ ...params, includeArchivedInStats: true }).total!.value).toBe(500)
    expect(computeWalletCounts({ ...params, includeExcludedInStats: true }).total!.value).toBe(500)

    const both = computeWalletCounts({ ...params, includeArchivedInStats: true, includeExcludedInStats: true })
    expect(both.total!.value).toBe(500)
    expect(both.cash!.value).toBe(500)
  })

  it('withdrawal wallet with negative amount', () => {
    const wallets = {
      w1: wallet({ amount: -500, currencyCode: 'USD', isWithdrawable: true, type: 'bank_account' }),
      w2: wallet({ amount: -1000, creditLimit: 5000, currencyCode: 'USD', type: 'credit_card' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 2,
      walletIds: ['w1', 'w2'],
      wallets,
    })

    // available = withdrawal - |credit| = -500 - 1000 = -1500
    expect(result.available!.value).toBe(-1500)
  })

  it('keeps loans apart from credit cards, out of the total, and counts each debt once in available', () => {
    const wallets = {
      card: wallet({ amount: -300, creditLimit: 1000, currencyCode: 'USD', type: 'credit_card' }),
      cash: wallet({ amount: 1000, currencyCode: 'USD', isWithdrawable: true, type: 'cash' }),
      loan: wallet({ amount: -500, currencyCode: 'USD', isWithdrawable: true, type: 'loan' }),
    }

    const result = computeWalletCounts({
      toBase: toBaseIn('USD'),
      totalWalletsCount: 3,
      walletIds: ['cash', 'card', 'loan'],
      wallets,
    })

    expect(result.total!.value).toBe(1000)
    expect(result.credit_card).toMatchObject({ secondValue: 1000, value: -300 })
    expect(result.loan).toMatchObject({ isShow: true, value: -500 })
    expect(result.withdrawal!.value).toBe(1000)
    expect(result.available!.value).toBe(700)
    expect(result.availableAll).toMatchObject({ isShow: true, value: 200 })
  })
})

describe('sumWalletsInBase', () => {
  it('converts wallets counted in totals, honoring the switches', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currencyCode: 'USD', type: 'cash' }),
      w2: wallet({ amount: 6475, currencyCode: 'RUB', isExcludedFromTotal: true, type: 'bank_account' }),
    }

    expect(sumWalletsInBase(['w1', 'w2', 'missing'], wallets, toBaseIn('USD'))).toBe(1000)
    // 1000 + 6475/64.75 = 1100
    expect(sumWalletsInBase(['w1', 'w2'], wallets, toBaseIn('USD'), { includeExcluded: true })).toBe(1100)
    const archived = { a: wallet({ amount: 300, currencyCode: 'USD', isArchived: true, type: 'cash' }) }
    expect(sumWalletsInBase(['a'], archived, toBaseIn('USD'))).toBe(0)
    expect(sumWalletsInBase(['a'], archived, toBaseIn('USD'), { includeArchived: true })).toBe(300)
  })
})

describe('sumWalletsInOwnCurrency', () => {
  it('sums without conversion, excludes isExcludedFromTotal', () => {
    const wallets = {
      w1: wallet({ amount: 1000, currencyCode: 'USD', type: 'cash' }),
      w2: wallet({ amount: 500, currencyCode: 'USD', isExcludedFromTotal: true, type: 'bank_account' }),
    }

    expect(sumWalletsInOwnCurrency(['w1', 'w2', 'missing'], wallets)).toBe(1000)
    expect(sumWalletsInOwnCurrency(['w1', 'w2'], wallets, { includeExcluded: true })).toBe(1500)
  })
})
