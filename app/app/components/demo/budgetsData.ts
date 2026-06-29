import { UTCDate } from '@date-fns/utc'

import type { BudgetAssignmentItem, BudgetAssignments, BudgetBucket, BudgetId, BudgetItem, BudgetRollover, Budgets } from '~/components/budgets/types'
import type { LocaleSlug } from '~/components/locale/types'
import type { RecurrenceEndMode, RecurrenceFreq, RecurrenceId, RecurrenceItem, Recurrences, RecurrenceStatus } from '~/components/recurrences/types'
import type { Trns } from '~/components/trns/types'

import { addCivilDays, addCivilMonths, epochToCivilParts, getStartOf, toCivilDayEpoch } from '~/components/date/utils'
import {
  catClothing,
  catEducation,
  catEntertainment,
  catEntertainmentSubscriptions,
  catFamily,
  catFood,
  catGifts,
  catHealth,
  catHome,
  catHomeElectricity,
  catHomeInternet,
  catHomeRent,
  catHomeWater,
  catSalary,
  catSport,
  catTransport,
  catTransportService,
  catTravel,
  walletCreditRub,
  walletDebitRub,
  walletUsd,
} from '~/components/demo/data'
import { buildOccurrenceTrn } from '~/components/recurrences/generate'
import { occurrencesInRange, occurrenceTrnId } from '~/components/recurrences/occurrences'
import { TrnType } from '~/components/trns/types'

type LocaleString = { en: string, ru: string }

// All money below is in the demo's everyday currency (RUB), except where a USD wallet is used.
// Base currency is USD; budgets/assignments store their own `currency` and convert at read time.
const RUB = 'RUB'
const USD = 'USD'

// ---------------------------------------------------------------------------
// Budgets + per-period assignments
// ---------------------------------------------------------------------------

type BudgetSpec = {
  amount?: number
  bucket?: BudgetBucket
  categoryId: string
  currency?: string
  /** Current-period override (in the budget's currency). */
  current?: number
  goalAmount?: number
  /** Sinking-fund goal date as a civil-day epoch. */
  goalDate?: number
  id: string
  kind?: BudgetItem['kind']
  /** Previous-period override, to make a target's carried "saved" visible. */
  prev?: number
  rollover?: BudgetRollover
  status?: BudgetItem['status']
}

/**
 * Demo budgets exercising the feature surface: plain monthly limits, rollover (surplus +
 * surplus/deficit), need/want/savings buckets, an income target, two sinking-fund goals with
 * dates, an archived budget (for the history view) and a few per-period overrides. Amounts are
 * tuned to the seeded spend so progress bars land in a realistic mix of on-track / near / over.
 */
export function buildDemoBudgets(todayEpoch: number, now: number, locale: LocaleSlug, rubPerUsd: number): { assignments: BudgetAssignments, budgets: Budgets } {
  const { month, year } = epochToCivilParts(todayEpoch)
  const monthStart = getStartOf(new UTCDate(todayEpoch), 'month').getTime()
  const prevMonthStart = getStartOf(new UTCDate(addCivilMonths(todayEpoch, -1)), 'month').getTime()

  // The English demo budgets in USD, the Russian ones in RUB. Spec amounts below are RUB; for USD
  // we convert at the seeded rate and round to a tidy figure. The seeded spend stays RUB either
  // way and is compared against the budget in the base currency (USD).
  const currency = locale === 'en' ? USD : RUB
  const toMoney = (rub: number) => locale === 'en' ? Math.round(rub / rubPerUsd / 5) * 5 : rub

  // Whole months from now until the next occurrence of a target calendar month (1..12).
  const monthsUntil = (targetMonth0: number) => ((targetMonth0 - month + 12) % 12) || 12

  const specs: BudgetSpec[] = [
    // Plain monthly limits
    { amount: 28000, bucket: 'need', categoryId: catFood, current: 35000, id: 'demo_b_food', rollover: 'surplus' },
    { amount: 10000, bucket: 'need', categoryId: catTransport, id: 'demo_b_transport', rollover: 'surplus_deficit' },
    { amount: 50000, bucket: 'need', categoryId: catHomeRent, id: 'demo_b_rent' },
    { amount: 3500, bucket: 'need', categoryId: catHealth, id: 'demo_b_health' },
    { amount: 4500, bucket: 'want', categoryId: catEntertainment, id: 'demo_b_entertainment', rollover: 'surplus' },
    { amount: 3500, bucket: 'want', categoryId: catClothing, id: 'demo_b_clothing', rollover: 'surplus' },
    { amount: 3000, bucket: 'want', categoryId: catSport, id: 'demo_b_sport' },

    // Income target: expected monthly salary
    { amount: 180000, bucket: 'need', categoryId: catSalary, id: 'demo_b_salary', kind: 'income' },

    // Sinking-fund goals (amount stays 0; the goal + date drive the per-period set-aside)
    { bucket: 'savings', categoryId: catTravel, current: 40000, goalAmount: 180000, goalDate: toCivilDayEpoch(year, month + 5, 1), id: 'demo_b_travel', prev: 40000, rollover: 'surplus' },
    { bucket: 'savings', categoryId: catGifts, current: 5000, goalAmount: 30000, goalDate: toCivilDayEpoch(year, month + monthsUntil(11), 20), id: 'demo_b_gifts_ny', prev: 5000, rollover: 'surplus' },

    // Archived budget (shows up in the archive + history views)
    { amount: 5000, bucket: 'want', categoryId: catEducation, id: 'demo_b_education', status: 'archived' },
  ]

  const budgets: Budgets = {}
  const assignments: BudgetAssignments = {}
  let aIndex = 0

  const addAssignment = (budgetId: BudgetId, periodStart: number, assigned: number) => {
    assignments[`demo_ba_${aIndex++}`] = { assigned, budgetId, periodStart, updatedAt: now } satisfies BudgetAssignmentItem
  }

  for (const s of specs) {
    budgets[s.id] = {
      amount: toMoney(s.amount ?? 0),
      amountPeriod: 'month',
      ...(s.bucket ? { bucket: s.bucket } : {}),
      categoryId: s.categoryId,
      currency: s.currency ?? currency,
      ...(s.goalAmount != null ? { goalAmount: toMoney(s.goalAmount) } : {}),
      ...(s.goalDate != null ? { goalDate: s.goalDate } : {}),
      kind: s.kind ?? 'expense',
      rollover: s.rollover ?? 'none',
      status: s.status ?? 'active',
      updatedAt: now,
    } satisfies BudgetItem

    if (s.current != null)
      addAssignment(s.id, monthStart, toMoney(s.current))
    if (s.prev != null)
      addAssignment(s.id, prevMonthStart, toMoney(s.prev))
  }

  return { assignments, budgets }
}

