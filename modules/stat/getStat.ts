import { useContext } from '@nuxtjs/composition-api'

/**
 * Get first item in sorted catgories
 *
 * @param {*} categoriesTotal
 * @param {*} categoriesIds
 * @param {*} typeName
 * @return {*}
 */
function getBiggestAmount (categoriesTotal, categoriesIds, typeName) {
  const biggestAmount = categoriesIds[0]
  return categoriesTotal[biggestAmount] && Math.abs(categoriesTotal[biggestAmount][typeName])
}

/**
 * Return default getStat
 *
 * @export
 * @param {*} [trnsIds=[]]
 * @return {*}
 */
export default function getStat () {
  const { store } = useContext()

  function getStatBy (trnsIds = []) {
    const categoriesWithTrnsIds = store.getters['stat/getCategoriesIdsWithTrnsIds']({ trnsIds })
    const totalAllTrns = store.getters['trns/getTotalOfTrnsIds'](trnsIds)

    // count total in categories
    const categoriesTotal = {}
    for (const categoryId in categoriesWithTrnsIds) {
      categoriesTotal[categoryId] = store.getters['trns/getTotalOfTrnsIds'](categoriesWithTrnsIds[categoryId])
    }

    // separate catgories by incomes and expenses
    const statIncomes = {}
    const statExpenses = {}
    for (const categoryId in categoriesWithTrnsIds) {
      const total = categoriesTotal[categoryId]
      if (total.incomes > 0) { statIncomes[categoryId] = total }
      if (total.expenses > 0) { statExpenses[categoryId] = total }
    }

    // sorted
    const incomesCategoriesIds = Object.keys(statIncomes)
    const expensesCategoriesIds = Object.keys(statExpenses)

    // biggest
    const expensesBiggest = getBiggestAmount(categoriesTotal, expensesCategoriesIds, 'expenses')
    const incomesBiggest = getBiggestAmount(categoriesTotal, incomesCategoriesIds, 'incomes')

    const stat = {
      categories: categoriesTotal,
      total: totalAllTrns.total,
      expenses: {
        biggest: expensesBiggest,
        categoriesIds: expensesCategoriesIds,
        total: totalAllTrns.expenses
      },
      incomes: {
        biggest: incomesBiggest,
        categoriesIds: incomesCategoriesIds,
        total: totalAllTrns.incomes
      }
    }

    return stat
  }

  return {
    getStatBy
  }
}
