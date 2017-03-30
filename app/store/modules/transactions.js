import axios from 'axios'
import orderBy from 'lodash/orderBy'
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
      id: +trn.id,
      currency: trn.currency,
      date: +trn.date,
      type: +trn.type,
      accountId: +trn.accountId,
      categoryId: +trn.categoryId,
      accountName: accounts.find(a => a.id === trn.accountId).name,
      amount: Math.abs(trn.amount),
      amountRub: trn.currency !== 'RUB'
        ? Math.floor(Math.abs(trn.amount / rates[trn.currency]))
        : Math.abs(trn.amount),
      categoryName: categories.find(cat => cat.id === trn.categoryId).name,
      symbol: accounts.find(account => account.id === trn.accountId).symbol
    }))

    const orderedTrns = orderBy(trns, 'date', 'desc')
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
  // fetch
  async fetchTrns({ commit }) {
    const trns = await getTransactions()
    commit('fetchTrns', trns)
  },

  // add
  async addTrn({ commit, dispatch }, values) {
    commit('setStatus', 'Создание...')
    dispatch('setAppStatus', 'Создание...', false)
    try {
      const postData = await axios.post(TRANSACTIONS_URL, values)

      if (postData.data) {
        // few trns
        if (Array.isArray(postData.data)) {
          const trns = []
          for (let trnId of postData.data) {
            const newTrns = await axios.get(`${TRANSACTIONS_URL}/${trnId}`, {
              params: { transform: 1 }
            })
            if (newTrns.data) {
              trns.push(newTrns.data)
            } else {
              console.error('что-то не так')
            }
          }
          commit('addTrns', trns)
        }

        // one trn
        if (Number.isInteger(postData.data)) {
          const getTrn = await axios.get(`${TRANSACTIONS_URL}/${postData.data}`, {
            params: { transform: 1 }
          })
          commit('addTrn', getTrn.data)
        }
      } else {
        console.error('Ошибка создания транзакции.')
      }

      commit('setStatus', 'Транзакция создана :)')
      dispatch('setAppStatus', 'Создано!')
      setTimeout(() => commit('setStatus'), 2000)

      return true
    } catch (e) {
      console.error('ошибка создания транзакции 2.')
      dispatch('setAppStatus', 'Ошибка создания транзакции')
    }
  },

  // update
  async updateTrn({ commit, dispatch }, trn) {
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
        dispatch('setAppStatus', 'Ошибка создания транзакции 1')
      }
    } catch (e) {
      dispatch('setAppStatus', 'Ошибка создания транзакции 2')
    }
  },

  // delete
  async deleteTrn({ commit, dispatch }, id) {
    dispatch('setAppStatus', `Удаление ${id}...`, false)
    const request = await axios.delete(`${TRANSACTIONS_URL}/${id}`)
    const result = request.data
    if (result === 1) {
      dispatch('setAppStatus', `Удалено ${id}`)
      commit('deleteTrn', id)
    } else {
      dispatch('setAppStatus', `Не удалено ${id}`)
    }
  },

  async deleteTrns({ commit, dispatch }, ids) {
    dispatch('setAppStatus', `Удаление ${ids}...`, false)
    const request = await axios.delete(`${TRANSACTIONS_URL}/${ids.join()}`)
    const result = request.data
    console.log(ids, result)

    result.forEach((res, index) => {
      if (res > 0) {
        commit('deleteTrn', ids[index])
      } else {
        console.log(`не удалось удалить id: ${ids[index]}`)
      }
    })
  }
}

// mutations
// ==============================================
const mutations = {
  fetchTrns(state, trns) {
    state.all = trns
  },
  addTrn(state, trn) {
    state.all.push(trn)
  },
  addTrns(state, trn) {
    state.all.push(...trn)
  },
  updateTrn(state, trn) {
    state.all = [
      ...state.all.filter(t => t.id !== trn.id),
      trn
    ]
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
