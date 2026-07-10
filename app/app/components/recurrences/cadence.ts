export type RecurrenceCadence = 'monthly' | 'weekly' | 'yearly'

// Round-number smoothed averages of the committed 12-month total: weekly/monthly won't exactly
// reconcile with each other (52 vs 12), matching the existing "yearly / 12" framing. daily (365) is a
// supplementary per-day framing, not part of the tap cycle; yearly is the true committed sum.
export const RECURRENCE_CADENCE_DIVISORS = { daily: 365, monthly: 12, weekly: 52, yearly: 1 } as const
export const RECURRENCE_CADENCES = ['weekly', 'monthly', 'yearly'] as const

export function scaleByCadence(yearlyAmount: number, cadence: keyof typeof RECURRENCE_CADENCE_DIVISORS): number {
  return yearlyAmount / RECURRENCE_CADENCE_DIVISORS[cadence]
}

export function nextCadence(current: RecurrenceCadence): RecurrenceCadence {
  // indexOf === -1 for an unknown persisted value wraps to 'weekly'.
  const i = RECURRENCE_CADENCES.indexOf(current)
  return RECURRENCE_CADENCES[(i + 1) % RECURRENCE_CADENCES.length]!
}
