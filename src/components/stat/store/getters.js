import moment from 'moment'
import orderBy from 'lodash/orderBy'

function sortAndFilterCategories ({ categories, type }) {
  return Object.keys(categories)
    .filter(categoryId => categories[categoryId][type] > 0)
    .sort((a, b) => {
      if (categories[a][type] > categories[b][type]) return -1
      if (categories[a][type] < categories[b][type]) return 1
      return 0
    })
}

export default {
  /**
    * Average stat used statByPeriods.
    *
    * @return {Object} Object with total
    * @return {Number} return[date].incomes
    * @return {Number} return[date].expenses
    * @return {Number} return[date].total
  */
  statAverage (state, getters, rootState, rootGetters) {
    const statPeriods = rootGetters.statByPeriods
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
    const transferCategoryId = rootGetters.transferCategoryId
    const diff = rootState.stat.showedPeriods
    let trnsIds = rootGetters.selectedTrnsIds

    const periodGroup = rootState.filter.period

    const stat = {}
    for (let period = 0; period < diff; period++) {
      const dateStartOfPeriod = moment().subtract(period, periodGroup).startOf(periodGroup)
      const dateEndOfPeriod = moment().subtract(period, periodGroup).endOf(periodGroup)
      const ids = trnsIds
        .filter(trnId => (trns[trnId].date >= dateStartOfPeriod) && (trns[trnId].date <= dateEndOfPeriod) && (trns[trnId].categoryId !== transferCategoryId))

      stat[dateStartOfPeriod.valueOf()] = {
        date: dateStartOfPeriod.valueOf(),
        ...rootGetters.getTotalOfTrnsIds(ids)
      }
    }
    return stat
  },

  /**
    * Biggest period value.
    *
    * @returns {Number}
  */
  statByPeriodsBiggestPeriod (state, getters, rootState, rootGetters) {
    const stat = rootGetters.statByPeriods
    if (stat) {
      const statSortedByBiggesValues = orderBy(stat, e => e.incomes > e.expenses ? e.incomes : e.expenses, 'desc')

      let biggestValues
      if (statSortedByBiggesValues[0].incomes > statSortedByBiggesValues[0].expenses) {
        biggestValues = statSortedByBiggesValues[0].incomes
      } else {
        biggestValues = statSortedByBiggesValues[0].expenses
      }

      return parseInt(biggestValues)
    }
  },

  stat (state, getters, rootState, rootGetters) {
    const selectedCategoryId = rootState.filter.categoryId
    const trns = rootState.trns.items
    const categories = rootState.categories.items
    const transferCategoryId = rootGetters.transferCategoryId

    const categoriesWithTrnsIds = {}

    // Selected trns
    if (rootGetters.selectedTrnsIdsWithDate.length) {
      for (const trnId of rootGetters.selectedTrnsIdsWithDate) {
        if (trns[trnId]) {
          const trnCategoryId = trns[trnId].categoryId
          if (!trnCategoryId) break
          if (!categories[trnCategoryId]) break

          // Get root category
          let trnCategoryParentId = categories[trnCategoryId].parentId
          let categoryId = trnCategoryParentId || trnCategoryId
          if (selectedCategoryId) categoryId = trnCategoryId

          // Push trns ids to categories object. Exclude transfer category
          if (categoryId !== transferCategoryId) {
            if (!categoriesWithTrnsIds[categoryId]) {
              categoriesWithTrnsIds[categoryId] = [trnId]
            } else {
              categoriesWithTrnsIds[categoryId].push(trnId)
            }
          }
        }
      }
    }

    const categoriesTotal = {}
    for (const categoryId in categoriesWithTrnsIds) {
      const trnsIds = categoriesWithTrnsIds[categoryId]
      categoriesTotal[categoryId] = rootGetters.getTotalOfTrnsIds(trnsIds)
    }

    const sortedExpensesCategoriesIdsBySum = sortAndFilterCategories({
      categories: categoriesTotal, type: 'expenses'
    })
    const sortedIncomesCategoriesIdsBySum = sortAndFilterCategories({
      categories: categoriesTotal, type: 'incomes'
    })

    const sortedIncomesCategories = {}
    for (const categoryId of sortedExpensesCategoriesIdsBySum) {
      sortedIncomesCategories[categoryId] = categoriesTotal[categoryId]
    }

    const sortedExpensesCategories = {}
    for (const categoryId of sortedIncomesCategoriesIdsBySum) {
      sortedExpensesCategories[categoryId] = categoriesTotal[categoryId]
    }

    return {
      categories: categoriesTotal,
      expenses: {
        biggest: categoriesTotal[sortedExpensesCategoriesIdsBySum[0]] && Math.abs(categoriesTotal[sortedExpensesCategoriesIdsBySum[0]].expenses),
        categoriesIds: sortedExpensesCategoriesIdsBySum,
        total: rootGetters.getTotalOfTrnsIds(rootGetters.selectedTrnsIdsWithDate.filter(trnId => rootState.trns.items[trnId].type === 0))
      },
      incomes: {
        biggest: categoriesTotal[sortedIncomesCategoriesIdsBySum[0]] && Math.abs(categoriesTotal[sortedIncomesCategoriesIdsBySum[0]].incomes),
        categoriesIds: sortedIncomesCategoriesIdsBySum,
        total: rootGetters.getTotalOfTrnsIds(rootGetters.selectedTrnsIdsWithDate.filter(trnId => rootState.trns.items[trnId].type === 1))
      }
    }
  },

  isFirstPeriodSelected (state, getters, rootState, rootGetters) {
    if (rootGetters.hasTrns) {
      // -----------------------------------------------
      // For future case when period from custom user calendar
      // rootState.filter.date
      // -----------------------------------------------
      // const lastCreatedTrnId = rootGetters.lastCreatedTrnId
      // const lastCreatedTrnDate = rootState.trns.items[lastCreatedTrnId].date
      // if (moment(rootState.filter.date).isSame(lastCreatedTrnDate, rootState.filter.period)) {
      //   return true
      // }
      if (moment(rootState.filter.date).isSame(moment(), rootState.filter.period)) {
        return true
      }
    } else {
      return true
    }
  },
  isLastPeriodSelected (state, getters, rootState, rootGetters) {
    if (rootGetters.hasTrns) {
      const firstCreatedTrnId = rootGetters.firstCreatedTrnId
      const firstCreatedTrnDate = rootState.trns.items[firstCreatedTrnId].date
      if (moment(rootState.filter.date).isSame(firstCreatedTrnDate, rootState.filter.period)) {
        return true
      }
    } else {
      return true
    }
  }
}
