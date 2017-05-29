import { getAccounts, addAccount, deleteAccount } from '../../api/api'

const store = {
  state: {
    all: []
  },

  getters: {
    accounts(state, getters) {
      const accounts = state.all
      const incomesTrns = getters.trns.filter(t => t.type === 1)
      const expensesTrns = getters.trns.filter(t => t.type === 0)

      function countTotal(trns, type) {
        return trns.reduce((sum, current) => sum + current[type], 0)
      }

      // find all trns in this account and sum amount
      const formatedAccounts = accounts.map((account) => {
        const accountIncomes = incomesTrns.filter(trn => trn.accountId === account.id)
        const accountExpenses = expensesTrns.filter(trn => trn.accountId === account.id)

        const totalIncomes = countTotal(accountIncomes, 'amount')
        const totalIncomesRub = countTotal(accountIncomes, 'amountRub')
        const totalExpenses = countTotal(accountExpenses, 'amount')
        const totalExpensesRub = countTotal(accountExpenses, 'amountRub')
        const total = totalIncomes - totalExpenses
        const totalRub = totalIncomesRub - totalExpensesRub

        return {
          ...account,
          total,
          totalRub,
          totalIncomes,
          totalIncomesRub,
          totalExpenses,
          totalExpensesRub
        }
      })

      return formatedAccounts
    }
  },

  actions: {
    async fetchAccounts({ commit }) {
      const data = await getAccounts()
      commit('fetchAccounts', data)
      return true
    },
    async addAccount({ commit }, account) {
      const newAccount = await addAccount(account)
      commit('addAccount', newAccount)
    },
    async deleteAccount({ commit }, accountID) {
      const deleted = await deleteAccount(accountID)
      if (deleted) {
        commit('deleteAccount', accountID)
      }
    }
  },

  mutations: {
    fetchAccounts(state, data) {
      state.all = data
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
