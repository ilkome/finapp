import { addCivilDays, addCivilMonths, startOfMonthCivil } from '~~/utils/date/civil'

/** Income is averaged over the last full months; the current one is still filling up. */
export const INCOME_MONTHS = 3

export function incomeWindow(today: number): { end: number, start: number } {
  const monthStart = startOfMonthCivil(today)
  return { end: addCivilDays(monthStart, -1), start: addCivilMonths(monthStart, -INCOME_MONTHS) }
}

/** Monthly credit payments against the average monthly income; null when either is missing. */
export function debtToIncome(payments: number, incomeTotal: number): { payments: number, share: number } | null {
  const income = incomeTotal / INCOME_MONTHS
  return income > 0 && payments > 0 ? { payments, share: payments / income } : null
}
