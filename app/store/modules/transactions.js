import axios from 'axios'
import orderBy from 'lodash/orderBy'
import { getTransactions } from '../../api/api'
import { TRANSACTIONS_URL } from '../../constants'

function formatTrn(trn) {
  const accountId = +trn.accountId
  const categoryId = +trn.categoryId
  const currency = trn.currency

  const account = accounts.find(a => a.id === accountId)
  const accountName = (account && account.name) ? account.name : 'Account name not found'
  if (!account) console.error('store.transitions.getters.trns.account')

  const category = categories.find(cat => cat.id === categoryId)
  const categoryName = (category && category.name) ? category.name : 'Category name not found'
  if (!category) console.error('store.transitions.getters.trns.category')

  let rate = 0
  if (currency !== 'RUB') {
    rate = (rates && rates[currency]) ? rates[currency] : false
    if (!rate) console.error('store.transitions.getters.trns.rate')
  }

  const amount = Math.abs(trn.amount)
  const amountRub = currency === 'RUB'
    ? Math.abs(trn.amount)
    : Math.floor(Math.abs(trn.amount / rate))
  const date = +trn.date
  const id = +trn.id
  const type = +trn.type
  const description = trn.description

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
    description
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
  trns(state, getters, rootState) {
    return state.all
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
  async fetchTrns({ commit, state, rootState }) {
    const trns = await getTransactions()
    const accounts = rootState.accounts.all
    const categories = rootState.categories.all
    const rates = rootState.rates.all

    if (!accounts || accounts.length < 0) {
      console.error('store.transitions.getters.trns.accounts')
      return false
    }

    if (!categories || categories.length < 0) {
      console.error('store.transitions.getters.trns.categories')
      return false
    }

    if (!trns || trns.length < 0) {
      console.error('store.transitions.getters.trns.trns')
      return false
    }

    if (!rates || rates.length < 0) {
      console.error('store.transitions.getters.trns.rates')
      return false
    }

    // Add to trn extra info
    const formatedTrns = trns.map(trn => {
      const accountId = +trn.accountId
      const categoryId = +trn.categoryId
      const currency = trn.currency

      const account = accounts.find(a => a.id === accountId)
      const accountName = (account && account.name) ? account.name : 'Account name not found'
      if (!account) console.error('store.transitions.getters.trns.account')

      const category = categories.find(cat => cat.id === categoryId)
      const categoryName = (category && category.name) ? category.name : 'Category name not found'
      if (!category) console.error('store.transitions.getters.trns.category')

      let rate = 0
      if (currency !== 'RUB') {
        rate = (rates && rates[currency]) ? rates[currency] : false
        if (!rate) console.error('store.transitions.getters.trns.rate')
      }

      const amount = Math.abs(trn.amount)
      const amountRub = currency === 'RUB'
        ? Math.abs(trn.amount)
        : Math.floor(Math.abs(trn.amount / rate))
      const date = +trn.date
      const id = +trn.id
      const type = +trn.type
      const description = trn.description

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
        description
      }
    })
    commit('fetchTrns', formatedTrns)
  },

  // add
  async addTrn({ commit, state, rootState }, values) {
    try {
      console.log('values:', values)
      const postData = await axios.post(TRANSACTIONS_URL, values)
      console.log('post:', postData)
      console.log('post.data:', postData.data)

      if (postData.data) {
        // few trns
        if (Array.isArray(postData.data)) {
          const trns = []
          for (const trnId of postData.data) {
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
          console.log('getNewTrn data:', getTrn.data)
          const trns = state.all

          const accounts = rootState.accounts.all
          const categories = rootState.categories.all
          const rates = rootState.rates.all

          if (!accounts || accounts.length < 0) {
            console.error('store.transitions.getters.trns.accounts')
            return false
          }

          if (!categories || categories.length < 0) {
            console.error('store.transitions.getters.trns.categories')
            return false
          }

          if (!trns || trns.length < 0) {
            console.error('store.transitions.getters.trns.trns')
            return false
          }

          if (!rates || rates.length < 0) {
            console.error('store.transitions.getters.trns.rates')
            return false
          }

          const trn = getTrn.data
          const accountId = +trn.accountId
          const categoryId = +trn.categoryId
          const currency = trn.currency

          const account = accounts.find(a => a.id === accountId)
          const accountName = (account && account.name) ? account.name : 'Account name not found'
          if (!account) console.error('store.transitions.getters.trns.account')

          const category = categories.find(cat => cat.id === categoryId)
          const categoryName = (category && category.name) ? category.name : 'Category name not found'
          if (!category) console.error('store.transitions.getters.trns.category')

          let rate = 0
          if (currency !== 'RUB') {
            rate = (rates && rates[currency]) ? rates[currency] : false
            if (!rate) console.error('store.transitions.getters.trns.rate')
          }

          const amount = Math.abs(trn.amount)
          const amountRub = currency === 'RUB'
            ? Math.abs(trn.amount)
            : Math.floor(Math.abs(trn.amount / rate))
          const date = +trn.date
          const id = +trn.id
          const type = +trn.type
          const description = trn.description

          const newTrn = {
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
            description
          }

          console.log('formatedNewTrn:', newTrn)
          commit('addTrn', newTrn)
        }
      } else {
        console.error('No post.data')
        return false
      }
      console.log('Ok!')
      return true
    } catch (error) {
      console.error('Error :', error)
      return false
    }
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
        await commit('updateTrn', getTrn.data)
      } else {
        console.error('Ошибка обновления транзакции 1')
      }
    } catch (e) {
      console.error('Ошибка обновления транзакции 2')
    }
  },

  // delete
  async deleteTrn({ commit }, id) {
    console.log('id:', id)
    const request = await axios.delete(`${TRANSACTIONS_URL}/${id}`)
    console.log('result: ', request.data)
    const result = request.data
    if (result === 1) {
      console.log('Ok!')
      commit('deleteTrn', id)
    } else {
      console.error('Not deleted')
    }
  },

  async deleteTrns({ commit }, ids) {
    const request = await axios.delete(`${TRANSACTIONS_URL}/${ids.join()}`)
    const result = request.data

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
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
