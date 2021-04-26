import dayjs from 'dayjs'

export default {
  hasTrns (state, getters, rootState) {
    if (rootState.trns.items) {
      if (Object.keys(rootState.trns.items).length > 0) {
        return true
      }
    }
    return false
  },

  /**
    * Return total amounts of trnsIds
    * * Refactor params should be Object
    *
    * @param {Array} trnsIds
    * @return {Object} return
    * @return {String} return.expenses
    * @return {String} return.incomes
    * @return {String} return.total
  */
  getTotalOfTrnsIds: (state, getters, rootState, rootGetters) => (trnsIds, inculdeTrnasfers = false, isConvertToBase = true, walletId) => {
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
        // Simple
        if (trn.type !== 2) {
          const wallet = wallets[trn.walletId]
          if (wallet && currencies) {
            let amount = 0
            if (isConvertToBase && wallet.currency !== baseCurrency) {
              amount = Math.abs(trn.amount / currencies[wallet.currency])
            }
            else {
              amount = trn.amount
            }
            if (trn.type === 1) { incomes = incomes + amount }
            else { expenses = expenses + amount }
          }
        }

        if (trn.type === 2 && inculdeTrnasfers) {
          if (walletId === trn.walletFromId) {
            expenses = expenses + trn.amountFrom
          }
          if (walletId === trn.walletToId) {
            incomes = incomes + trn.amountTo
          }
        }
      }
    }
    return {
      expenses: Math.abs(+expenses.toFixed(0)),
      incomes: Math.abs(+incomes.toFixed(0)),
      total: parseInt(incomes - expenses)
    }
  },

  // getTrnsIdsInWallet
  getTrnsIdsInWallet: (state, getters, rootState) => (walletId) => {
    const trns = rootState.trns.items
    const trnsIds = []
    for (const trnId in trns) {
      if (trns[trnId] && (trns[trnId].walletId === walletId || trns[trnId].walletFromId === walletId || trns[trnId].walletToId === walletId)) {
        trnsIds.push(trnId)
      }
    }
    return trnsIds
  },

  lastCreatedTrnId (state, getters, rootState, rootGetters) {
    if (getters.hasTrns) {
      const trnsIds = getters.sortedTrnsIds
      const trns = rootState.trns.items
      const transferCategoryId = rootGetters['categories/transferCategoryId']

      if (trnsIds.length) {
        for (const trnId of trnsIds) {
          if (trns[trnId].categoryId !== transferCategoryId) {
            return trnId
          }
        }
      }
    }
  },

  firstCreatedTrnId (state, getters) {
    if (getters.hasTrns) {
      const trnsIds = [...getters.sortedTrnsIds].reverse()
      return trnsIds[0]
    }
  },

  firstCreatedTrnIdFromSelectedTrns (state, getters) {
    const trnsIds = [...getters.selectedTrnsIds].reverse()
    if (trnsIds.length) {
      return trnsIds[0]
    }
  },

  // selectedTrnsIds
  selectedTrnsIds (state, getters, rootState) {
    if (!getters.hasTrns) { return [] }

    const categories = rootState.categories.items
    const categoriesIds = Object.keys(categories)
    const filterCategoryId = rootState.filter.categoryId
    const filterWalletId = rootState.filter.walletId
    const trns = rootState.trns.items
    let trnsIds = Object.keys(trns)

    // filter wallet
    if (filterWalletId) {
      trnsIds = trnsIds.filter(trnId => trns[trnId].walletId === filterWalletId || trns[trnId].walletToId === filterWalletId || trns[trnId].walletFromId === filterWalletId)
    }

    // filter category
    if (filterCategoryId) {
      const childCategoriesIds = categoriesIds.filter(id => categories[id].parentId === filterCategoryId)
      if (childCategoriesIds.length) {
        trnsIds = trnsIds.filter((trnId) => {
          const trnCategoryId = trns[trnId].categoryId
          for (const categoryId of childCategoriesIds) {
            if (trnCategoryId === categoryId) { return true }
          }
        })
      }
      else {
        trnsIds = trnsIds.filter(trnId => trns[trnId].categoryId === filterCategoryId)
      }
    }

    trnsIds = trnsIds
      .sort((a, b) => {
        if (trns[a].date > trns[b].date) { return -1 }
        if (trns[a].date < trns[b].date) { return 1 }
        return 0
      })

    return trnsIds
  },

  selectedTrnsIdsWithDate (state, getters, rootState) {
    if (!getters.hasTrns) { return [] }

    const trns = rootState.trns.items
    const filterDate = dayjs(rootState.filter.date)
    const filterPeriod = rootState.filter.period
    const startDateValue = filterDate.startOf(filterPeriod).valueOf()
    const endDateValue = filterDate.endOf(filterPeriod).valueOf()
    let trnsIds = getters.selectedTrnsIds

    // filter date
    if (filterPeriod !== 'all') {
      trnsIds = trnsIds
        .filter(trnId => (trns[trnId].date >= startDateValue) && (trns[trnId].date <= endDateValue))
    }

    trnsIds = trnsIds
      .sort((a, b) => {
        if (trns[a].date > trns[b].date) { return -1 }
        if (trns[a].date < trns[b].date) { return 1 }
        return 0
      })

    return trnsIds
  },

  // sortedTrnsIds
  sortedTrnsIds (state, getters, rootState, rootGetters) {
    if (!getters.hasTrns) { return [] }

    const trns = state.items
    const trnsIds = Object.keys(trns)

    return trnsIds.sort((a, b) => {
      if (trns[a].date > trns[b].date) { return -1 }
      if (trns[a].date < trns[b].date) { return 1 }
      return 0
    })
  },

  getTrnsIdsByFilter: (state, getters, rootState) => ({ categoryId, type }) => {
    const trns = rootState.trns.items
    let trnsIds = getters.sortedTrnsIds
    if (categoryId) { trnsIds = trnsIds.filter(id => trns[id].categoryId === categoryId) }
    if (type) { trnsIds = trnsIds.filter(id => trns[id].type === type) }

    return trnsIds
  },

  getTrns: (state, getters, rootState) => (props) => {
    if (!getters.hasTrns) { return [] }

    const { date, periodName, description, categoryId, type } = props
    const categories = rootState.categories.items
    const categoriesIds = Object.keys(categories)
    const filterCategoryId = rootState.filter.categoryId || categoryId
    const filterWalletId = rootState.filter.walletId

    const trns = rootState.trns.items
    let trnsIds = Object.keys(trns)

    const filterDate = dayjs(date)
    const filterPeriod = periodName || rootState.filter.period
    const startDateValue = filterDate.startOf(filterPeriod).valueOf()
    const endDateValue = filterDate.endOf(filterPeriod).valueOf()

    // filter type
    if (type) {
      trnsIds = trnsIds
        .filter(trnId => (trns[trnId].type === type))
    }

    // filter date
    if (date && filterPeriod !== 'all') {
      trnsIds = trnsIds
        .filter(trnId => (trns[trnId].date >= startDateValue) && (trns[trnId].date <= endDateValue))
    }

    // filter wallet
    if (filterWalletId) {
      trnsIds = trnsIds.filter(trnId => trns[trnId].walletId === filterWalletId || trns[trnId].walletToId === filterWalletId || trns[trnId].walletFromId === filterWalletId)
    }

    // filter category
    if (filterCategoryId) {
      const childCategoriesIds = categoriesIds.filter(id => categories[id].parentId === filterCategoryId)
      if (childCategoriesIds.length) {
        trnsIds = trnsIds.filter((trnId) => {
          const trnCategoryId = trns[trnId].categoryId
          for (const categoryId of childCategoriesIds) {
            if (trnCategoryId === categoryId) { return true }
          }
          return false
        })
      }
      else {
        trnsIds = trnsIds.filter(trnId => trns[trnId].categoryId === filterCategoryId)
      }
    }

    // description
    if (description) {
      trnsIds = trnsIds
        .filter(trnId =>
          trns[trnId].description &&
          trns[trnId].description.includes(description))
    }

    trnsIds = trnsIds
      .sort((a, b) => {
        if (trns[a].date > trns[b].date) { return -1 }
        if (trns[a].date < trns[b].date) { return 1 }
        return 0
      })

    return trnsIds
  },

  getTrnsIds: (state, getters, rootState) => (props) => {
    if (!getters.hasTrns) { return [] }

    const { startDate, endDate, periodName } = props
    const categories = rootState.categories.items
    const categoriesIds = Object.keys(categories)
    const filterCategoryId = props.categoryId
    const filterWalletId = props.walletId

    const trns = rootState.trns.items
    let trnsIds = Object.keys(trns)

    // filter date
    if (startDate && endDate && periodName) {
      const startDateValue = dayjs(startDate).startOf('day').valueOf()
      const endDateValue = dayjs(endDate).endOf('day').valueOf()

      trnsIds = trnsIds
        .filter(trnId => (trns[trnId].date >= startDateValue) && (trns[trnId].date <= endDateValue))
    }

    // filter wallet
    if (filterWalletId) {
      trnsIds = trnsIds.filter(trnId => trns[trnId].walletId === filterWalletId || trns[trnId].walletToId === filterWalletId || trns[trnId].walletFromId === filterWalletId)
    }

    // filter category
    if (filterCategoryId) {
      const childCategoriesIds = categoriesIds.filter(id => categories[id].parentId === filterCategoryId)
      if (childCategoriesIds.length) {
        trnsIds = trnsIds.filter((trnId) => {
          const trnCategoryId = trns[trnId].categoryId
          for (const categoryId of childCategoriesIds) {
            if (trnCategoryId === categoryId) { return true }
          }
          return false
        })
      }
      else {
        trnsIds = trnsIds.filter(trnId => trns[trnId].categoryId === filterCategoryId)
      }
    }

    trnsIds = trnsIds
      .sort((a, b) => {
        if (trns[a].date > trns[b].date) { return -1 }
        if (trns[a].date < trns[b].date) { return 1 }
        return 0
      })

    return trnsIds || []
  }
}
