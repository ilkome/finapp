import dayjs from 'dayjs'
import { getCatsIds } from '~/components/categories/getCategories'
import { getTrnsIds } from '~/components/trns/functions/getTrns'

export default {
  /**
    * Average stat used statByPeriods.
    *
    * @return {Object} Object with total
    * @return {Number} return[date].incomes
    * @return {Number} return[date].expenses
    * @return {Number} return[date].total
  */
  statAverage(_state, getters) {
    const statPeriods = getters.statByPeriods

    let incomes = 0
    let expenses = 0
    let total = 0
    const periodsCounter = {
      incomes: 0,
      expenses: 0,
      total: 0,
    }

    for (const idx in statPeriods) {
      const period = statPeriods[idx]
      incomes = incomes + period.incomes
      periodsCounter.incomes = periodsCounter.incomes + 1

      expenses = expenses + period.expenses
      periodsCounter.expenses = periodsCounter.expenses + 1

      if (incomes > 0 && expenses > 0) {
        total = incomes - expenses
        periodsCounter.total = periodsCounter.total + 1
      }
    }

    return {
      incomes: incomes !== 0 ? Math.ceil(incomes / periodsCounter.incomes) : 0,
      expenses: expenses !== 0 ? Math.ceil(expenses / periodsCounter.expenses) : 0,
      total: total !== 0 ? Math.ceil(total / periodsCounter.total) : 0,
    }
  },

  /**
    * Stat by periods with period name and total.
    *
    * @return {Object} Object with periods
    * @return {String} return[date].date - valueOf date
    * @return {Number} return[date].incomes
    * @return {Number} return[date].expenses
    * @return {Number} return[date].total
  */
  statByPeriods(_state, _getters, rootState, rootGetters) {
    const trns = rootState.trns.items
    const transferCategoryId = rootGetters['categories/transferCategoryId']
    const trnsIds = rootGetters['trns/selectedTrnsIds']
    const periodName = rootState.filter.period
    if (periodName === 'all')
      return

    const oldestTrn = trns[rootGetters['trns/firstCreatedTrnId']]
    if (!oldestTrn)
      return

    const oldestTrnDate = dayjs(oldestTrn.date).endOf(periodName)
    let periodsToShow = dayjs().endOf(periodName).diff(oldestTrnDate, periodName) + 1
    periodsToShow = rootState.chart.periods[periodName].showedPeriods >= periodsToShow ? periodsToShow : rootState.chart.periods[periodName].showedPeriods

    const stat = {}
    // Start from 1 to remove last period from average
    for (let period = 1; period < periodsToShow; period++) {
      const dateStartOfPeriod = dayjs().subtract(period, periodName).startOf(periodName)
      const dateEndOfPeriod = dayjs().subtract(period, periodName).endOf(periodName)
      const ids = trnsIds
        .filter(trnId =>
          trns[trnId].date >= dateStartOfPeriod
          && trns[trnId].date <= dateEndOfPeriod
          && trns[trnId].categoryId !== transferCategoryId,
        )

      stat[dateStartOfPeriod.valueOf()] = {
        date: dateStartOfPeriod.valueOf(),
        ...rootGetters['trns/getTotalOfTrnsIds'](ids),
      }
    }

    return stat
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

  /**
    * Stat by periods with period name and total.
    *
    * @return {Object}
    * @return {Object} categories
    * @return {Number} expensesBiggest
    * @return {Array} expensesCategoriesIds - categories ids
    * @return {Number} incomesBiggest
    * @return {Array} incomesCategoriesIds - categories ids
    * @return {Object} total
    * @return {Number} total.expenses
    * @return {Number} total.incomes
    * @return {Number} total.total
    *
  */
  statCurrentPeriod(_state, getters, rootState, rootGetters) {
    const trnsItems = rootState.trns.items
    const catsItems = rootState.categories.items
    const storeFilter = rootState.filter

    const categoriesIds = rootState.filter.catsIds.length > 0 ? getCatsIds(rootState.filter.catsIds, catsItems) : null
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

    const categoriesWithTrnsIds = getCatsIdsWithTrnsIds(trnsIds)
    const totalAllTrns = rootGetters['trns/getTotalOfTrnsIds'](trnsIds)

    // count total in categories
    const categoriesTotal = {}
    for (const categoryId in categoriesWithTrnsIds) {
      const trnsIdsInCategory = categoriesWithTrnsIds[categoryId]
      categoriesTotal[categoryId] = rootGetters['trns/getTotalOfTrnsIds'](trnsIdsInCategory)
    }

    // separate catgories by incomes and expenses
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

    // get first item in sorted catgories
    function getBiggestAmount(categoriesTotal, categoriesIds, typeName) {
      const biggestAmount = categoriesIds[0]
      return categoriesTotal[biggestAmount] && Math.abs(categoriesTotal[biggestAmount][typeName])
    }

    // biggest
    const expensesBiggest = getBiggestAmount(categoriesTotal, expensesCategoriesIds, 'expenses')
    const incomesBiggest = getBiggestAmount(categoriesTotal, incomesCategoriesIds, 'incomes')

    const stat = {
      categories: categoriesTotal,
      total: totalAllTrns.total,
      expenses: {
        biggest: expensesBiggest,
        categoriesIds: expensesCategoriesIds,
        total: totalAllTrns.expenses,
      },
      incomes: {
        biggest: incomesBiggest,
        categoriesIds: incomesCategoriesIds,
        total: totalAllTrns.incomes,
      },
    }

    return stat
  },
}
