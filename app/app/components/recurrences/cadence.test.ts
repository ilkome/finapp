import { describe, expect, it } from 'vitest'

import { nextCadence, scaleByCadence } from '~/components/recurrences/cadence'

describe('scaleByCadence', () => {
  it('returns the full yearly sum unchanged', () => {
    expect(scaleByCadence(1200, 'yearly')).toBe(1200)
  })

  it('divides the yearly sum into a smoothed monthly average', () => {
    expect(scaleByCadence(1200, 'monthly')).toBe(100)
  })

  it('divides the yearly sum by 52 weeks', () => {
    expect(scaleByCadence(1200, 'weekly')).toBeCloseTo(1200 / 52)
  })

  it('divides the yearly sum by 365 days', () => {
    expect(scaleByCadence(365, 'daily')).toBe(1)
  })
})

describe('nextCadence', () => {
  it('cycles weekly -> monthly -> yearly -> weekly', () => {
    expect(nextCadence('weekly')).toBe('monthly')
    expect(nextCadence('monthly')).toBe('yearly')
    expect(nextCadence('yearly')).toBe('weekly')
  })

  it('wraps an out-of-set persisted value to weekly', () => {
    expect(nextCadence('daily' as any)).toBe('weekly')
  })
})
