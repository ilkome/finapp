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
  }
}

// Actions
// ==============================================
const actions = {
  async setTrns({ commit, state, rootState }, trns) {
    try {
      const rates = rootState.rates.all
      const accounts = []
      const categories = []
      const formatedTrns = []

      for (const key in trns.accounts) {
        accounts.push(trns.accounts[key])
      }

      for (const key in trns.categories) {
        categories.push(trns.categories[key])
      }

      for (const key in trns.trns) {
        const formatedTrn = formatTrn(trns.trns[key], { accounts, categories, rates })
        formatedTrns.push({
          ...formatedTrn,
          id: formatedTrn.id ? formatedTrn.id : key
        })
      }

      commit('setTrns', formatedTrns)
    } catch (error) {
      throw new Error(error.message)
    }
  },

  async addTrn({ commit, state, rootState }, values) {
    try {
      const accounts = rootState.accounts.all
      const categories = rootState.categories.all
      const rates = rootState.rates.all

      const db = await firebase.database()
      const result = await db.ref(`users/${rootState.user.user.uid}/trns`).push(values)
        .then(async (data) => {
          const key = data.key
          const newTrn = {
            ...values,
            id: key
          }
          const formatedNewTrn = formatTrn(newTrn, { accounts, categories, rates })
          commit('addTrn', formatedNewTrn)
          commit('closeLoader')
          return true
        })
        .catch(error => {
          commit('showError', `store/transitions/addTrn: ${error.message}`)
        })
      return result
    } catch (error) {
      commit('showError', `store/transitions/addTrn: ${error.message}`)
    }
  },

  async updateTrn({ commit, state, rootState }, values) {
    try {
      const accounts = rootState.accounts.all
      const categories = rootState.categories.all
      const rates = rootState.rates.all

      const db = await firebase.database()
      db.ref(`users/${rootState.user.user.uid}/trns/${values.id}`)
        .update(values)
        .catch(error => {
          console.error(error)
          commit('showError', `store/transitions/addTrn: ${error.message}`)
        })
      const formatedNewTrn = formatTrn(values, { accounts, categories, rates })
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
          commit('showError', `store/transitions/addTrn: ${error.message}`)
        })
      commit('deleteTrn', id)
    } catch (error) {
      commit('showError', `store/transitions/updateTrn: ${error.message}`)
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
