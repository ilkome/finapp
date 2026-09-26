import { UTCDate } from '@date-fns/utc'
import { addDays, addMonths, getMonth, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns'
import localforage from 'localforage'
import { localInstantToCivilDay } from '~~/utils/date/civil'

import type { Categories } from '~/components/categories/types'
import type { LoanParams, LoanTrn, ScheduleOverride } from '~/components/loans/engine/types'
import type { LoanScheduleRows } from '~/components/loans/types'
import type { LocaleSlug } from '~/components/locale/types'
import type { TrnItem, Trns } from '~/components/trns/types'
import type { Wallets } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { currencies as currencyCatalog } from '~/components/currencies/currencies'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import currencies from '~/components/demo/currencies.json'
import { data, debtMoves, demoLoans, expenseRules, foreignCurrency, incomeRules, loanDebitWalletId, mainCurrency, monthlySettlements, oneOffExpenses, randomCryptoCurrencies, randomFiatCurrencies, salaryConfig, transferRules, walletCashRub, walletCreditRub, walletDebitRub, walletRandomCrypto, walletRandomFiat, walletStudentLoan, walletUsd } from '~/components/demo/data'
import { paramsOf } from '~/components/loans/engine/derive'
import { reconcileSchedule } from '~/components/loans/engine/reconcile'
import { generateSchedule, round2 } from '~/components/loans/engine/schedule'
import { loanIdFor, loanItemSchema, loanScheduleRowIdFor, loanScheduleRowSchema } from '~/components/loans/types'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const config = {
  adjustmentsCount: 3,
  expenseCount: 700,
  incomeCount: 80,
  subtractYears: 2,
  transferCount: 60,
}

// E2E snapshots need the same demo data on every run. A test sets `window.__finappDemoSeed`
// before the app boots (page.addInitScript) and generation switches to a seeded mulberry32;
// without it production keeps Math.random. Re-created per generation so a seed restarts the stream.
let random: () => number = Math.random

function createRandom(): () => number {
  const seed = import.meta.client ? (window as { __finappDemoSeed?: number }).__finappDemoSeed : undefined
  if (seed === undefined)
    return Math.random

  let state = seed >>> 0
  return () => {
    state = (state + 0x6D2B79F5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Pick a random item from an array using weighted probabilities. */
function weightedPick<T extends { weight: number }>(rules: T[]): T {
  const totalWeight = rules.reduce((sum, r) => sum + r.weight, 0)
  let rand = random() * totalWeight
  for (const rule of rules) {
    rand -= rule.weight
    if (rand <= 0)
      return rule
  }
  return rules.at(-1)!
}

function randInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(random() * arr.length)]!
}

/**
 * A bank schedule as bank sync stores it, every row: the `interestOnly` payments repay no principal
 * and push the term out by as many months, like a payment holiday does.
 */
function bankSchedule(params: LoanParams, interestOnly: number[]): ScheduleOverride[] {
  const extended = { ...params, termMonths: params.termMonths + interestOnly.length }
  const overrides: ScheduleOverride[] = []
  for (const n of interestOnly) {
    const row = generateSchedule(extended, overrides)[n - 1]!
    overrides.push({ date: row.date, interestPart: row.interestPart, paymentNumber: n, principalPart: 0, source: 'bank', totalAmount: row.interestPart })
  }
  return generateSchedule(extended, overrides).map(({ date, interestPart, paymentNumber, principalPart, totalAmount }) =>
    ({ date, interestPart, paymentNumber, principalPart, source: 'bank' as const, totalAmount }))
}

function roundAmount(n: number): number {
  return Math.round(n / 10) * 10
}

const rates = currencies as Record<string, number>
const precisionOf = new Map(currencyCatalog.map(c => [c.code, c.precision ?? 2]))

/** Converts at the demo rates (units per 1 USD) and rounds to what the currency can show. */
function convert(amount: number, from: string, to: string): number {
  const value = from === to ? amount : amount / (rates[from] ?? 1) * (rates[to] ?? 1)
  const factor = 10 ** (precisionOf.get(to) ?? 2)
  return Math.round(value * factor) / factor
}

/** Random timestamp within a specific month of a given year. */
function randDateInMonth(year: number, month: number): number {
  const start = new Date(year, month, 1).getTime()
  const end = new Date(year, month + 1, 0).getTime()
  return start + random() * (end - start)
}

export function useDemo() {
  const isDemo = useCookie('finapp.isDemo')
  const categoriesStore = useCategoriesStore()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const trnsStore = useTrnsStore()

  async function generateDemoData(locale: LocaleSlug) {
    random = createRandom()
    await localforage.clear()

    const translatedData: {
      categories: Categories
      wallets: Wallets
    } = {
      categories: Object.entries(data.categories).reduce((acc, [id, category]) => {
        acc[id] = { ...category, name: category.name[locale] }
        return acc
      }, {} as Categories),
      wallets: Object.entries(data.wallets).reduce((acc, [id, wallet]) => {
        acc[id] = { ...wallet, desc: wallet.desc[locale], name: wallet.name[locale] } as Wallets[string]
        return acc
      }, {} as Wallets),
    }

    const main = mainCurrency[locale]
    const foreign = foreignCurrency[locale]
    for (const wallet of Object.values(translatedData.wallets)) {
      if (wallet.currency === 'RUB')
        wallet.currency = main
    }
    Object.assign(translatedData.wallets[walletUsd]!, { currency: foreign, name: locale === 'ru' ? `Счёт ${foreign}` : `${foreign} account` })
    translatedData.wallets[walletStudentLoan]!.currency = foreign
    /** A RUB-scale amount from data.ts in the currency of the wallet it lands on. */
    const money = (rubScale: number, walletId: string) => convert(roundAmount(rubScale), 'RUB', translatedData.wallets[walletId]!.currency)
    /** A RUB-scale round figure (a limit, a principal) kept round in the main currency. */
    const round = (rubScale: number, currency = main) => {
      const value = convert(rubScale, 'RUB', currency)
      const step = currency === 'RUB' ? 1000 : 100
      return Math.round(value / step) * step
    }

    const fiat = randItem(randomFiatCurrencies.filter(code => code !== foreign))
    Object.assign(translatedData.wallets[walletRandomFiat]!, { currency: fiat, name: locale === 'ru' ? `Счёт ${fiat}` : `${fiat} account` })
    const crypto = randItem(Object.keys(randomCryptoCurrencies))
    Object.assign(translatedData.wallets[walletRandomCrypto]!, { currency: crypto, name: randomCryptoCurrencies[crypto] })

    const today = localInstantToCivilDay(Date.now())
    const cardDue = addMonths(new UTCDate(today), 1)
    const creditLimit = round(300000)
    Object.assign(translatedData.wallets[walletCreditRub]!, {
      creditLimit,
      desc: `${locale === 'ru' ? 'Лимит' : 'Credit limit'} ${creditLimit.toLocaleString(locale)}`,
      minPaymentAmount: money(8000, walletCreditRub),
      minPaymentDate: new UTCDate(cardDue.getFullYear(), cardDue.getMonth(), 25).getTime(),
      minPaymentUpdatedAt: today,
    })

    useUserStore().setUserBaseCurrency(main)
    currenciesStore.setRates(currencies)
    categoriesStore.setCategories(translatedData.categories)
    walletsStore.setWallets(translatedData.wallets)

    const startDate = subYears(startOfYear(new Date()), config.subtractYears).getTime()
    const endDate = Date.now()
    // Everyday expenses are paid from the main-currency wallets; the foreign and crypto wallets are
    // only reached by transfers and the rules that name them.
    const spendingWalletIds = [walletCashRub, walletDebitRub, walletCreditRub]

    const trns: Trns = {}
    let trnIndex = 0

    // --- Expenses (with seasonality) ---
    for (let i = 0; i < config.expenseCount; i++) {
      const rule = weightedPick(expenseRules)
      let date = startDate + random() * (endDate - startDate)

      // Seasonality: if rule has seasonMonths, re-roll date until it falls in an allowed month
      // (with a fallback to avoid infinite loops)
      if (rule.seasonMonths) {
        let attempts = 0
        while (!rule.seasonMonths.includes(getMonth(date)) && attempts < 20) {
          date = startDate + random() * (endDate - startDate)
          attempts++
        }
      }

      const walletId = rule.walletIds ? randItem(rule.walletIds) : randItem(spendingWalletIds)
      const amount = money(randInt(rule.min, rule.max), walletId)
      const desc = rule.desc ? rule.desc[locale] : undefined

      trns[trnIndex++] = {
        amount,
        categoryId: rule.categoryId,
        date,
        ...(desc ? { desc } : {}),
        type: TrnType.Expense,
        updatedAt: Date.now(),
        walletId,
      } satisfies TrnItem
    }

    // --- One-off larger expenses (once per year in specified months) ---
    const startYear = new Date(startDate).getFullYear()
    const endYear = new Date(endDate).getFullYear()

    for (const oneOff of oneOffExpenses) {
      for (let year = startYear; year <= endYear; year++) {
        const month = randItem(oneOff.months)
        const date = randDateInMonth(year, month)
        if (date < startDate || date > endDate)
          continue

        const walletId = oneOff.walletIds ? randItem(oneOff.walletIds) : randItem(spendingWalletIds)
        const amount = money(randInt(oneOff.min, oneOff.max), walletId)

        trns[trnIndex++] = {
          amount,
          categoryId: oneOff.categoryId,
          date,
          desc: oneOff.desc[locale],
          type: TrnType.Expense,
          updatedAt: Date.now(),
          walletId,
        } satisfies TrnItem
      }
    }

    // --- Incomes: salary with raise after 12 months ---
    const startMonth = startOfMonth(new Date(startDate))
    let month = startMonth
    let monthIndex = 0

    while (month.getTime() < endDate) {
      // Salary on ~5th of each month
      const salaryDate = month.getTime() + 4 * 24 * 60 * 60 * 1000 + random() * 2 * 24 * 60 * 60 * 1000
      if (salaryDate < endDate) {
        const isRaised = monthIndex >= salaryConfig.raiseAfterMonths
        const min = isRaised ? salaryConfig.raisedMin : salaryConfig.startMin
        const max = isRaised ? salaryConfig.raisedMax : salaryConfig.startMax
        const amount = money(randInt(min, max), salaryConfig.walletId)

        trns[trnIndex++] = {
          amount,
          categoryId: salaryConfig.categoryId,
          date: salaryDate,
          desc: salaryConfig.desc[locale],
          type: TrnType.Income,
          updatedAt: Date.now(),
          walletId: salaryConfig.walletId,
        } satisfies TrnItem
      }
      month = addMonths(month, 1)
      monthIndex++
    }

    // Other income (freelance, investments, cashback)
    const salaryMonths = Math.floor((endDate - startDate) / (30 * 24 * 60 * 60 * 1000))
    const remainingIncome = config.incomeCount - salaryMonths
    for (let i = 0; i < Math.max(0, remainingIncome); i++) {
      const rule = weightedPick(incomeRules)
      const walletId = rule.walletIds ? randItem(rule.walletIds) : walletDebitRub
      const amount = money(randInt(rule.min, rule.max), walletId)
      const desc = rule.desc ? rule.desc[locale] : undefined

      trns[trnIndex++] = {
        amount,
        categoryId: rule.categoryId,
        date: startDate + random() * (endDate - startDate),
        ...(desc ? { desc } : {}),
        type: TrnType.Income,
        updatedAt: Date.now(),
        walletId,
      } satisfies TrnItem
    }

    // --- Transfers ---
    for (let i = 0; i < config.transferCount; i++) {
      const rule = weightedPick(transferRules)
      const from = translatedData.wallets[rule.expenseWalletId]!.currency
      const to = translatedData.wallets[rule.incomeWalletId]!.currency
      const expenseAmount = money(randInt(rule.amountMin, rule.amountMax), rule.expenseWalletId)
      const desc = rule.desc ? rule.desc[locale] : undefined

      trns[trnIndex++] = {
        categoryId: 'transfer',
        date: startDate + random() * (endDate - startDate),
        ...(desc ? { desc } : {}),
        expenseAmount,
        expenseWalletId: rule.expenseWalletId,
        incomeAmount: convert(expenseAmount, from, to),
        incomeWalletId: rule.incomeWalletId,
        type: TrnType.Transfer,
        updatedAt: Date.now(),
      } satisfies TrnItem
    }

    // --- Adjustments ---
    for (let i = 0; i < config.adjustmentsCount; i++) {
      const walletId = randItem(spendingWalletIds)
      const amount = money(randInt(1000, 20000), walletId)
      const type = random() < 0.5 ? TrnType.Income : TrnType.Expense

      trns[trnIndex++] = {
        amount,
        categoryId: 'adjustment',
        date: startDate + random() * (endDate - startDate),
        desc: locale === 'ru' ? 'Корректировка баланса' : 'Balance adjustment',
        type,
        updatedAt: Date.now(),
        walletId,
      } satisfies TrnItem
    }

    // --- Debts between people ---
    const debtBalances = new Map<string, number>()
    for (const move of debtMoves) {
      const held = debtBalances.get(move.walletId) ?? 0
      const amount = move.amount === 0 ? Math.abs(held) : round(move.amount)
      debtBalances.set(move.walletId, held + (move.direction === 'out' ? amount : -amount))
      const [from, to] = move.direction === 'out' ? [walletDebitRub, move.walletId] : [move.walletId, walletDebitRub]
      trns[trnIndex++] = {
        categoryId: 'transfer',
        date: subMonths(new Date(endDate), move.monthsAgo).getTime(),
        expenseAmount: amount,
        expenseWalletId: from,
        incomeAmount: amount,
        incomeWalletId: to,
        type: TrnType.Transfer,
        updatedAt: Date.now(),
      } satisfies TrnItem
    }

    // --- Monthly settlements: a month's net outflow of cash and the credit card ---
    for (const settlement of monthlySettlements) {
      const outflowByMonth = new Map<number, number>()
      for (const id in trns) {
        const trn = trns[id]!
        if (trn.type === TrnType.Transfer || trn.walletId !== settlement.walletId)
          continue
        const month = startOfMonth(new Date(trn.date)).getTime()
        outflowByMonth.set(month, (outflowByMonth.get(month) ?? 0) + (trn.type === TrnType.Expense ? trn.amount : -trn.amount))
      }
      for (const [month, outflow] of outflowByMonth) {
        const date = addMonths(new Date(month), settlement.monthsLater).getTime() + (settlement.day - 1) * 24 * 60 * 60 * 1000
        // Rounded up: a little is left over, as with a real withdrawal or repayment.
        const step = main === 'RUB' ? 1000 : 10
        const amount = Math.ceil(outflow / step) * step
        if (date > endDate || amount <= 0)
          continue
        trns[trnIndex++] = {
          categoryId: 'transfer',
          date,
          desc: settlement.desc[locale],
          expenseAmount: amount,
          expenseWalletId: walletDebitRub,
          incomeAmount: amount,
          incomeWalletId: settlement.walletId,
          type: TrnType.Transfer,
          updatedAt: Date.now(),
        } satisfies TrnItem
      }
    }

    // Civil-day model: snap each generated instant to its local calendar day (UTC-midnight)
    // and keep the original instant as enteredAt. See plans/civil-date-migration.md.
    for (const id in trns) {
      const trn = trns[id]!
      const instant = trn.date
      trn.date = localInstantToCivilDay(instant)
      trn.enteredAt = instant
    }

    // --- Loans: each due payment is one transfer from the loan's debit wallet (converted when the
    // currencies differ) plus its interest as the credit wallet's own expense. The plan is re-read after every payment, so a prepayment re-solves the
    // tail the way the app does. Dates are civil days already, so this runs after the snap.
    const at = (date: number) => ({ date, enteredAt: date, updatedAt: Date.now() })
    const scheduleRows: LoanScheduleRows = {}
    const loans = demoLoans.map((config) => {
      const currency = translatedData.wallets[config.walletId]!.currency
      const debitWalletId = config.debitWalletId ?? loanDebitWalletId
      /** A loan-currency amount as it leaves or reaches the debit wallet. */
      const onDebit = (amount: number) => convert(amount, currency, translatedData.wallets[debitWalletId]!.currency)
      const taken = subMonths(new Date(endDate), config.monthsAgo)
      const start = new UTCDate(taken.getFullYear(), taken.getMonth(), config.paymentDay)
      const loan = loanItemSchema.parse({
        annualRate: config.annualRate,
        debitWalletId,
        firstPaymentDate: addMonths(start, 1).getTime(),
        interestMethod: config.interestMethod,
        lateAfterDays: config.lateAfterDays,
        overpaymentMode: config.overpaymentMode,
        paymentDay: config.paymentDay,
        principalAmount: round(config.principalAmount, currency),
        scheduleType: config.scheduleType,
        startDate: start.getTime(),
        termMonths: config.termMonths,
        walletId: config.walletId,
      })
      const loanId = loanIdFor(loan.walletId)
      const params = paramsOf(loan)
      const overrides = config.bankRate === undefined ? [] : bankSchedule({ ...params, annualRate: config.bankRate }, config.interestOnly ?? [])
      for (const row of overrides)
        scheduleRows[loanScheduleRowIdFor(loanId, row.paymentNumber)] = loanScheduleRowSchema.parse({ ...row, loanId, updatedAt: Date.now() })

      trns[trnIndex++] = config.purchase
        ? { ...at(loan.startDate), amount: loan.principalAmount, categoryId: config.purchase.categoryId, desc: config.purchase.desc[locale], type: TrnType.Expense, walletId: loan.walletId } satisfies TrnItem
        : { ...at(loan.startDate), categoryId: 'transfer', expenseAmount: loan.principalAmount, expenseWalletId: loan.walletId, incomeAmount: onDebit(loan.principalAmount), incomeWalletId: debitWalletId, type: TrnType.Transfer } satisfies TrnItem

      const schedule = generateSchedule(params, overrides)
      const dueCount = schedule.filter(row => row.date <= today).length
      /** Payment number of a deviation counted back from the latest due payment. */
      const numberAgo = (ago: number | undefined) => ago === undefined ? null : dueCount - ago

      const paid: LoanTrn[] = []
      const skipped = new Set<number>()
      let prepaid = false
      let carried: { interest: number, total: number } | null = null
      const pay = (kind: LoanTrn['kind'], amount: number, date: number) => {
        const id = `demo_loan_${loan.walletId}_${paid.length}`
        paid.push({ amount, date, id, kind })
        trns[id] = kind === 'payment'
          ? { ...at(date), categoryId: 'transfer', expenseAmount: onDebit(amount), expenseWalletId: debitWalletId, incomeAmount: amount, incomeWalletId: loan.walletId, type: TrnType.Transfer } satisfies TrnItem
          : { ...at(date), amount, categoryId: kind === 'interest' ? 'loanInterest' : 'loanFine', type: TrnType.Expense, walletId: loan.walletId } satisfies TrnItem
      }

      for (;;) {
        // By status: a row caught up by an earlier payment is paid without transactions of its own.
        const row = reconcileSchedule(params, schedule, paid, today)
          .find(r => (r.status === 'scheduled' || r.status === 'overdue') && r.totalAmount > 0 && !skipped.has(r.paymentNumber))
        if (!row || row.date > today)
          break
        const n = row.paymentNumber

        if ((config.missed && n === dueCount) || n === numberAgo(config.catchUp)) {
          skipped.add(n)
          if (n !== dueCount)
            carried = { interest: row.interestPart, total: row.totalAmount }
          continue
        }
        if (n === numberAgo(config.payoff)) {
          // The whole debt left before this row plus its interest: the tail re-solves to nothing.
          pay('payment', round2(row.remainingBalance + row.principalPart + row.interestPart), row.date)
          pay('interest', row.interestPart, row.date)
          break
        }
        if (!prepaid && n === numberAgo(config.prepayment?.paymentsAgo)) {
          // Re-read the plan: under reducePayment the prepayment lowers this very payment.
          pay('payment', round(config.prepayment!.amount, currency), addDays(new UTCDate(row.date), -21).getTime())
          prepaid = true
          continue
        }

        const date = n === numberAgo(config.late) ? addDays(new UTCDate(row.date), 5).getTime() : row.date
        const interest = round2(row.interestPart + (carried?.interest ?? 0))
        // The bank takes the late fee out of the payment, so the transfer carries it on top.
        const fine = carried ? money(700, loan.walletId) : 0
        pay('payment', round2(row.totalAmount + (carried?.total ?? 0) + fine), date)
        if (interest > 0)
          pay('interest', interest, date)
        if (fine > 0)
          pay('fine', fine, date)
        carried = null
      }

      if (config.bankDebt) {
        const balance = paid.reduce((total, trn) => trn.kind === 'payment' ? total - trn.amount : total + trn.amount, loan.principalAmount)
        Object.assign(loan, { bankDebtAmount: round2(balance), bankDebtUpdatedAt: addDays(new UTCDate(today), -2).getTime() })
      }
      return loan
    })

    trnsStore.setTrns(trns)
    const loansStore = useLoansStore()
    loansStore.setLoans(Object.fromEntries(loans.map(loan => [loanIdFor(loan.walletId), loan])))
    loansStore.setScheduleRows(scheduleRows)
  }

  return {
    generateDemoData,
    isDemo,
  }
}
