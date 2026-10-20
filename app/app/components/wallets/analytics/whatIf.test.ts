import { describe, expect, it } from 'vitest'
import { parseAmountInput } from '~~/utils/money/parseInput'

import { whatIfScenario } from '~/components/wallets/analytics/forecast'

const empty = { amount: '', date: '', incomePercent: '', kind: 'expense' as const, spendingPercent: '' }
const toMinor = (amount: number) => Math.round(amount * 100)

describe('whatIfScenario', () => {
  it('is null when nothing is set', () => {
    expect(whatIfScenario(empty, parseAmountInput, toMinor)).toBeNull()
  })

  it('needs both an amount and a date for a one-off', () => {
    expect(whatIfScenario({ ...empty, amount: '500' }, parseAmountInput, toMinor)).toBeNull()
    expect(whatIfScenario({ ...empty, date: '2026-11-01' }, parseAmountInput, toMinor)).toBeNull()
  })

  it('signs the one-off by kind', () => {
    const day = Date.UTC(2026, 10, 1)
    expect(whatIfScenario({ ...empty, amount: '500', date: '2026-11-01' }, parseAmountInput, toMinor)!.events).toEqual([{ amount: -50000, date: day }])
    expect(whatIfScenario({ ...empty, amount: '-500', date: '2026-11-01', kind: 'income' }, parseAmountInput, toMinor)!.events).toEqual([{ amount: 50000, date: day }])
  })

  it('turns percents into factors', () => {
    const scenario = whatIfScenario({ ...empty, incomePercent: '-20', spendingPercent: '10' }, parseAmountInput, toMinor)!
    expect(scenario.incomeFactor).toBeCloseTo(0.8)
    expect(scenario.spendingFactor).toBeCloseTo(1.1)
    expect(scenario.events).toEqual([])
  })
})
