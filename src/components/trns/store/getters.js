import moment from 'moment'

// getTotalOfTrnsIds
// getTrnsIdsInWallet
// lastCreatedTrnId
// firstCreatedTrnIdFromSelectedTrns
// selectedTrnsIds
// selectedTrnsIdsWithDate
// sortedTrnsIds
export default {
  hasTrns (state, getters, rootState) {
    if (rootState.trns.items) {
      if (Object.keys(rootState.trns.items).length > 0) {
        return true
      }
    }
    return false
  },

  // getTotalOfTrnsIds
  getTotalOfTrnsIds: (state, getters, rootState, rootGetters) => (trnsIds) => {
    const trns = rootState.trns.items
    const currencies = rootState.currencies.items
    const wallets = rootState.wallets.items
    const baseCurrency = rootState.currencies.base
    const transferCategoryId = rootGetters.transferCategoryId

    let incomes = 0
    let expenses = 0

    for (const key of trnsIds) {
      const trn = trns[key]
      if (trn && (trn.categoryId !== transferCategoryId)) {
        const wallet = wallets[trn.accountId]
        if (wallet && currencies) {
          let amount = 0
          if (wallet.currency !== baseCurrency) {
            amount = Math.abs(trn.amount / currencies[wallet.currency])
          } else {
            amount = trn.amount
          }
          if (trn.type === 1) incomes = incomes + amount
          else expenses = expenses + amount
        }
      }
    }
    return {
      incomes: Math.abs(incomes),
      expenses: Math.abs(expenses),
      total: parseInt(incomes - expenses)
    }
  },

  // getTrnsIdsInWallet
  getTrnsIdsInWallet: (state, getters, rootState) => (walletId) => {
    const trns = rootState.trns.items
    const trnsIds = []
    for (const trnId in trns) {
      if (trns[trnId] && trns[trnId].accountId === walletId) {
        trnsIds.push(trnId)
      }
    }
    return trnsIds
  },

  // lastCreatedTrnId
  lastCreatedTrnId (state, getters, rootState, rootGetters) {
    if (rootGetters.hasTrns) {
      const trnsIds = getters.sortedTrnsIds
      const trns = rootState.trns.items
      const transferCategoryId = rootGetters.transferCategoryId

      if (trnsIds.length) {
        for (const trnId of trnsIds) {
          if (trns[trnId].categoryId !== transferCategoryId) {
            return trnId
          }
        }
      }
    }
  },

  firstCreatedTrnId (state, getters, rootState, rootGetters) {
    if (rootGetters.hasTrns) {
      const trnsIds = [...getters.sortedTrnsIds].reverse()
      // const trns = rootState.trns.items
      return trnsIds[0]
    }
  },

  // firstCreatedTrnIdFromSelectedTrns
  firstCreatedTrnIdFromSelectedTrns (state, getters, rootState, rootGetters) {
    const trnsIds = [...getters.selectedTrnsIds].reverse()
    const trns = rootState.trns.items
    const transferCategoryId = rootGetters.transferCategoryId

    if (trnsIds.length) {
      for (const trnId of trnsIds) {
        if (trns[trnId].categoryId !== transferCategoryId) {
          return trnId
        }
      }
    }
  },

  // selectedTrnsIds
  selectedTrnsIds (state, getters, rootState, rootGetters) {
    if (!rootGetters.hasTrns) return []

    const categories = rootState.categories.items
    const categoriesIds = Object.keys(categories)
    const filterCategoryId = rootState.filter.categoryId
    const filterWalletId = rootState.filter.walletId
    const trns = rootState.trns.items
    let trnsIds = Object.keys(trns)

    // filter wallet
    if (filterWalletId) {
      trnsIds = trnsIds.filter(trnId => trns[trnId].accountId === filterWalletId)
    }

    // filter category
    if (filterCategoryId) {
      const childCategoriesIds = categoriesIds.filter(id => categories[id].parentId === filterCategoryId)
      if (childCategoriesIds.length) {
        trnsIds = trnsIds.filter(trnId => {
          const trnCategoryId = trns[trnId].categoryId
          for (const categoryId of childCategoriesIds) {
            if (trnCategoryId === categoryId) return true
          }
        })
      } else {
        trnsIds = trnsIds.filter(trnId => trns[trnId].categoryId === filterCategoryId)
      }
    }

    trnsIds = trnsIds
      .sort((a, b) => {
        if (trns[a].date > trns[b].date) return -1
        if (trns[a].date < trns[b].date) return 1
        return 0
      })

    return trnsIds
  },

  // selectedTrnsIdsWithDate
  selectedTrnsIdsWithDate (state, getters, rootState, rootGetters) {
    if (!rootGetters.hasTrns) return []

    const trns = rootState.trns.items
    const filterDate = moment(rootState.filter.date)
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
        if (trns[a].date > trns[b].date) return -1
        if (trns[a].date < trns[b].date) return 1
        return 0
      })

    return trnsIds
  },

  // sortedTrnsIds
  sortedTrnsIds (state, getters, rootState, rootGetters) {
    if (!rootGetters.hasTrns) return []

    const trns = state.items
    const trnsIds = Object.keys(trns)

    return trnsIds.sort((a, b) => {
      if (trns[a].date > trns[b].date) return -1
      if (trns[a].date < trns[b].date) return 1
      return 0
    })
  },

  getSelectedTrnsIdsByFilter: (state, getters, rootState, rootGetters) => ({ categoryId, type }) => {
    const trns = rootState.trns.items
    let trnsIds = rootGetters.selectedTrnsIdsWithDate
    if (categoryId) trnsIds = trnsIds.filter(id => trns[id].categoryId === categoryId)
    if (type) trnsIds = trnsIds.filter(id => trns[id].type === type)

    return trnsIds
  }
}
