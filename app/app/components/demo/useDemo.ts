import { UTCDate } from '@date-fns/utc'
import { addMonths, getMonth, startOfMonth, startOfYear, subMonths, subYears } from 'date-fns'
import localforage from 'localforage'
import { markDataSchemaCurrent } from '~~/services/powersync/db'
import { localInstantToCivilDay } from '~~/utils/date/civil'

import type { Categories } from '~/components/categories/types'
import type { LocaleSlug } from '~/components/locale/types'
import type { TrnItem, Trns } from '~/components/trns/types'
import type { Wallets } from '~/components/wallets/types'

import { amountToMinor, formatAmount, scaleOf } from '~/components/amount/utils'
import { useBankReportsStore } from '~/components/bankReports/useBankReportsStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { buildDemoLoans } from '~/components/demo/buildDemoLoans'
import currencies from '~/components/demo/currencies.json'
import { data, debtMoves, expenseRules, foreignCurrency, incomeRules, mainCurrency, monthlySettlements, oneOffExpenses, randomCryptoCurrencies, randomFiatCurrencies, salaryConfig, transferRules, walletCashRub, walletCreditRub, walletDebitRub, walletRandomCrypto, walletRandomFiat, walletStudentLoan, walletUsd } from '~/components/demo/data'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { trnWalletDelta } from '~/components/trns/types'
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

