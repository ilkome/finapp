import dayjs from 'dayjs'
import { getCatsIds, getTransferCategoriesIds } from '~/components/categories/getCategories'
import { getTotal } from '~/components/trns/getTotal'
import { getTrnsIds } from '~/components/trns/getTrns'

export default {
  hasTrns(_state, _getters, rootState) {
    if (rootState.trns.items) {
      if (Object.keys(rootState.trns.items).length > 0)
        return true
    }
    return false
  },

  /**
    * Return total amounts of trnsIds
    * * TODO: need full refactor
    *
    * @param {Array} trnsIds
    * @return {Object} return
    * @return {String} return.expenses
    * @return {String} return.incomes
    * @return {String} return.total
  */
  getTotalOfTrnsIds: (_state, _getters, rootState) => (trnsIds, includeTransfers = false, isConvertToBase = true, walletId) => {
    const trnsItems = rootState.trns.items
    const rates = rootState.currencies.rates
    const walletsItems = rootState.wallets.items
    const categoriesItems = rootState.categories.items
    const baseRate = rootState.currencies.base
    const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)

    let total = 0

    if (walletId) {
      total = getTotal({
        transferCategoriesIds,
        trnsIds,
        trnsItems,
        walletsItems,
        walletsIds: [walletId],
      })

      return {
        expense: total.expenseTransactions + total.expenseTransfers,
        income: total.incomeTransactions + total.incomeTransfers,
        sum: total.sumTransactions + total.sumTransfers,
        // @deprecated
        expenses: total.expenseTransactions + total.expenseTransfers,
        incomes: total.incomeTransactions + total.incomeTransfers,
        total: total.sumTransactions + total.sumTransfers,
      }
    }
    else if (includeTransfers && isConvertToBase) {
      total = getTotal({
        baseRate,
        rates,
        transferCategoriesIds,
        trnsIds,
        trnsItems,
        walletsItems,
      })

      return {
        expense: total.expenseTransactions + total.expenseTransfers,
        income: total.incomeTransactions + total.incomeTransfers,
        sum: total.sumTransactions + total.sumTransfers,
        // @deprecated
        expenses: total.expenseTransactions + total.expenseTransfers,
        incomes: total.incomeTransactions + total.incomeTransfers,
        total: total.sumTransactions + total.sumTransfers,
      }
    }
    else if (includeTransfers && !isConvertToBase) {
      total = getTotal({
        transferCategoriesIds,
        trnsIds,
        trnsItems,
        walletsItems,
        walletsIds: [walletId],
      })

      return {
        expense: total.expenseTransactions + total.expenseTransfers,
        income: total.incomeTransactions + total.incomeTransfers,
        sum: total.sumTransactions + total.sumTransfers,
        // @deprecated
        expenses: total.expenseTransactions + total.expenseTransfers,
        incomes: total.incomeTransactions + total.incomeTransfers,
        total: total.sumTransactions + total.sumTransfers,
      }
    }
    else if (!includeTransfers) {
      total = getTotal({
        baseRate,
        rates,
        transferCategoriesIds,
        trnsIds,
        trnsItems,
        walletsItems,
      })

      return {
        expense: total.expenseTransactions,
        income: total.incomeTransactions,
        sum: total.sumTransactions,
        // @deprecated
        expenses: total.expenseTransactions,
        incomes: total.incomeTransactions,
        total: total.sumTransactions,
      }
    }
  },

  lastCreatedTrnId(state, getters, rootState, rootGetters) {
    if (!getters.hasTrns)
      return

    const trnsItems = rootState.trns.items
    const transferCategoryId = rootGetters['categories/transferCategoryId']
    const trnsIds = Object.keys(trnsItems)
      .sort((a, b) => {
        if (trnsItems[a].date > trnsItems[b].date)
          return -1
        if (trnsItems[a].date < trnsItems[b].date)
          return 1
        return 0
      })

    if (trnsIds.length) {
      for (const trnId of trnsIds) {
        if (trnsItems[trnId].categoryId !== transferCategoryId && trnsItems[trnId].type !== 2)
          return trnId
      }
    }
  },

  firstCreatedTrnId(_state, getters, rootState) {
    if (!getters.hasTrns)
      return

    const trnsItems = rootState.trns.items
    const trnsIds = Object.keys(trnsItems)
      .sort((a, b) => {
        if (trnsItems[a].date > trnsItems[b].date)
          return -1
        if (trnsItems[a].date < trnsItems[b].date)
          return 1
        return 0
      })
      .reverse()

    return trnsIds[0]
  },

  firstCreatedTrnIdFromSelectedTrns(state, getters) {
    const trnsIds = [...getters.selectedTrnsIds].reverse()
    if (trnsIds.length)
      return trnsIds[0]
  },

  // TODO: should use components/trns/getTrns when its compatible
  selectedTrnsIds(_state, getters, rootState) {
    if (!getters.hasTrns)
      return []

    const trnsItems = rootState.trns.items
    const catsItems = rootState.categories.items
    const storeFilter = rootState.filter

    const categoriesIds = rootState.filter.catsIds.length > 0 ? getCatsIds(rootState.filter.catsIds, catsItems) : null
    const walletsIds = storeFilter.walletsIds.length > 0 ? storeFilter.walletsIds : null

    const trnsIds = getTrnsIds({
      trnsItems,
      walletsIds,
      categoriesIds,
    })

    return trnsIds
  },

  // TODO: should use components/trns/getTrns when its compatible
  selectedTrnsIdsWithDate(_state, getters, rootState) {
    if (!getters.hasTrns)
      return []

    const trns = rootState.trns.items
    const filterDate = dayjs(rootState.filter.date)
    const filterPeriod = rootState.filter.period
    const startDateValue = filterDate.startOf(filterPeriod).valueOf()
    const endDateValue = filterDate.endOf(filterPeriod).valueOf()
    let trnsIds = getters.selectedTrnsIds

    // filter date
    if (filterPeriod !== 'all') {
      trnsIds = trnsIds.filter(
        trnId =>
          (trns[trnId].date >= startDateValue)
          && (trns[trnId].date <= endDateValue))
    }

    trnsIds = trnsIds
      .sort((a, b) => {
        if (trns[a].date > trns[b].date)
          return -1
        if (trns[a].date < trns[b].date)
          return 1
        return 0
      })

    return trnsIds
  },
}
