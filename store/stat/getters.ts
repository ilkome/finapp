import dayjs from 'dayjs'
import { getCategoriesIds, getTransferCategoriesIds } from '~/components/categories/getCategories'
import { getTotal } from '~/components/amount/getTotal'
import { getTrnsIds } from '~/components/trns/getTrns'

export default {
  /**
   * Stat for current period
   */
  statCurrentPeriod(_state, _getters, rootState) {
    const trnsItems = rootState.trns.items
    const categoriesItems = rootState.categories.items
    const walletsItems = rootState.wallets.items
    const baseCurrencyCode = rootState.currencies.base
    const rates = rootState.currencies.rates
    const storeFilter = rootState.filter
    const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)

    // TODO: move it to a separate function getFilterParams
    const categoriesIds = rootState.filter.catsIds.length > 0
      ? getCategoriesIds(rootState.filter.catsIds, categoriesItems)
      : null
    const walletsIds = storeFilter.walletsIds.length > 0
      ? storeFilter.walletsIds
      : null

    const trnsIds = getTrnsIds({
      categoriesIds,
      date: storeFilter.date,
      periodName: storeFilter.period,
      trnsItems,
      walletsIds,
    })

    function getRootCategoryIdFromTrnId(trnId) {
      const categories = rootState.categories.items
      const trnCategoryId = trnsItems[trnId].categoryId
      const trnCategoryParentId = categories[trnCategoryId].parentId
      return trnCategoryParentId || trnCategoryId
    }

    function getCategoriesIdsWithTrnsIds() {
      const filterCategoryId = rootState.filter.categoryId
      const categoriesWithTrnsIds = {}

      // TODO: map, filter
      for (const trnId of trnsIds) {
        if (trnsItems[trnId]) {
          let categoryId
          filterCategoryId
            ? categoryId = trnsItems[trnId].categoryId
            : categoryId = getRootCategoryIdFromTrnId(trnId)

          const isTransferCategory = transferCategoriesIds.includes(categoryId)
          if (isTransferCategory)
            continue

          !categoriesWithTrnsIds[categoryId]
            ? categoriesWithTrnsIds[categoryId] = [trnId]
            : categoriesWithTrnsIds[categoryId].push(trnId)
        }
      }

      return categoriesWithTrnsIds
    }

    const categoriesWithTrnsIds = getCategoriesIdsWithTrnsIds()

    const total = getTotal({
      baseCurrencyCode,
      rates,
      trnsIds,
      trnsItems,
      walletsIds: [rootState.filter.walletsIds],
      walletsItems,
    })

    // count total in categories
    const categoriesTotal = {}
    for (const categoryId in categoriesWithTrnsIds) {
      const trnsIdsInCategory = categoriesWithTrnsIds[categoryId]

      const totalInCategory = getTotal({
        baseCurrencyCode,
        rates,
        trnsIds: trnsIdsInCategory,
        trnsItems,
        walletsIds: [rootState.filter.walletsIds],
        walletsItems,
      })

      // totalInCategory
      categoriesTotal[categoryId] = {
        income: totalInCategory.incomeTransactions,
        expense: totalInCategory.expenseTransactions,
      }
    }

    // separate categories by income and expense
    const statIncome = {}
    const statExpense = {}
    for (const categoryId in categoriesWithTrnsIds) {
      const total = categoriesTotal[categoryId]
      if (total.income > 0)
        statIncome[categoryId] = total
      if (total.expense > 0)
        statExpense[categoryId] = total
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
    const incomeCategoriesIds = sortCategoriesByTotal(statIncome, 'income')
    const expenseCategoriesIds = sortCategoriesByTotal(statExpense, 'expense')

    // get first item in sorted categories
    function getBiggestAmount(categoriesTotal, categoriesIds, typeName) {
      const biggestAmount = categoriesIds[0]
      return (categoriesTotal[biggestAmount] && Math.abs(categoriesTotal[biggestAmount][typeName])) || 0
    }

    // biggest
    const expenseBiggest = getBiggestAmount(categoriesTotal, expenseCategoriesIds, 'expense')
    const incomeBiggest = getBiggestAmount(categoriesTotal, incomeCategoriesIds, 'income')

    const stat = {
      categories: categoriesTotal,
      total: total.sumTransactions,
      expense: {
        biggest: expenseBiggest,
        categoriesIds: expenseCategoriesIds,
        total: total.expenseTransactions,
      },
      income: {
        biggest: incomeBiggest,
        categoriesIds: incomeCategoriesIds,
        total: total.incomeTransactions,
      },
    }

    return stat
  },

  /**
   * Stat average
   */
  statAverage(_state, _getters, rootState, rootGetters) {
    const trnsItems = rootState.trns.items
    const walletsItems = rootState.wallets.items
    const categoriesItems = rootState.categories.items
    const baseCurrencyCode = rootState.currencies.base
    const rates = rootState.currencies.rates
    const trnsIds = rootGetters['trns/selectedTrnsIds']
    const periodName = rootState.filter.period
    const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)

    if (periodName === 'all')
      return

    const oldestTrn = trnsItems[rootGetters['trns/firstCreatedTrnId']]
    if (!oldestTrn)
      return

    const oldestTrnDate = dayjs(oldestTrn.date).endOf(periodName)
    let periodsToShow = dayjs().endOf(periodName).diff(oldestTrnDate, periodName) + 1
    periodsToShow = rootState.chart.periods[periodName].showedPeriods >= periodsToShow
      ? periodsToShow
      : rootState.chart.periods[periodName].showedPeriods

    let income = 0
    let expense = 0

    // Start from 1 to remove last period from average
    for (let period = 1; period < periodsToShow; period++) {
      const dateStartOfPeriod = dayjs().subtract(period, periodName).startOf(periodName)
      const dateEndOfPeriod = dayjs().subtract(period, periodName).endOf(periodName)

      const trnsIdsInPeriod = trnsIds.filter(trnId =>
        trnsItems[trnId].date >= dateStartOfPeriod
        && trnsItems[trnId].date <= dateEndOfPeriod
        && !transferCategoriesIds.includes(trnsItems[trnId].categoryId),
      )

      const total = getTotal({
        baseCurrencyCode,
        rates,
        trnsIds: trnsIdsInPeriod,
        trnsItems,
        walletsItems,
      })

      income += total.incomeTransactions
      expense += total.expenseTransactions
    }

    // When just this period and last
    const delimiter = periodsToShow - 1
    if (delimiter === 1)
      return { income: 0, expense: 0, sum: 0 }

    return {
      income: Math.ceil(income / delimiter),
      expense: Math.ceil(expense / delimiter),
      sum: Math.ceil((income - expense) / delimiter),
    }
  },

  isOldestPeriodSelected(_state, _getters, rootState, rootGetters) {
    if (!rootGetters['trns/hasTrns'])
      return false

    if (dayjs(rootState.filter.date).isSame(dayjs(), rootState.filter.period))
      return true
  },

  isNewestPeriodSelected(state, _getters, rootState, rootGetters) {
    if (!rootGetters['trns/hasTrns'])
      return true

    const trns = rootState.trns.items
    const firstCreatedTrnIdFromSelectedTrns = rootGetters['trns/firstCreatedTrnIdFromSelectedTrns']
    const firstCreatedTrn = trns[firstCreatedTrnIdFromSelectedTrns]
    if (!firstCreatedTrn)
      return true

    const firstCreatedTrnDate = dayjs(firstCreatedTrn.date).startOf(state.period).valueOf()
    const filterDate = dayjs(rootState.filter.date).startOf(state.period).valueOf()

    if (filterDate <= firstCreatedTrnDate)
      return true
  },
}
