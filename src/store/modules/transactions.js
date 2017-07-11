import moment from 'moment'
import orderBy from 'lodash/orderBy'
import { getTrnasaction, addTrnasactions, updateTrnasaction, deleteTrnasaction } from '../../api/api'
import { getAllTransactions, getTransactions } from '../../api/transactions'

/**
 * Format trn.
 * @param {object} trn - Trn for format.
 * @param {options} object - Options.
 * @param {options.accounts} Array - List of accounts.
 * @param {options.categories} Array - List of categories.
 * @param {options.rates} Array - List of rates.
 * @return {object} Formated trn.
 */
function formatTrn(trn, options) {
  if (options) {
    if (options.accounts.length < 0) {
      console.error('formatTrn: must to have accounts')
      return false
    }
    if (options.categories.length < 0) {
      console.error('formatTrn: must to have categories')
      return false
    }
    if (options.rates.length < 0) {
      console.error('formatTrn: must to have rates')
      return false
    }
  } else {
    console.error('formatTrn: must to have options')
    return false
  }

  const accountId = +trn.accountId
  const account = options.accounts.find(a => a.id === accountId)
  let accountName
  if (account) {
    accountName = account.name
  } else {
    console.error('Account not found. Id:', account, trn, accountId, options)
    return false
  }
  const amount = Math.abs(trn.amount)
  const currency = trn.currency
  let amountRub
  if (currency === 'RUB') {
    amountRub = Math.abs(trn.amount)
  } else {
    if (options.rates[currency]) {
      amountRub = Math.floor(Math.abs(trn.amount / options.rates[currency]))
    } else {
      console.error('No currency found', currency)
      return false
    }
  }
  const categoryId = +trn.categoryId
  const category = options.categories.find(cat => cat.id === categoryId)
  let categoryName
  if (category) {
    categoryName = category.name
  } else {
    console.error('Category not found. Id:', categoryId)
    return false
  }
  const date = +trn.date
  const description = trn.description
  const id = +trn.id
  const type = +trn.type

  return {
    accountId,
    accountName,
    amount,
    amountRub,
    categoryId,
    categoryName,
    date,
    description,
    currency,
    id,
    type
  }
}

// state
// ======================
const state = {
  all: []
}

// getters
// ==============================================
const getters = {
  trns(state) {
    return state.all
  },

  getTrns: (state, getters) => (startDate, endDate, type = false) => {
    const trns = getters.trns
      .filter(trn =>
        trn.categoryId !== 62 &&
        trn.date >= moment(startDate).startOf('day').valueOf() &&
        trn.date <= moment(endDate).endOf('day').valueOf())

    if (type === 'incomes') trns.filter(t => t.type === 1)
    if (type === 'expenses') trns.filter(t => t.type === 0)

    if (trns) {
      return orderBy(trns, trn => trn.date, 'desc')
    }
  },

  expenses(state, getters) {
    return getters.trns.filter(t => t.type === 0)
  },

  incomes(state, getters) {
    return getters.trns.filter(t => t.type === 1)
  }
}

// Actions
// ==============================================
const actions = {
  async getTrns({ commit, state, rootState }) {
    console.groupCollapsed('store/transitions/@getTrns')
    try {
      const trns = await getAllTransactions()

      const accounts = rootState.accounts.all
      const categories = rootState.categories.all
      const rates = rootState.rates.all

      if (trns.length) {
        console.groupCollapsed('Format trns')
        const formatedTrns = trns.map(trn => formatTrn(trn, { accounts, categories, rates }))

        console.log('Before format trns:', trns)
        console.log('Formated trns:', formatedTrns)
        console.groupEnd()
        commit('getTrns', formatedTrns)
      } else {
        commit('showError', 'store/transitions/getTrns: no trns')
        throw new Error('No trns')
      }
    } catch (error) {
      throw new Error(error.message)
    } finally {
      console.groupEnd()
    }
  },

  async addTrns({ commit, state, rootState }, values) {
    try {
      const accounts = rootState.accounts.all
      const categories = rootState.categories.all
      const rates = rootState.rates.all

      console.log('Values:', values)
      const trnsIdsAdded = await addTrnasactions(values)

      if (trnsIdsAdded) {
        const response = await getTransactions(trnsIdsAdded)
        console.groupCollapsed('Format trn')

        if (Array.isArray(response)) {
          console.log('Is Array')
          const formatedNewTrns = response.map(trn => formatTrn(trn, { accounts, categories, rates }))
          await commit('addTrns', formatedNewTrns)
          console.log('Formated:', formatedNewTrns)
        } else {
          console.log('Is one Object')
          const formatedNewTrn = formatTrn(response, { accounts, categories, rates })
          await commit('addTrn', formatedNewTrn)
          console.log('Formated:', formatedNewTrn)
        }

        if (response) {
          console.log('Updated!')
          console.groupEnd()
          return true
        } else {
          commit('showError', 'store/transitions/addTrns: newTrn: false')
          return false
        }
      } else {
        commit('showError', 'store/transitions/addTrns: trnsIdsAdded: false')
        throw new Error('store/transitions/addTrns: trnsIdsAdded: false')
      }
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async updateTrn({ commit, state, rootState }, trn) {
    console.log('Values:', trn)

    const accounts = rootState.accounts.all
    const categories = rootState.categories.all
    const rates = rootState.rates.all

    if (trn && trn.id) {
      console.groupCollapsed('Update')
      const isTrnUpdated = await updateTrnasaction(trn)
      console.groupEnd()

      if (isTrnUpdated) {
        console.groupCollapsed('Get')
        const newTrn = await getTrnasaction(trn.id)
        console.groupEnd()

        if (newTrn) {
          console.groupCollapsed('Format trn')
          const formatedNewTrn = formatTrn(newTrn, { accounts, categories, rates })
          console.log('Formated:', formatedNewTrn)
          console.groupEnd()

          console.log('Updated!')
          await commit('updateTrn', formatedNewTrn)
          return true
        } else {
          commit('showError', 'store/transitions/updateTrn: newTrn: false')
          return false
        }
      } else {
        commit('showError', 'store/transitions/updateTrn: isTrnUpdated: false')
        return false
      }
    } else {
      commit('showError', 'store/transitions/updateTrn: No trn or trn.id is empty!')
      return false
    }
  },

  async deleteTrn({ commit }, id) {
    console.groupCollapsed('Delete')
    const isTrnDeleted = await deleteTrnasaction(+id)
    console.groupEnd()

    if (isTrnDeleted) {
      commit('deleteTrn', id)
      return true
    } else {
      commit('showError', 'store/transitions/deleteTrn: isTrnDeleted: false')
      return false
    }
  }
}

// mutations
// ==============================================
const mutations = {
  getTrns(state, trns) {
    state.all = trns
  },
  addTrn(state, trn) {
    state.all.push(trn)
  },
  addTrns(state, trns) {
    state.all.push(...trns)
  },
  updateTrn(state, trn) {
    state.all = [
      ...state.all.filter(t => t.id !== trn.id),
      trn
    ]
  },
  deleteTrn(state, id) {
    state.all = state.all.filter(t => t.id !== id)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
