export default {
  hasBudgets (state, getters, rootState) {
    if (rootState.budgets.items) {
      if (Object.keys(rootState.budgets.items).length > 0) return true
    }
    return false
  },

  /**
    * Return budgets
    *
    * @return {Object} Object
    * @return {String} {}.name
  */
  budgets (state, getters, rootState, rootGetters) {
    if (!rootGetters.hasBudgets) return null
    const budgets = rootState.budgets.items
    const formatedBudgets = {}

    for (const key in budgets) {
      const trnsInBudget = budgets[key].trnsIds || {}
      const trnsIds = Object.keys(trnsInBudget)
      const total = rootGetters.getTotalOfTrnsIds(trnsIds)

      formatedBudgets[key] = {
        ...budgets[key],
        total
      }
    }

    return formatedBudgets
  },

  /**
    * Return budgets
    *
    * @return {Object} Object
    * @return {String} {}.name
  */
  budgetsTotal (state, getters, rootState, rootGetters) {
    if (!rootGetters.hasBudgets) return null

    const budgets = rootGetters.budgets
    const budgetsTotal = {
      count: Object.keys(rootGetters.budgets).length,
      incomes: 0,
      total: 0
    }

    for (const key in budgets) {
      const budgetItem = budgets[key]
      if (budgetItem.countTotal) {
        budgetsTotal.incomes = budgetsTotal.incomes + budgetItem.total.incomes
        budgetsTotal.total = budgetsTotal.total + budgetItem.amount
      }
    }

    return budgetsTotal
  }
}
