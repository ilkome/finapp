import axios from 'axios'
import _ from 'lodash'
import moment from 'moment'
import { getTransactions } from '../../api/api'
import APP from '../../constants'


function prepareValues(values) {
  return {
    ...values,
  }
}


// state
// ======================
const state = {
  all: [],
  last: {},
  status: ''
}


// getters
// ==============================================
const getters = {
  trns(state, getters, rootState) {
    let trns = state.all
    const accounts = rootState.accounts.all
    const categories = rootState.categories.all
    const rates = rootState.rates.all

    // add to trns extra info
    trns = trns.map(trn => ({
      ...trn,
      accountName: accounts.find(a => a.id === trn.accountId).name,
      amount: Math.abs(trn.amount),
      amountRub: trn.currency !== 'RUB'
        ? Math.abs(trn.amount) / rates[trn.currency]
        : Math.abs(trn.amount),
      categoryName: categories.find(cat => cat.id === trn.categoryId).name,
      symbol: accounts.find(account => account.id === trn.accountId).symbol
    }))
    const sortedTrns = _.orderBy(trns, 'date', 'desc')
    return sortedTrns
  },

  expenses(state, getters) {
    return getters.trns.filter(t => t.type === 0)
  },

  incomes(state, getters) {
    return getters.trns.filter(t => t.type === 1)
  }
}


// actions
// ==============================================
const actions = {
  // add
  async addTrn({ commit }, values) {
    commit('setStatus', 'Создание...')
    try {
      const postTrn = await axios.post(APP.TRANSACTIONS_URL, values)
      const newID = postTrn.data
      const getTrn = await axios.get(`${APP.TRANSACTIONS_URL}/${newID}`, {
        params: { transform: 1 }
      })
      commit('addTrn', getTrn.data)
      commit('setStatus', 'Транзакция создана :)')
      setTimeout(() => commit('setStatus'), 2000)
    } catch (e) {
      commit('setGlobalStatus', 'Ошибка создания транзакции')
    }
  },

  // fetch
  async fetchTrns({ commit }) {
    const trns = await getTransactions()
    commit('fetchTrns', trns)
  },

  // update
  async updateTrn({ commit }, trn) {
    try {
      const updatedTrn = await axios.put(`${APP.TRANSACTIONS_URL}/${trn.id}`, trn)
      const result = updatedTrn.data

      // if ok
      if (result === 1) {
        const getTrn = await axios.get(`${APP.TRANSACTIONS_URL}/${trn.id}`, {
          params: { transform: 1 }
        })
        commit('updateTrn', getTrn.data)
        commit('setStatus', 'Транзакция обновлена :)')
        setTimeout(() => commit('setStatus'), 2000)
      } else {
        commit('setGlobalStatus', 'Ошибка создания транзакции 1')
      }
    } catch (e) {
      commit('setGlobalStatus', 'Ошибка создания транзакции 2')
    }
  },

  // delete
  async deleteTrn({ commit }, id) {
    const request = await axios.delete(`${APP.TRANSACTIONS_URL}/${id}`)
    const result = request.data
    if (result === 1) {
      commit('setGlobalStatus', 'Удалено')
      commit('deleteTrn', id)
    } else {
      commit('setGlobalStatus', 'Не удалено')
    }
  }
}


// mutations
// ==============================================
const mutations = {
  addTrn(state, trn) {
    state.all.push(trn)
  },
  updateTrn(state, trn) {
    state.all = [
      ...state.all.filter(t => t.id !== trn.id),
      trn
    ]
  },
  fetchTrns(state, trns) {
    state.all = trns
  },
  deleteTrn(state, id) {
    state.all = state.all.filter(t => t.id !== id)
  },
  setStatus(state, status) {
    state.status = status
  }
}


export default {
  state,
  getters,
  actions,
  mutations
}
