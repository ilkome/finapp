import { addMonths, getMonth, startOfMonth, startOfYear, subYears } from 'date-fns'
import localforage from 'localforage'

import type { Categories } from '~/components/categories/types'
import type { LocaleSlug } from '~/components/locale/types'
import type { TrnItem, Trns } from '~/components/trns/types'
import type { Wallets } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import currencies from '~/components/demo/currencies.json'
import { data, expenseRules, incomeRules, oneOffExpenses, salaryConfig, transferRules, walletDebitRub } from '~/components/demo/data'
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

/** Pick a random item from an array using weighted probabilities. */
function weightedPick<T extends { weight: number }>(rules: T[]): T {
  const totalWeight = rules.reduce((sum, r) => sum + r.weight, 0)
  let rand = Math.random() * totalWeight
  for (const rule of rules) {
    rand -= rule.weight
    if (rand <= 0)
      return rule
  }
  return rules.at(-1)!
}

/** Random integer in [min, max]. */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Random item from array. */
function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

/** Round to nearest 10. */
function roundAmount(n: number): number {
  return Math.round(n / 10) * 10
}

/** Random timestamp within a specific month of a given year. */
function randDateInMonth(year: number, month: number): number {
  const start = new Date(year, month, 1).getTime()
  const end = new Date(year, month + 1, 0).getTime()
  return start + Math.random() * (end - start)
}

export function useDemo() {
  const isDemo = useCookie('finapp.isDemo')
  const categoriesStore = useCategoriesStore()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const trnsStore = useTrnsStore()

  async function generateDemoData(locale: LocaleSlug) {
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

    useUserStore().setUserBaseCurrency('USD')
    currenciesStore.setRates(currencies)
    categoriesStore.setCategories(translatedData.categories)
    walletsStore.setWallets(translatedData.wallets)

    const startDate = subYears(startOfYear(new Date()), config.subtractYears).getTime()
    const endDate = Date.now()
    const activeWalletIds = walletsStore.sortedIds.filter(id => !data.wallets[id]?.isArchived)

    const trns: Trns = {}
    let trnIndex = 0

    // --- Expenses (with seasonality) ---
    for (let i = 0; i < config.expenseCount; i++) {
      const rule = weightedPick(expenseRules)
      let date = startDate + Math.random() * (endDate - startDate)

      // Seasonality: if rule has seasonMonths, re-roll date until it falls in an allowed month
      // (with a fallback to avoid infinite loops)
      if (rule.seasonMonths) {
        let attempts = 0
        while (!rule.seasonMonths.includes(getMonth(date)) && attempts < 20) {
          date = startDate + Math.random() * (endDate - startDate)
          attempts++
        }
      }

      const amount = roundAmount(randInt(rule.min, rule.max))
      const walletId = rule.walletIds ? randItem(rule.walletIds) : randItem(activeWalletIds)
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

        const amount = roundAmount(randInt(oneOff.min, oneOff.max))
        const walletId = oneOff.walletIds ? randItem(oneOff.walletIds) : randItem(activeWalletIds)

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
      const salaryDate = month.getTime() + 4 * 24 * 60 * 60 * 1000 + Math.random() * 2 * 24 * 60 * 60 * 1000
      if (salaryDate < endDate) {
        const isRaised = monthIndex >= salaryConfig.raiseAfterMonths
        const min = isRaised ? salaryConfig.raisedMin : salaryConfig.startMin
        const max = isRaised ? salaryConfig.raisedMax : salaryConfig.startMax
        const amount = roundAmount(randInt(min, max))

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
      const amount = roundAmount(randInt(rule.min, rule.max))
      const walletId = rule.walletIds ? randItem(rule.walletIds) : randItem(activeWalletIds)
      const desc = rule.desc ? rule.desc[locale] : undefined

      trns[trnIndex++] = {
        amount,
        categoryId: rule.categoryId,
        date: startDate + Math.random() * (endDate - startDate),
        ...(desc ? { desc } : {}),
        type: TrnType.Income,
        updatedAt: Date.now(),
        walletId,
      } satisfies TrnItem
    }

    // --- Transfers ---
    for (let i = 0; i < config.transferCount; i++) {
      const rule = weightedPick(transferRules)
      const incomeAmount = roundAmount(randInt(rule.incomeAmountMin, rule.incomeAmountMax))

      // Compute expense amount based on currency pair
      const expenseWallet = data.wallets[rule.expenseWalletId]!
      const incomeWallet = data.wallets[rule.incomeWalletId]!
      let expenseAmount = incomeAmount
      if (expenseWallet.currency !== incomeWallet.currency) {
        const expenseRate = (currencies as Record<string, number>)[expenseWallet.currency] ?? 1
        const incomeRate = (currencies as Record<string, number>)[incomeWallet.currency] ?? 1
        expenseAmount = roundAmount(Math.round(incomeAmount * expenseRate / incomeRate))
      }

      const desc = rule.desc ? rule.desc[locale] : undefined

      trns[trnIndex++] = {
        categoryId: 'transfer',
        date: startDate + Math.random() * (endDate - startDate),
        ...(desc ? { desc } : {}),
        expenseAmount: Math.max(1, expenseAmount),
        expenseWalletId: rule.expenseWalletId,
        incomeAmount,
        incomeWalletId: rule.incomeWalletId,
        type: TrnType.Transfer,
        updatedAt: Date.now(),
      } satisfies TrnItem
    }

    // --- Adjustments ---
    for (let i = 0; i < config.adjustmentsCount; i++) {
      const amount = roundAmount(randInt(1000, 20000))
      const walletId = randItem(activeWalletIds)
      const type = Math.random() < 0.5 ? TrnType.Income : TrnType.Expense

      trns[trnIndex++] = {
        amount,
        categoryId: 'adjustment',
        date: startDate + Math.random() * (endDate - startDate),
        desc: locale === 'ru' ? 'Корректировка баланса' : 'Balance adjustment',
        type,
        updatedAt: Date.now(),
        walletId,
      } satisfies TrnItem
    }

    trnsStore.setTrns(trns)
  }

  return {
    generateDemoData,
    isDemo,
  }
}
