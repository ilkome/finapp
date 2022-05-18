import dayjs from 'dayjs'
import type { TotalReturns } from '~/components/trns/getTotal'
import { getCatsIds, getTransferCategoriesIds } from '~/components/categories/getCategories'
import { getTotal } from '~/components/trns/getTotal'
import { getTrnsIds } from '~/components/trns/getTrns'

export default {
  statAverage(_state, _getters, rootState, rootGetters) {
    const trnsItems = rootState.trns.items
    const walletsItems = rootState.wallets.items
    const baseRate = rootState.currencies.base
    const rates = rootState.currencies.rates
    const transferCategoryId = rootGetters['categories/transferCategoryId']
    const trnsIds = rootGetters['trns/selectedTrnsIds']
    const periodName = rootState.filter.period
    if (periodName === 'all')
      return

    const oldestTrn = trnsItems[rootGetters['trns/firstCreatedTrnId']]
    if (!oldestTrn)
      return

    const oldestTrnDate = dayjs(oldestTrn.date).endOf(periodName)
    let periodsToShow = dayjs().endOf(periodName).diff(oldestTrnDate, periodName) + 1
    periodsToShow = rootState.chart.periods[periodName].showedPeriods >= periodsToShow ? periodsToShow : rootState.chart.periods[periodName].showedPeriods

    const statPeriods: Record<string, { date: number; total: TotalReturns }> = {}

    // Start from 1 to remove last period from average
    for (let period = 1; period < periodsToShow; period++) {
      const dateStartOfPeriod = dayjs().subtract(period, periodName).startOf(periodName)
      const dateEndOfPeriod = dayjs().subtract(period, periodName).endOf(periodName)
      const ids = trnsIds
        .filter(trnId =>
          trnsItems[trnId].date >= dateStartOfPeriod
          && trnsItems[trnId].date <= dateEndOfPeriod
          && trnsItems[trnId].categoryId !== transferCategoryId,
        )

      const total = getTotal({
        baseRate,
        rates,
        trnsIds: ids,
        trnsItems,
        walletsItems,
      })

      statPeriods[dateStartOfPeriod.valueOf()] = {
        date: dateStartOfPeriod.valueOf(),
        total,
      }
    }

    let income = 0
    let expense = 0
    let sum = 0
    let periodsCounter = 0

    for (const idx in statPeriods) {
      const period = statPeriods[idx]
      periodsCounter += 1

      income += period.total.incomeTransactions
      expense += period.total.expenseTransactions
      sum = income - expense
    }

    const delimiter = periodsCounter

    // When just this period and last
    if (delimiter === 1) {
      return {
        income: 0,
        expense: 0,
        sum: 0,
      }
    }

    return {
      income: Math.ceil(income / delimiter),
      expense: Math.ceil(expense / delimiter),
      sum: Math.ceil(sum / delimiter),
    }
  },

  isFirstPeriodSelected(state, getters, rootState, rootGetters) {
    if (rootGetters['trns/hasTrns']) {
      if (dayjs(rootState.filter.date).isSame(dayjs(), rootState.filter.period))
        return true
    }
    else {
      return true
    }
  },

  isLastPeriodSelected(state, getters, rootState, rootGetters) {
    if (rootGetters['trns/hasTrns']) {
      const trns = rootState.trns.items
      const firstCreatedTrnIdFromSelectedTrns = rootGetters['trns/firstCreatedTrnIdFromSelectedTrns']
      const firstCreatedTrn = trns[firstCreatedTrnIdFromSelectedTrns]
      if (!firstCreatedTrn)
        return
      const firstCreatedTrnDate = dayjs(firstCreatedTrn.date).startOf(state.period).valueOf()
      const filterDate = dayjs(rootState.filter.date).startOf(state.period).valueOf()

      if (filterDate <= firstCreatedTrnDate)
        return true
    }
    else {
      return true
    }
  },

  statCurrentPeriod(_state, _getters, rootState, rootGetters) {
    const trnsItems = rootState.trns.items
    const categoriesItems = rootState.categories.items
    const walletsItems = rootState.wallets.items
    const baseRate = rootState.currencies.base
    const rates = rootState.currencies.rates
    const storeFilter = rootState.filter
    // const transferCategoriesIds = getTransferCategoriesIds(categoriesItems.value)

    const categoriesIds = rootState.filter.catsIds.length > 0 ? getCatsIds(rootState.filter.catsIds, categoriesItems) : null
    const walletsIds = storeFilter.walletsIds.length > 0 ? storeFilter.walletsIds : null

    const trnsIds = getTrnsIds({
      trnsItems,
      walletsIds,
      categoriesIds,
      periodName: storeFilter.period,
      date: storeFilter.date,
    })

    /**
      * Return root category ID from trnId
      *
      * @param {String} trnId
      * @return {String} root categoryId
    */
    function getRootCategoryIdFromTrnId(trnId) {
      const categories = rootState.categories.items
      const wallets = rootState.wallets.items
      const trnCategoryId = trnsItems[trnId].categoryId

      if (!wallets[trnsItems[trnId].walletId] && !wallets[trnsItems[trnId].incomeWalletId] && !wallets[trnsItems[trnId].expenseWalletId]) {
        console.log('no wallet for trn', trnId, trnsItems[trnId])
        console.log('walletId', trnsItems[trnId].walletId)
        console.log(`https://finapp-17474.firebaseio.com/users/${rootState.user.user.uid}/trns/${trnId}`)
      }

      if (!categories[trnCategoryId]) {
        console.log('no category for trn', trnId, trnsItems[trnId], categories[trnCategoryId])
        console.log(`https://finapp-17474.firebaseio.com/users/${rootState.user.user.uid}/trns/${trnId}`)
        return trnCategoryId
      }

      const trnCategoryParentId = categories[trnCategoryId].parentId
      return trnCategoryParentId || trnCategoryId
    }

    function getCatsIdsWithTrnsIds() {
      const filterCategoryId = rootState.filter.categoryId
      const transferCategoryId = rootGetters['categories/transferCategoryId']
      const categoriesWithTrnsIds = {}

      for (const trnId of trnsIds) {
        if (trnsItems[trnId]) {
          let categoryId
          filterCategoryId
            ? categoryId = trnsItems[trnId].categoryId
            : categoryId = getRootCategoryIdFromTrnId(trnId)

          // Push trnId to category. Exclude transfer category
          // TODO: place transfer category in one place
          if (categoryId !== transferCategoryId) {
            if (!categoriesWithTrnsIds[categoryId])
              categoriesWithTrnsIds[categoryId] = [trnId]

            else
              categoriesWithTrnsIds[categoryId].push(trnId)
          }
        }
      }

      return categoriesWithTrnsIds
    }

    const categoriesWithTrnsIds = getCatsIdsWithTrnsIds()

    const total = getTotal({
      baseRate,
      rates,
      trnsIds,
      trnsItems,
      walletsIds: [rootState.filter.walletsIds],
      // transferCategoriesIds,
      walletsItems,
    })

    // count total in categories
    const categoriesTotal = {}
    for (const categoryId in categoriesWithTrnsIds) {
      const trnsIdsInCategory = categoriesWithTrnsIds[categoryId]

      const totalInCategory = getTotal({
        baseRate,
        rates,
        trnsIds: trnsIdsInCategory,
        trnsItems,
        walletsIds: [rootState.filter.walletsIds],
        walletsItems,
      })

      // totalInCategory
      categoriesTotal[categoryId] = {
        incomes: totalInCategory.incomeTransactions,
        expenses: totalInCategory.expenseTransactions,
      }
    }

    // separate categories by incomes and expenses
    const statIncomes = {}
    const statExpenses = {}
    for (const categoryId in categoriesWithTrnsIds) {
      const total = categoriesTotal[categoryId]
      if (total.incomes > 0)
        statIncomes[categoryId] = total
      if (total.expenses > 0)
        statExpenses[categoryId] = total
    }

    // sort categories amount
    function sortCategoriesByTotal(categories, typeName) {
      const categoriesIds = Object.keys(categories)
      let sortedCategoriesIds = []

      if (categoriesIds.length) {
        sortedCategoriesIds = categoriesIds.sort((a, b) => {
          if (categories[a][typeName] > categories[b][typeName])
            return -1
          if (categories[a][typeName] < categories[b][typeName])
            return 1
          return 0
        })
      }

      return sortedCategoriesIds
    }

    // sorted
    const incomesCategoriesIds = sortCategoriesByTotal(statIncomes, 'incomes')
    const expensesCategoriesIds = sortCategoriesByTotal(statExpenses, 'expenses')

    // get first item in sorted categories
    function getBiggestAmount(categoriesTotal, categoriesIds, typeName) {
      const biggestAmount = categoriesIds[0]
      return (categoriesTotal[biggestAmount] && Math.abs(categoriesTotal[biggestAmount][typeName])) || 0
    }

    // biggest
    const expensesBiggest = getBiggestAmount(categoriesTotal, expensesCategoriesIds, 'expenses')
    const incomesBiggest = getBiggestAmount(categoriesTotal, incomesCategoriesIds, 'incomes')

    const stat = {
      categories: categoriesTotal,
      total: total.sumTransactions,
      expenses: {
        biggest: expensesBiggest,
        categoriesIds: expensesCategoriesIds,
        total: total.expenseTransactions,
      },
      incomes: {
        biggest: incomesBiggest,
        categoriesIds: incomesCategoriesIds,
        total: total.incomeTransactions,
      },
    }

    return stat
  },
}
