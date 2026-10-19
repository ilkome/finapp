import { describe, expect, it } from 'vitest'

import type { ExtrasChipLabels, FilterExtras } from '~/components/filter/extras'
import type { TrnItem } from '~/components/trns/types'

import { countActiveExtras, createExtrasMatcher, defaultFilterExtras, extrasChips, extrasToQuery, parseFilterExtras } from '~/components/filter/extras'

const wallets = {
  eur: { currencyCode: 'EUR', name: 'Euro cash' },
  usd: { currencyCode: 'USD', name: 'Dollar card' },
} as any

const categories = {
  food: { name: 'Food', parentId: 'home' },
  home: { name: 'Home' },
  salary: { name: 'Salary' },
} as any

const ctx = { baseCurrency: 'USD', categories, rates: { EUR: 0.5, USD: 1 }, wallets }

const expense: TrnItem = { categoryId: 'food', createdAt: 1, date: 0, description: 'Weekly Groceries', fromAmount: 10000, fromWalletId: 'usd', type: 'expense', updatedAt: 1 }
const income: TrnItem = { categoryId: 'salary', createdAt: 1, date: 0, toAmount: 30000, toWalletId: 'eur', type: 'income', updatedAt: 1 }
const transfer: TrnItem = { createdAt: 1, date: 0, fromAmount: 5000, fromWalletId: 'usd', toAmount: 5000, toWalletId: 'eur', type: 'transfer', updatedAt: 1 }
const adjustment: TrnItem = { createdAt: 1, date: 0, description: '  ', toAmount: 500, toWalletId: 'usd', type: 'adjustment', updatedAt: 1 }

const labels: ExtrasChipLabels = {
  amount: 'Amount',
  desc: 'Description',
  descMode: { with: 'With description', without: 'Without description' },
  search: 'Search',
  type: 'Type',
  types: { adjustment: 'Adjustment', expense: 'Expense', income: 'Income', transfer: 'Transfer' },
}

function extras(patch: Partial<FilterExtras>): FilterExtras {
  return { ...defaultFilterExtras, ...patch }
}

describe('parseFilterExtras', () => {
  it('round-trips through the query', () => {
    const value = extras({ amountMax: 500, amountMin: 100, desc: 'with', descText: 'weekly', search: 'milk', type: 'expense' })
    expect(parseFilterExtras(extrasToQuery(value) as any)).toEqual(value)
  })

  it('falls back to defaults on junk', () => {
    expect(parseFilterExtras({ filterAmountMin: 'x', filterDesc: 'maybe', filterType: 'nope' } as any)).toEqual(defaultFilterExtras)
    expect(extrasToQuery(defaultFilterExtras)).toEqual({
      filterAmountMax: undefined,
      filterAmountMin: undefined,
      filterDesc: undefined,
      filterDescText: undefined,
      filterSearch: undefined,
      filterType: undefined,
    })
  })

  it('counts each group once', () => {
    expect(countActiveExtras(defaultFilterExtras)).toBe(0)
    expect(countActiveExtras(extras({ amountMax: 1, amountMin: 1, desc: 'with', descText: 'b', search: 'a', type: 'income' }))).toBe(5)
  })
})

