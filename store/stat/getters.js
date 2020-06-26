import dayjs from 'dayjs'

export default {
  /**
    * Average stat used statByPeriods.
    *
    * @return {Object} Object with total
    * @return {Number} return[date].incomes
    * @return {Number} return[date].expenses
    * @return {Number} return[date].total
  */
  statAverage (state, getters, rootState) {
    const statPeriods = getters.statByPeriods
    const numberOfPeriods = rootState.stat.showedPeriods

    let incomes = 0
    let expenses = 0
    let total = 0

    for (const idx in statPeriods) {
      const period = statPeriods[idx]
      incomes = incomes + period.incomes
      expenses = expenses + period.expenses
      if (incomes > 0 && expenses > 0) {
        total = incomes - expenses
      }
    }

    return {
      incomes: Math.ceil(incomes / numberOfPeriods),
      expenses: Math.ceil(expenses / numberOfPeriods),
      total: Math.ceil(total / numberOfPeriods)
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
  statByPeriods (state, getters, rootState, rootGetters) {
    const trns = rootState.trns.items
    const transferCategoryId = rootGetters['categories/transferCategoryId']
    const diff = rootState.stat.showedPeriods
    const trnsIds = rootGetters['trns/selectedTrnsIds']

    const periodGroup = rootState.filter.period

    const stat = {}
    for (let period = 0; period < diff; period++) {
      const dateStartOfPeriod = dayjs().subtract(period, periodGroup).startOf(periodGroup)
      const dateEndOfPeriod = dayjs().subtract(period, periodGroup).endOf(periodGroup)
      const ids = trnsIds
        .filter(trnId => (trns[trnId].date >= dateStartOfPeriod) && (trns[trnId].date <= dateEndOfPeriod) && (trns[trnId].categoryId !== transferCategoryId))

      stat[dateStartOfPeriod.valueOf()] = {
        date: dateStartOfPeriod.valueOf(),
        ...rootGetters['trns/getTotalOfTrnsIds'](ids)
      }
    }
    return stat
  },

  isFirstPeriodSelected (state, getters, rootState, rootGetters) {
    if (rootGetters['trns/hasTrns']) {
      if (dayjs(rootState.filter.date).isSame(dayjs(), rootState.filter.period)) {
        return true
      }
    }
    else {
      return true
    }
  },

  isLastPeriodSelected (state, getters, rootState, rootGetters) {
    if (rootGetters['trns/hasTrns']) {
      const firstCreatedTrnId = rootGetters['trns/firstCreatedTrnId']
      const firstCreatedTrnDate = rootState.trns.items[firstCreatedTrnId].date
      if (dayjs(rootState.filter.date).isSame(firstCreatedTrnDate, rootState.filter.period)) {
        return true
      }
    }
    else {
      return true
    }
  },

  /**
    * Return root category ID from trnId
    *
    * @param {String} trnId
    * @return {String} root categoryId
  */
  getRootCategoryIdFromTrnId: (state, getters, rootState) => (trnId) => {
    const trns = rootState.trns.items
    const categories = rootState.categories.items
    const trnCategoryId = trns[trnId].categoryId
    if (!categories[trnCategoryId]) {
      console.log('no category', trnId, trns[trnId], categories[trnCategoryId])
      return trnCategoryId
    }
    const trnCategoryParentId = categories[trnCategoryId].parentId
    return trnCategoryParentId || trnCategoryId
  },

  /**
    * Create categories with trnsIds from list of trnsIds
    *
    * @param {Array} trnsIds
    * @return {Object} categoryId - categoryId with trnsIDs
    * @return {Array} categoryId[] - trnsIds
    * @return {String} categoryId[] - trnId
    * { categiryId: [...trnId, trnId] }
  */
  getCategoriesIdsWithTrnsIds: (state, getters, rootState, rootGetters) => ({ trnsIds }) => {
    const filterCategoryId = rootState.filter.categoryId
    const trns = rootState.trns.items
    const transferCategoryId = rootGetters['categories/transferCategoryId']

    const categoriesWithTrnsIds = {}

    for (const trnId of trnsIds) {
      if (trns[trnId]) {
        let categoryId
        filterCategoryId
          ? categoryId = trns[trnId].categoryId
          : categoryId = getters.getRootCategoryIdFromTrnId(trnId)

        // Push trnId to categoriey. Exclude transfer category
        if (categoryId !== transferCategoryId) {
          if (!categoriesWithTrnsIds[categoryId]) {
            categoriesWithTrnsIds[categoryId] = [trnId]
          }
          else {
            categoriesWithTrnsIds[categoryId].push(trnId)
          }
        }
      }
    }

    return categoriesWithTrnsIds
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
  getStat: (state, getters, rootState, rootGetters) => ({ date }) => {
    const selectedTrns = rootGetters['trns/getTrns']({ date })
    const categoriesWithTrnsIds = getters.getCategoriesIdsWithTrnsIds({ trnsIds: selectedTrns })
    const totalAllTrns = rootGetters['trns/getTotalOfTrnsIds'](selectedTrns)

    // count total in categories
    const categoriesTotal = {}
    for (const categoryId in categoriesWithTrnsIds) {
      categoriesTotal[categoryId] = rootGetters['trns/getTotalOfTrnsIds'](categoriesWithTrnsIds[categoryId])
    }

    // separate catgories by incomes and expenses
    const statIncomes = {}
    const statExpenses = {}
    for (const categoryId in categoriesWithTrnsIds) {
      const total = categoriesTotal[categoryId]
      if (total.incomes > 0) statIncomes[categoryId] = total
      if (total.expenses > 0) statExpenses[categoryId] = total
    }

    // sort categories amount
    function sortCategoriesByTotal (categories, typeName) {
      const categoriesIds = Object.keys(categories)
      let sortedCategoriesIds = []

      if (categoriesIds.length) {
        sortedCategoriesIds = categoriesIds.sort((a, b) => {
          if (categories[a][typeName] > categories[b][typeName]) return -1
          if (categories[a][typeName] < categories[b][typeName]) return 1
          return 0
        })
      }

      return sortedCategoriesIds
    }

    // sorted
    const incomesCategoriesIds = sortCategoriesByTotal(statIncomes, 'incomes')
    const expensesCategoriesIds = sortCategoriesByTotal(statExpenses, 'expenses')

    // get first item in sorted catgories
    function getBiggestAmount (categoriesTotal, categoriesIds, typeName) {
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
        total: totalAllTrns.expenses
      },
      incomes: {
        biggest: incomesBiggest,
        categoriesIds: incomesCategoriesIds,
        total: totalAllTrns.incomes
      }
    }

    return stat
  },

  statCurrentPeriod (state, getters, rootState, rootGetters) {
    const date = rootState.filter.date
    const stat = getters.getStat({ date })
    return stat
  }
}
