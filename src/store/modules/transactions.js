import firebase from 'firebase'
import moment from 'moment'
import orderBy from 'lodash/orderBy'
import formatTrn from '../helpers/formatTrn'

// state
// ==============================================
const state = {
  all: []
}

// getters
// ==============================================
const getters = {
  trns(state) {
    return orderBy(state.all, trn => trn.date, 'desc')
  },

  getTrns: (state, getters) => (options) => {
    let trns = getters.trns

    function getTrnsInCategoryWithChildren(trns, categoryId) {
      const category = getters.categories.find(category => category.id === categoryId)
      const childCategories = getters.categories.filter(category => category.parentId === categoryId)
      let selectedTrns = []

      // Get trns from all child categories
      if (category.parentId === 0) {
        selectedTrns = trns.filter(trn => {
          return childCategories.filter(cat => cat.id === trn.categoryId).length || trn.categoryId === category.id
        })
      }

      // Get trns only from this category
      if (category.parentId !== 0) {
        selectedTrns = trns.filter(trn => trn.categoryId === categoryId)
      }
      return selectedTrns
    }

    // With options
    if (options) {
      // Transfers
      if (!options.showTransfers) {
        const transferCategory = getters.categories.find(trn => trn.name === 'Перевод')
        if (transferCategory) {
          trns = trns.filter(trn =>
            trn.categoryId !== transferCategory.id)
        }
      }

      if (options.startDate && options.endDate) {
        trns = trns.filter(trn =>
          trn.date >= moment(options.startDate).startOf('day').valueOf() &&
          trn.date <= moment(options.endDate).endOf('day').valueOf())
      }

      if (options.accountId) {
        trns = trns.filter(trn => trn.accountId === options.accountId)
      }

      if (options.categoryId) {
        // trns = trns.filter(trn => trn.categoryId === options.categoryId)
        trns = getTrnsInCategoryWithChildren(trns, options.categoryId)
      }
    }

    if (trns) {
      return orderBy(trns, trn => trn.date, 'desc')
    }
  }
}

// Actions
// ==============================================
const actions = {
  async setTrns({ commit, state, rootState }, data) {
    if (data && data.trns) {
      try {
        const trns = data.trns
        const rates = rootState.rates.all
        const accounts = rootState.accounts.all
        const categories = rootState.categories.all
        const formatedTrns = []

        for (const key in trns) {
          const formatedTrn = formatTrn(trns[key], { accounts, categories, rates })
          formatedTrns.push({
            ...formatedTrn,
            id: key
          })
        }

        commit('setTrns', formatedTrns)
      } catch (error) {
        throw new Error(error.message)
      }
    }
  },

  async addTrn({ commit, state, rootState }, values) {
    try {
      const accounts = rootState.accounts.all
      const categories = rootState.categories.all
      const rates = rootState.rates.all

      const db = await firebase.database()
      await db.ref(`users/${rootState.user.user.uid}/trns`).push(values)
        .then(async (data) => {
          const newTrn = {
            id: data.key,
            accountId: values.accountId,
            amount: values.amount,
            categoryId: values.categoryId,
            date: values.date,
            description: values.description,
            currency: values.currency,
            type: values.type
          }
          const formatedNewTrn = formatTrn(newTrn, { accounts, categories, rates })
          commit('addTrn', formatedNewTrn)
          commit('closeLoader')
          return true
        })
        .catch(error => {
          commit('showError', `store/transitions/addTrn: ${error.message}`)
        })
      return true
    } catch (error) {
      commit('showError', `store/transitions/addTrn: ${error.message}`)
    }
  },

  async updateTrn({ commit, state, rootState }, values) {
    try {
      const accounts = rootState.accounts.all
      const categories = rootState.categories.all
      const rates = rootState.rates.all
      const formatedValues = {
        id: values.id,
        accountId: values.accountId,
        amount: values.amount,
        categoryId: values.categoryId,
        date: values.date,
        description: values.description,
        currency: values.currency,
        type: values.type
      }
      const db = await firebase.database()
      db.ref(`users/${rootState.user.user.uid}/trns/${formatedValues.id}`)
        .update(formatedValues)
        .catch(error => {
          console.error(error)
          commit('showError', `store/transitions/updateTrn: ${error.message}`)
        })
      const formatedNewTrn = formatTrn(formatedValues, { accounts, categories, rates })
      commit('updateTrn', formatedNewTrn)
      commit('closeLoader')
    } catch (error) {
      commit('showError', `store/transitions/updateTrn: ${error.message}`)
    }
  },

  async deleteTrn({ commit, rootState }, id) {
    try {
      const db = await firebase.database()
      db.ref(`users/${rootState.user.user.uid}/trns/${id}`)
        .remove()
        .catch(error => {
          console.error(error)
          commit('showError', `store/transitions/deleteTrn: ${error.message}`)
        })
      commit('deleteTrn', id)
    } catch (error) {
      commit('showError', `store/transitions/deleteTrn: ${error.message}`)
    }
  }
}

// mutations
// ==============================================
const mutations = {
  setTrns(state, trns) {
    state.all = trns
  },
  addTrn(state, trn) {
    state.all.unshift(trn)
  },
  updateTrn(state, trn) {
    state.all = [
      trn,
      ...state.all.filter(t => t.id !== trn.id)
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
