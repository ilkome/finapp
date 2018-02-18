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
        const formatedValues = {
          name: values.name.trim(),
          countTotal: values.countTotal ? 1 : 0,
          currency: values.currency ? values.currency : 'RUB',
          order: values.order ? values.order : 100,
          color: values.color
        }

        const db = await firebase.database()
        const result = await db.ref(`users/${rootState.user.user.uid}/accounts`).push(formatedValues)
          .then(async (data) => {
            return true
          })
        return result
      } catch (error) {
        throw error
      }
    },
    async deleteAccount({ commit, rootState }, id) {
      try {
        const db = await firebase.database()
        await db.ref(`users/${rootState.user.user.uid}/accounts/${id}`)
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
        const id = values.id
        const trns = rootState.trns.all
        const formatedValues = {
          name: values.name,
          countTotal: values.countTotal,
          currency: values.currency,
          order: values.order,
          color: values.color
        }

        const db = await firebase.database()
        await db.ref(`users/${rootState.user.user.uid}/accounts/${id}`)
          .update(formatedValues)
          .catch(error => {
            console.error(error)
          })
        const formatedAccount = formatAccount({ id, ...formatedValues }, { trns })

        commit('updateAccount', formatedAccount)
      } catch (error) {
        throw error
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
    toogleAccountList(state, action) {
      switch (action) {
        case 'show':
          state.show = true
          break
        case 'hide':
          state.show = false
          break
        default:
          state.show = !state.show
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