// ---------------------------------------------------------------------------
// Recurrences (recurring payments)
// ---------------------------------------------------------------------------

type RecSpec = {
  amount: number
  /** Default true. False => surfaces under "pending to confirm". */
  autoCreate?: boolean
  categoryId: string
  desc?: LocaleString
  endCount?: number
  endMode?: RecurrenceEndMode
  freq?: RecurrenceFreq
  id: string
  interval?: number
  monthLastDay?: boolean
  /** How many whole months back the anchor sits (gives the rule some history). */
  monthsBack?: number
  status?: RecurrenceStatus
  type?: TrnType.Expense | TrnType.Income
  /** Defaults to the RUB debit card. */
  walletId?: string
  /** For yearly rules: anchor on this calendar month (0-based) in the most recent past year. */
  yearMonth?: number
}

/**
 * Demo recurring payments covering every mode: monthly bills, weekly/biweekly, yearly, an
 * income salary, end-by-count and end-by-date rules, a last-day-of-month rule, a manual
 * (confirm-required) rule, plus a paused and a cancelled one. Anchors are derived from "today"
 * so the upcoming timeline and due-soon badges stay populated whenever the demo is generated.
 */
export function buildDemoRecurrences(todayEpoch: number, now: number, locale: LocaleSlug): Recurrences {
  const { month, year } = epochToCivilParts(todayEpoch)

  // Anchor on `day` of the month `monthsBack` months ago (Date.UTC rolls negative months/years).
  const monthlyAnchor = (day: number, monthsBack: number) => toCivilDayEpoch(year, month - monthsBack, day)
  // Most recent past occurrence of `targetMonth0`/`day` (so yearly rules have history + a future due).
  const yearlyAnchor = (targetMonth0: number, day: number) =>
    toCivilDayEpoch(targetMonth0 <= month ? year : year - 1, targetMonth0, day)

  const specs: RecSpec[] = [
    { amount: 50000, categoryId: catHomeRent, desc: { en: 'Apartment rent', ru: 'Аренда квартиры' }, id: 'demo_r_rent', monthsBack: 24 }, // day 5
    { amount: 180000, categoryId: catSalary, desc: { en: 'Salary', ru: 'Зарплата' }, id: 'demo_r_salary', monthsBack: 24, type: TrnType.Income }, // day 5
    { amount: 1000, categoryId: catHomeInternet, desc: { en: 'Internet', ru: 'Интернет' }, id: 'demo_r_internet', monthsBack: 24 }, // day 10
    { amount: 600, categoryId: catEntertainmentSubscriptions, desc: { en: 'Netflix', ru: 'Netflix' }, id: 'demo_r_netflix', monthsBack: 24, walletId: walletCreditRub }, // day 15
    { amount: 300, categoryId: catEntertainmentSubscriptions, desc: { en: 'YouTube Premium', ru: 'YouTube Premium' }, id: 'demo_r_youtube', monthsBack: 24, walletId: walletCreditRub }, // day 20
    { amount: 1500, categoryId: catHomeElectricity, desc: { en: 'Electricity', ru: 'Электричество' }, id: 'demo_r_electricity', monthsBack: 24 }, // day 25
    { amount: 800, categoryId: catHomeWater, desc: { en: 'Water', ru: 'Вода' }, id: 'demo_r_water', monthsBack: 24 }, // day 25
    { amount: 3000, categoryId: catSport, desc: { en: 'Gym membership', ru: 'Абонемент в зал' }, id: 'demo_r_gym', monthsBack: 24 }, // day 1, due soon
    { amount: 10000, autoCreate: false, categoryId: catFamily, desc: { en: 'Allowance to parents', ru: 'Помощь родителям' }, id: 'demo_r_allowance', monthsBack: 3 }, // day 28, pending
    { amount: 8000, categoryId: catFamily, desc: { en: 'Loan payment', ru: 'Платеж по кредиту' }, id: 'demo_r_loan', monthLastDay: true, monthsBack: 24 },
    { amount: 4500, categoryId: catEducation, desc: { en: 'Course installment', ru: 'Рассрочка за курс' }, endCount: 6, endMode: 'count', id: 'demo_r_course', monthsBack: 2, walletId: walletCreditRub }, // day 18
    { amount: 2000, categoryId: catHome, desc: { en: 'Cleaning service', ru: 'Уборка' }, freq: 'week', id: 'demo_r_cleaning', interval: 2 },
    { amount: 18000, categoryId: catTransportService, desc: { en: 'Car insurance', ru: 'Каско' }, freq: 'year', id: 'demo_r_insurance', yearMonth: 7 }, // Aug 12
    { amount: 15, categoryId: catEntertainmentSubscriptions, desc: { en: 'Domain renewal', ru: 'Продление домена' }, endMode: 'date', freq: 'year', id: 'demo_r_domain', walletId: walletUsd, yearMonth: 6 }, // Jul 12
    { amount: 500, categoryId: catEntertainmentSubscriptions, desc: { en: 'Magazine (paused)', ru: 'Журнал (на паузе)' }, id: 'demo_r_magazine', monthsBack: 24, status: 'paused', walletId: walletCreditRub }, // day 12
    { amount: 2500, categoryId: catSport, desc: { en: 'Old gym pass', ru: 'Старый абонемент' }, id: 'demo_r_oldgym', monthsBack: 24, status: 'cancelled' }, // day 3
  ]

  // Day-of-month per rule (monthly rules); keyed by id to keep the table above readable.
  const dayOfMonth: Record<string, number> = {
    demo_r_allowance: 28,
    demo_r_course: 18,
    demo_r_electricity: 25,
    demo_r_gym: 1,
    demo_r_internet: 10,
    demo_r_loan: 28,
    demo_r_magazine: 12,
    demo_r_netflix: 15,
    demo_r_oldgym: 3,
    demo_r_rent: 5,
    demo_r_salary: 5,
    demo_r_water: 25,
    demo_r_youtube: 20,
  }

  const recurrences: Recurrences = {}

  for (const s of specs) {
    const freq = s.freq ?? 'month'
    const status = s.status ?? 'active'
    const autoCreate = s.autoCreate ?? true

    let anchorDate: number
    if (freq === 'year')
      anchorDate = yearlyAnchor(s.yearMonth ?? month, 12)
    else if (freq === 'week')
      anchorDate = addCivilDays(todayEpoch, -10) // next biweekly occurrence falls a few days out
    else
      anchorDate = monthlyAnchor(dayOfMonth[s.id] ?? 1, s.monthsBack ?? 24)

    recurrences[s.id as RecurrenceId] = {
      amount: s.amount,
      anchorDate,
      autoCreate,
      categoryId: s.categoryId,
      ...(s.desc ? { desc: s.desc[locale] } : {}),
      ...(s.endCount != null ? { endCount: s.endCount } : {}),
      ...(s.endMode === 'date' ? { endDate: toCivilDayEpoch(year + 3, s.yearMonth ?? month, 12) } : {}),
      endMode: s.endMode ?? 'never',
      freq,
      interval: s.interval ?? 1,
      // autoCreate rules are already materialized as trns below, so mark them caught up.
      ...(autoCreate && status === 'active' ? { lastGeneratedDate: todayEpoch } : {}),
      monthLastDay: s.monthLastDay ?? false,
      skipDates: [],
      status,
      type: s.type ?? TrnType.Expense,
      updatedAt: now,
      walletId: s.walletId ?? walletDebitRub,
    } satisfies RecurrenceItem
  }

  return recurrences
}

/**
 * Materialize past occurrences of the active autoCreate EXPENSE rules as real trns (deterministic
 * ids, linked via recurrenceId). This makes the fixed bills show up as actual spend so the budgets
 * that track them have a clean monthly history. Income rules stay rules-only (the random salary
 * generator already seeds income, avoiding double counting).
 */
export function buildRecurrenceTrns(recurrences: Recurrences, startEpoch: number, todayEpoch: number, now: number): Trns {
  const out: Trns = {}
  for (const [id, rule] of Object.entries(recurrences)) {
    if (rule.status !== 'active' || !rule.autoCreate || rule.type !== TrnType.Expense)
      continue
    for (const day of occurrencesInRange(rule, { end: todayEpoch, start: startEpoch }))
      out[occurrenceTrnId(id, day)] = buildOccurrenceTrn(rule, id, day, now)
  }
  return out
}
