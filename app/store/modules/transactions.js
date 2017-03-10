import axios from 'axios'
import _ from 'lodash'
import { getTransactions } from '../../api/api'
import { TRANSACTIONS_URL } from '../../constants'

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
      id: trn.id,
      currency: trn.currency,
      date: trn.date,
      type: trn.type,
      accountId: trn.accountId,
      categoryId: trn.categoryId,
      accountName: accounts.find(a => a.id === trn.accountId).name,
      amount: Math.abs(trn.amount),
      amountRub: trn.currency !== 'RUB'
        ? Math.floor(Math.abs(trn.amount / rates[trn.currency]))
        : Math.abs(trn.amount),
      categoryName: categories.find(cat => cat.id === trn.categoryId).name,
      symbol: accounts.find(account => account.id === trn.accountId).symbol
    }))

    const orderedTrns = _.orderBy(trns, 'date', 'desc')
    return orderedTrns
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
      const postTrn = await axios.post(TRANSACTIONS_URL, values)
      const newID = postTrn.data
      const getTrn = await axios.get(`${TRANSACTIONS_URL}/${newID}`, {
        params: { transform: 1 }
      })
      commit('addTrn', getTrn.data)
      commit('setStatus', 'Транзакция создана :)')
      setTimeout(() => commit('setStatus'), 2000)
    } catch (e) {
      commit('setappStatus', 'Ошибка создания транзакции')
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
      const updatedTrn = await axios.put(`${TRANSACTIONS_URL}/${trn.id}`, trn)
      const result = updatedTrn.data

      // if ok
      if (result === 1) {
        const getTrn = await axios.get(`${TRANSACTIONS_URL}/${trn.id}`, {
          params: { transform: 1 }
        })
        commit('updateTrn', getTrn.data)
        commit('setStatus', 'Транзакция обновлена :)')
        setTimeout(() => commit('setStatus'), 2000)
      } else {
        commit('setappStatus', 'Ошибка создания транзакции 1')
      }
    } catch (e) {
      commit('setappStatus', 'Ошибка создания транзакции 2')
    }
  },

  // delete
  async deleteTrn({ commit }, id) {
    const request = await axios.delete(`${TRANSACTIONS_URL}/${id}`)
    const result = request.data
    if (result === 1) {
      commit('setappStatus', 'Удалено')
      commit('deleteTrn', id)
    } else {
      commit('setappStatus', 'Не удалено')
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
