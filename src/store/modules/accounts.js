import firebase from 'firebase'
import orderBy from 'lodash/orderBy'
import formatAccount from '../helpers/formatAccount'

const store = {
  state: {
    all: [],
    show: false,
    edit: false,
    editAccount: null,
    create: false
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
    },
    async updateAccount({ commit, state, rootState }, values) {
      try {
        const trns = rootState.trns.all

        const db = await firebase.database()
        db.ref(`users/${rootState.user.user.uid}/accounts/${values.id}`)
          .update(values)
          .catch(error => {
            console.error(error)
            commit('showError', `store/accounts/updateAccount: ${error.message}`)
          })
        const formatedAccount = formatAccount(values, { trns })

        commit('updateAccount', formatedAccount)
        commit('closeLoader')
      } catch (error) {
        console.error(error)
        commit('showError', `store/accounts/updateAccount: ${error.message}`)
      }
    }
  },

  mutations: {
    setAccounts(state, accounts) {
      state.all = accounts
    },
    setEditAccount(state, account) {
      state.editAccount = account
    },
    addAccount(state, account) {
      state.all.unshift(account)
    },
    deleteAccount(state, accountId) {
      state.all = state.all.filter(a => a.id !== accountId)
    },
    toogleAccountCreate(state, action) {
      state.edit = false
      state.editAccount = null
      switch (action) {
        case 'show':
          state.create = true
          break
        case 'hide':
          state.create = false
          break
        default:
          state.create = !state.create
      }
    },
    toogleAccountEdit(state, action) {
      state.create = false
      switch (action) {
        case 'show':
          state.edit = true
          break
        case 'hide':
          state.edit = false
          break
        default:
          if (state.edit) {
            state.edit = false
            state.editAccount = null
          } else {
            state.edit = true
          }
      }
    },
    updateAccount(state, account) {
      const accounts = [
        account,
        ...state.all.filter(c => c.id !== account.id)
      ]
      state.all = accounts
    }
  }
}

export default store
