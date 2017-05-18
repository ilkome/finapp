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
    const trns = state.all
    const accounts = rootState.accounts.all
    const categories = rootState.categories.all
    const rates = rootState.rates.all

    if(!categories || categories.length < 0) {
      console.error('store.transitions.getters.trns.categories')
      return false
    }

    // Add to trn extra info
    const formatedTrns = trns.map(trn => {
      const accountId = +trn.accountId
      const categoryId = +trn.categoryId
      const currency = trn.currency

      const account = accounts.find(a => a.id === accountId)
      if (!account) console.error('store.transitions.getters.trns.account')

      const category = categories.find(cat => cat.id === categoryId)
      if (!category) console.error('store.transitions.getters.trns.category')

      let rate = 0
      if (currency !== 'RUB') {
        rate = (rates && rates[currency]) ? rates[currency] : false
        if (!rate) console.error('store.transitions.getters.trns.rate')
      }


      const accountName = (account && account.name) ? account.name : 'Account name not found'
      const amount = Math.abs(trn.amount)
      const amountRub = currency !== 'RUB'
        ? Math.floor(Math.abs(trn.amount / rate))
        : Math.abs(trn.amount)

      const categoryName = (category && category.name) ? category.name : 'Category name not found'

      const date = +trn.date
      const id = +trn.id
      const type = +trn.type
      const description = trn.description
      const symbol = (account && account.symbol) ? account.symbol : 'Symbol not found'

      return {
        accountId,
        accountName,
        amount,
        amountRub,
        categoryId,
        categoryName,
        currency,
        date,
        id,
        type,
        description,
        symbol
      }
    })

    const orderedTrns = orderBy(formatedTrns, 'date', 'desc')
    return orderedTrns
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
  // Fetch
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
              return false
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
        return false
      }

      commit('setStatus', 'Транзакция создана :)')
      dispatch('setAppStatus', 'Создано!')
      setTimeout(() => commit('setStatus'), 2000)
      return true
    } catch (e) {
      console.error('ошибка создания транзакции 2.')
      dispatch('setAppStatus', 'Ошибка создания транзакции')
      return false
    }
  },

  // update
  async updateTrn({ commit, dispatch }, trn) {
    try {
      commit('setStatus', 'Updating...')
      const updatedTrn = await axios.put(`${TRANSACTIONS_URL}/${trn.id}`, trn)
      const result = updatedTrn.data

      // if ok
      if (result === 1) {
        const getTrn = await axios.get(`${TRANSACTIONS_URL}/${trn.id}`, {
          params: { transform: 1 }
        })
        await commit('updateTrn', getTrn.data)
        await commit('setStatus', 'Updated!')
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
