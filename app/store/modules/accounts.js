import { getAccounts } from '../../api/api'

const store = {
  state: {
    all: []
  },

  getters: {
    accounts(state, getters) {
      let accounts = state.all
      const incomesTrns = getters.incomes.slice(0, 100)
      const expensesTrns = getters.expenses.slice(0, 100)

      function getTotal(trns, type) {
        return trns.reduce((sum, current) => sum + current[type], 0)
      }

      // find all trns in this account and sum amount
      accounts = accounts.map((account) => {
        const accountIncomes = incomesTrns.filter(trn => trn.accountId === account.id)
        const accountExpenses = expensesTrns.filter(trn => trn.accountId === account.id)

        const totalIncomes = getTotal(accountIncomes, 'amount')
        const totalIncomesRub = getTotal(accountIncomes, 'amountRub')
        const totalExpenses = getTotal(accountExpenses, 'amount')
        const totalExpensesRub = getTotal(accountExpenses, 'amountRub')

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

      return accounts
    }
  },

  actions: {
    async fetchAccounts({ commit }) {
      const data = await getAccounts()
      commit('fetchAccounts', data)
    }
  },

  mutations: {
    fetchAccounts(state, data) {
      state.all = data
    }
  }
}

export default store
