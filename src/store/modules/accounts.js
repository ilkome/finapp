import firebase from 'firebase'
import orderBy from 'lodash/orderBy'
import formatAccount from '../helpers/formatAccount'

const store = {
  state: {
    all: []
  },

  getters: {
    accounts(state, getters) {
      const trns = getters.trns
      const formatedAccounts = state.all.map(account => {
        return formatAccount(account, { trns })
      })
      return orderBy(formatedAccounts, a => a.order, 'asc')
    }
  },

  actions: {
    async setAccounts({ commit }, data) {
      if (data && data.accounts) {
        const accounts = data.accounts
        const preparedAccounts = []

        for (const key in accounts) {
          preparedAccounts.push({
            ...accounts[key],
            id: key
          })
        }
        commit('setAccounts', preparedAccounts)
      }
    },

    async addAccount({ commit, rootState }, values) {
      try {
        commit('showLoader')
        const db = await firebase.database()
        const result = await db.ref(`users/${rootState.user.user.uid}/accounts`).push(values)
          .then(async (data) => {
            const key = data.key
            const newAccount = {
              ...values,
              id: key
            }
            commit('addAccount', newAccount)
            commit('closeLoader')
            return true
          })
          .catch(error => {
            commit('showError', `store/accounts/addAccount: ${error.message}`)
          })
        return result
      } catch (error) {
        commit('showError', `store/accounts/addAccount: ${error.message}`)
      }
    },

    async deleteAccount({ commit, rootState }, id) {
      try {
        const db = await firebase.database()
        db.ref(`users/${rootState.user.user.uid}/accounts/${id}`)
          .remove()
          .catch(error => {
            console.error(error)
            commit('showError', `store/accounts/deleteAccount: ${error.message}`)
          })
        commit('deleteAccount', id)
      } catch (error) {
        commit('showError', `store/accounts/deleteAccount: ${error.message}`)
      }
    }
  },

  mutations: {
    setAccounts(state, accounts) {
      state.all = accounts
    },
    addAccount(state, account) {
      state.all.unshift(account)
    },
    deleteAccount(state, accountId) {
      state.all = state.all.filter(a => a.id !== accountId)
    }
  }
}

export default store