// Performance runs need a history the size of a real account. A run sets `window.__finappDemoScale`
// before the app boots (like the seed): N times the years, the transactions and the categories the
// rules spend in (each gets N - 1 copies). Without it the demo stays as it is.
function readScale(): number {
  const scale = import.meta.client ? (window as { __finappDemoScale?: number }).__finappDemoScale : undefined
  return scale && scale > 1 ? Math.floor(scale) : 1
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

function roundAmount(n: number): number {
  return Math.round(n / 10) * 10
}

const rates = currencies as Record<string, number>

/** Converts minor units at the demo rates (units per 1 USD) into minor units of `to`. */
function convert(amount: number, from: string, to: string): number {
  if (from === to)
    return amount
  return Math.round(amount / (rates[from] ?? 1) * (rates[to] ?? 1) * 10 ** (scaleOf(to) - scaleOf(from)))
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
    const scale = readScale()
    await localforage.clear()
    // Freshly generated data is of the current schema; the boot check must not drop it as outdated.
    markDataSchemaCurrent()

    const translatedData: {
      categories: Categories
      wallets: Wallets
    } = {
      categories: Object.entries(data.categories).reduce((acc, [id, category]) => {
        acc[id] = { ...category, name: category.name[locale] }
        return acc
      }, {} as Categories),
      wallets: Object.entries(data.wallets).reduce((acc, [id, wallet]) => {
        const { currency, desc, ...rest } = wallet
        acc[id] = { ...rest, createdAt: wallet.updatedAt ?? Date.now(), currencyCode: currency, description: desc[locale], name: wallet.name[locale], ...(wallet.creditLimit !== undefined ? { creditLimit: amountToMinor(wallet.creditLimit, currency) } : {}) } as Wallets[string]
        return acc
      }, {} as Wallets),
    }

    const main = mainCurrency[locale]
    const foreign = foreignCurrency[locale]
    for (const wallet of Object.values(translatedData.wallets)) {
      if (wallet.currencyCode === 'RUB')
        wallet.currencyCode = main
    }
    Object.assign(translatedData.wallets[walletUsd]!, { currencyCode: foreign, name: locale === 'ru' ? `Счёт ${foreign}` : `${foreign} account` })
    translatedData.wallets[walletStudentLoan]!.currencyCode = foreign
    const currencyOf = (walletId: string) => translatedData.wallets[walletId]!.currencyCode
    /** A RUB-scale amount from data.ts in minor units of the wallet it lands on. */
    const money = (rubScale: number, walletId: string) => convert(amountToMinor(roundAmount(rubScale), 'RUB'), 'RUB', currencyOf(walletId))
    /** A RUB-scale round figure (a limit, a principal) kept round in the main currency, in its minor units. */
    const round = (rubScale: number, currency = main) => {
      const step = amountToMinor(currency === 'RUB' ? 1000 : 100, currency)
      return Math.round(convert(amountToMinor(rubScale, 'RUB'), 'RUB', currency) / step) * step
    }

    const fiat = randItem(randomFiatCurrencies.filter(code => code !== foreign))
    Object.assign(translatedData.wallets[walletRandomFiat]!, { currencyCode: fiat, name: locale === 'ru' ? `Счёт ${fiat}` : `${fiat} account` })
    const crypto = randItem(Object.keys(randomCryptoCurrencies))
    Object.assign(translatedData.wallets[walletRandomCrypto]!, { currencyCode: crypto, name: randomCryptoCurrencies[crypto] })

    const today = localInstantToCivilDay(Date.now())
    const cardDue = addMonths(new UTCDate(today), 1)
    const creditLimit = round(300000)
    Object.assign(translatedData.wallets[walletCreditRub]!, {
      creditLimit,
      description: `${locale === 'ru' ? 'Лимит' : 'Credit limit'} ${formatAmount(creditLimit, main, { minorDisplay: 'never' })}`,
    })
    const cardReport = {
      createdAt: today,
      graceDebtAmount: money(52000, walletCreditRub),
      graceEndDate: new UTCDate(cardDue.getFullYear(), cardDue.getMonth() + 1, 10).getTime(),
      minPaymentAmount: money(8000, walletCreditRub),
      minPaymentDueDate: new UTCDate(cardDue.getFullYear(), cardDue.getMonth(), 25).getTime(),
      minPaymentPeriodStartDate: today,
      statementDate: new UTCDate(cardDue.getFullYear(), cardDue.getMonth() - 1, 25).getTime(),
      updatedAt: today,
    }

    const categoryCopies = new Map<string, string[]>()
    if (scale > 1) {
      for (const id of new Set([...expenseRules, ...incomeRules].map(rule => rule.categoryId))) {
        const base = translatedData.categories[id]!
        const ids = Array.from({ length: scale - 1 }, (_, n) => `${id}_${n + 2}`)
        ids.forEach((copyId, n) => translatedData.categories[copyId] = { ...base, name: `${base.name} ${n + 2}` })
        categoryCopies.set(id, [id, ...ids])
      }
    }
    const categoryOf = (id: string) => scale > 1 ? randItem(categoryCopies.get(id) ?? [id]) : id

    useUserStore().setUserBaseCurrency(main)
    currenciesStore.setRates(currencies)
    categoriesStore.setCategories(translatedData.categories)
    walletsStore.setWallets(translatedData.wallets)

    const startDate = subYears(startOfYear(new Date()), config.subtractYears * scale).getTime()
    const endDate = Date.now()
    // Everyday expenses are paid from the main-currency wallets; the foreign and crypto wallets are
    // only reached by transfers and the rules that name them.
    const spendingWalletIds = [walletCashRub, walletDebitRub, walletCreditRub]

    const trns: Trns = {}
    let trnIndex = 0

    // --- Expenses (with seasonality) ---
    for (let i = 0; i < config.expenseCount * scale; i++) {
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
        categoryId: categoryOf(rule.categoryId),
        createdAt: date,
        date,
        ...(desc ? { description: desc } : {}),
        fromAmount: amount,
        fromWalletId: walletId,
        type: 'expense',
        updatedAt: Date.now(),
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
          categoryId: oneOff.categoryId,
          createdAt: date,
          date,
          description: oneOff.desc[locale],
          fromAmount: amount,
          fromWalletId: walletId,
          type: 'expense',
          updatedAt: Date.now(),
        } satisfies TrnItem
      }
    }

    // --- Incomes: salary with a yearly raise ---
    const startMonth = startOfMonth(new Date(startDate))
    let month = startMonth
    let monthIndex = 0

    while (month.getTime() < endDate) {
      const salaryDate = month.getTime() + 4 * 24 * 60 * 60 * 1000 + random() * 2 * 24 * 60 * 60 * 1000
      if (salaryDate < endDate) {
        const isRaised = monthIndex >= salaryConfig.raiseAfterMonths
        const min = isRaised ? salaryConfig.raisedMin : salaryConfig.startMin
        const max = isRaised ? salaryConfig.raisedMax : salaryConfig.startMax
        const amount = money(randInt(min, max), salaryConfig.walletId)

        trns[trnIndex++] = {
          categoryId: salaryConfig.categoryId,
          createdAt: salaryDate,
          date: salaryDate,
          description: salaryConfig.desc[locale],
          toAmount: amount,
          toWalletId: salaryConfig.walletId,
          type: 'income',
          updatedAt: Date.now(),
        } satisfies TrnItem
      }
      month = addMonths(month, 1)
      monthIndex++
    }

    // Other income (freelance, investments, cashback)
    const salaryMonths = Math.floor((endDate - startDate) / (30 * 24 * 60 * 60 * 1000))
    const remainingIncome = config.incomeCount * scale - salaryMonths
    for (let i = 0; i < Math.max(0, remainingIncome); i++) {
      const rule = weightedPick(incomeRules)
      const walletId = rule.walletIds ? randItem(rule.walletIds) : walletDebitRub
      const amount = money(randInt(rule.min, rule.max), walletId)
      const desc = rule.desc ? rule.desc[locale] : undefined

      const date = startDate + random() * (endDate - startDate)
      trns[trnIndex++] = {
        categoryId: categoryOf(rule.categoryId),
        createdAt: date,
        date,
        ...(desc ? { description: desc } : {}),
        toAmount: amount,
        toWalletId: walletId,
        type: 'income',
        updatedAt: Date.now(),
      } satisfies TrnItem
    }

    // --- Transfers ---
    for (let i = 0; i < config.transferCount * scale; i++) {
      const rule = weightedPick(transferRules)
      const fromAmount = money(randInt(rule.amountMin, rule.amountMax), rule.expenseWalletId)
      const desc = rule.desc ? rule.desc[locale] : undefined
      const date = startDate + random() * (endDate - startDate)

      trns[trnIndex++] = {
        createdAt: date,
        date,
        ...(desc ? { description: desc } : {}),
        fromAmount,
        fromWalletId: rule.expenseWalletId,
        toAmount: convert(fromAmount, currencyOf(rule.expenseWalletId), currencyOf(rule.incomeWalletId)),
        toWalletId: rule.incomeWalletId,
        type: 'transfer',
        updatedAt: Date.now(),
      } satisfies TrnItem
    }

    // --- Adjustments ---
    for (let i = 0; i < config.adjustmentsCount * scale; i++) {
      const walletId = randItem(spendingWalletIds)
      const amount = money(randInt(1000, 20000), walletId)
      const side = random() < 0.5 ? { toAmount: amount, toWalletId: walletId } : { fromAmount: amount, fromWalletId: walletId }
      const date = startDate + random() * (endDate - startDate)

      trns[trnIndex++] = {
        ...side,
        createdAt: date,
        date,
        description: locale === 'ru' ? 'Корректировка баланса' : 'Balance adjustment',
        type: 'adjustment',
        updatedAt: Date.now(),
      } satisfies TrnItem
    }

    // --- Debts between people ---
    const debtBalances = new Map<string, number>()
    for (const move of debtMoves) {
      const held = debtBalances.get(move.walletId) ?? 0
      const amount = move.amount === 0 ? Math.abs(held) : round(move.amount)
      debtBalances.set(move.walletId, held + (move.direction === 'out' ? amount : -amount))
      const [from, to] = move.direction === 'out' ? [walletDebitRub, move.walletId] : [move.walletId, walletDebitRub]
      const date = subMonths(new Date(endDate), move.monthsAgo).getTime()
      trns[trnIndex++] = {
        createdAt: date,
        date,
        fromAmount: amount,
        fromWalletId: from,
        toAmount: amount,
        toWalletId: to,
        type: 'transfer',
        updatedAt: Date.now(),
      } satisfies TrnItem
    }

    // --- Monthly settlements: a month's net outflow of cash and the credit card ---
    for (const settlement of monthlySettlements) {
      const outflowByMonth = new Map<number, number>()
      for (const id in trns) {
        const trn = trns[id]!
        if (trn.type === 'transfer')
          continue
        const delta = trnWalletDelta(trn, settlement.walletId)
        if (!delta)
          continue
        const month = startOfMonth(new Date(trn.date)).getTime()
        outflowByMonth.set(month, (outflowByMonth.get(month) ?? 0) - delta)
      }
      for (const [month, outflow] of outflowByMonth) {
        const date = addMonths(new Date(month), settlement.monthsLater).getTime() + (settlement.day - 1) * 24 * 60 * 60 * 1000
        // Rounded up: a little is left over, as with a real withdrawal or repayment.
        const step = amountToMinor(main === 'RUB' ? 1000 : 10, main)
        const amount = Math.ceil(outflow / step) * step
        if (date > endDate || amount <= 0)
          continue
        trns[trnIndex++] = {
          createdAt: date,
          date,
          description: settlement.desc[locale],
          fromAmount: amount,
          fromWalletId: walletDebitRub,
          toAmount: amount,
          toWalletId: settlement.walletId,
          type: 'transfer',
          updatedAt: Date.now(),
        } satisfies TrnItem
      }
    }

    // Each generated instant becomes its local civil day; the instant stays as createdAt.
    for (const id in trns) {
      const trn = trns[id]!
      trn.createdAt = Math.round(trn.date)
      trn.date = localInstantToCivilDay(trn.date)
    }

    const built = buildDemoLoans({ convert, currencyOf, locale, money, round, today })
    Object.assign(trns, built.trns)

    trnsStore.setTrns(trns)
    const loansStore = useLoansStore()
    loansStore.setLoans(built.loans)
    loansStore.setScheduleOverrides(built.scheduleOverrides)
    useBankReportsStore().setBankReports({ ...built.bankReports, [walletCreditRub]: cardReport })
  }

  return {
    generateDemoData,
    isDemo,
  }
}