describe('createExtrasMatcher', () => {
  it('passes everything when nothing is active', () => {
    const matches = createExtrasMatcher(defaultFilterExtras, ctx)
    expect([expense, income, transfer, adjustment].every(matches)).toBe(true)
    expect(matches(undefined)).toBe(false)
  })

  it('filters by view type', () => {
    expect([expense, income, transfer, adjustment].filter(createExtrasMatcher(extras({ type: 'expense' }), ctx))).toEqual([expense])
    expect([expense, income, transfer, adjustment].filter(createExtrasMatcher(extras({ type: 'transfer' }), ctx))).toEqual([transfer])
    expect([expense, income, transfer, adjustment].filter(createExtrasMatcher(extras({ type: 'adjustment' }), ctx))).toEqual([adjustment])
    expect([expense, income, transfer, adjustment].filter(createExtrasMatcher(extras({ type: 'income' }), ctx))).toEqual([income])
  })

  it('filters by description presence and text', () => {
    expect([expense, income, adjustment].filter(createExtrasMatcher(extras({ desc: 'with' }), ctx))).toEqual([expense])
    expect([expense, income, adjustment].filter(createExtrasMatcher(extras({ desc: 'without' }), ctx))).toEqual([income, adjustment])
    expect([expense, income].filter(createExtrasMatcher(extras({ search: 'GROCER' }), ctx))).toEqual([expense])
  })

  it('descText matches the description only', () => {
    expect([expense, income, transfer].filter(createExtrasMatcher(extras({ descText: 'grocer' }), ctx))).toEqual([expense])
    expect([expense, income, transfer].filter(createExtrasMatcher(extras({ descText: 'food' }), ctx))).toEqual([])
    expect([expense, income, transfer].filter(createExtrasMatcher(extras({ descText: 'dollar' }), ctx))).toEqual([])
  })

  it('searches the category path and wallet names too', () => {
    expect([expense, income, transfer].filter(createExtrasMatcher(extras({ search: 'home / food' }), ctx))).toEqual([expense])
    expect([expense, income, transfer].filter(createExtrasMatcher(extras({ search: 'salary' }), ctx))).toEqual([income])
    // transfer matches either wallet
    expect([expense, income, transfer].filter(createExtrasMatcher(extras({ search: 'euro' }), ctx))).toEqual([income, transfer])
    expect([expense, income, transfer].filter(createExtrasMatcher(extras({ search: 'dollar' }), ctx))).toEqual([expense, transfer])
  })

  it('compares unsigned amounts in the base currency, transfers included', () => {
    // income: 300 EUR -> 600 USD; transfer: 50 USD
    expect([expense, income, transfer].filter(createExtrasMatcher(extras({ amountMin: 100 }), ctx))).toEqual([expense, income])
    expect([expense, income, transfer].filter(createExtrasMatcher(extras({ amountMax: 100 }), ctx))).toEqual([expense, transfer])
    expect([expense, income, transfer].filter(createExtrasMatcher(extras({ amountMax: 599, amountMin: 51 }), ctx))).toEqual([expense])
  })
})

describe('extrasChips', () => {
  it('builds one chip per group with a reset patch', () => {
    const chips = extrasChips(extras({ amountMin: 100, desc: 'without', descText: 'milk', search: 'a'.repeat(30), type: 'expense' }), 'USD', labels)
    expect(chips.map(c => c.key)).toEqual(['type', 'search', 'descText', 'desc', 'amount'])
    expect(chips[0]).toMatchObject({ label: 'Expense', patch: { type: 'all' }, tooltip: 'Type: Expense' })
    expect(chips[1]!.label).toBe(`“${'a'.repeat(24)}…”`)
    expect(chips[1]!.tooltip).toBe(`Search: “${'a'.repeat(30)}”`)
    expect(chips[2]).toMatchObject({ label: '“milk”', patch: { descText: '' }, tooltip: 'Description: “milk”' })
    expect(chips[3]).toMatchObject({ patch: { desc: 'all' }, tooltip: 'Description: Without description' })
    expect(chips[4]).toMatchObject({ label: '≥ 100 $', patch: { amountMax: null, amountMin: null }, tooltip: 'Amount: ≥ 100 $' })
  })

  it('formats two-sided and max-only ranges', () => {
    expect(extrasChips(extras({ amountMax: 500, amountMin: 100 }), 'USD', labels)[0]!.label).toBe('100 - 500 $')
    expect(extrasChips(extras({ amountMax: 500 }), 'USD', labels)[0]!.label).toBe('≤ 500 $')
    expect(extrasChips(defaultFilterExtras, 'USD', labels)).toEqual([])
  })
})
