import dayjs from 'dayjs'
import { getCatsIds } from '~/components/categories/getCategories'
import { getTrnsIds } from '~/components/trns/functions/getTrns'

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
    * * Refactor: params should be Object
    *
    * @param {Array} trnsIds
    * @return {Object} return
    * @return {String} return.expenses
    * @return {String} return.incomes
    * @return {String} return.total
  */
  getTotalOfTrnsIds: (_state, _getters, rootState, rootGetters) => (trnsIds, inculdeTrnasfers = false, isConvertToBase = true, walletId) => {
    const trns = rootState.trns.items
    const currencies = rootState.currencies.rates
    const wallets = rootState.wallets.items
    const baseCurrency = rootState.currencies.base
    const transferCategoryId = rootGetters['categories/transferCategoryId']

    let expenses = 0
    let incomes = 0

    for (const key of trnsIds) {
      const trn = trns[key]
      if (trn && (inculdeTrnasfers || trn.categoryId !== transferCategoryId)) {
        // Transaction
        if (trn.type !== 2) {
          const wallet = wallets[trn.walletId]
          if (!wallet && currencies)
            return

          let amount = 0
          isConvertToBase && wallet.currency !== baseCurrency
            ? amount = Math.abs(trn.amount / currencies[wallet.currency])
            : amount = trn.amount

          trn.type === 1
            ? incomes = incomes + amount
            : expenses = expenses + amount
        }

        // Transfer
        if (trn.type === 2 && inculdeTrnasfers) {
          if (walletId === trn.walletFromId || walletId === trn.expenseWalletId)
            expenses = expenses + (trn.expenseAmount ? trn.expenseAmount : trn.amount)

          if (walletId === trn.walletToId || walletId === trn.incomeWalletId)
            incomes = incomes + (trn.incomeAmount ? trn.incomeAmount : trn.amount)
        }
      }
    }
    return {
      expense: Math.abs(+expenses.toFixed(0)),
      income: Math.abs(+incomes.toFixed(0)),
      sum: parseInt(incomes - expenses),
      // @deprecated
      expenses: Math.abs(+expenses.toFixed(0)),
      incomes: Math.abs(+incomes.toFixed(0)),
      total: parseInt(incomes - expenses),
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

  // TODO: should use components/trns/functions/getTrns when its compatible
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

  // TODO: should use components/trns/functions/getTrns when its compatible
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
