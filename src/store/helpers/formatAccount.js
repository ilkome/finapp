/**
 * Format account.
 * @param {object} account - Account for format.
 * @param {object} options  - Options.
 * @return {object} Formated account.
 */
export default function formatAccount(account, options) {
  if (options) {
    if (options.trns.length < 0) {
      console.error('formatTrn: must to have trns')
      return false
    }
  } else {
    console.error('formatTrn: must to have options')
    return false
  }

  const incomesTrns = options.trns.filter(t => t.type === 1)
  const expensesTrns = options.trns.filter(t => t.type === 0)

  function countTotal(trns, type) {
    return trns.reduce((sum, current) => sum + current[type], 0)
  }

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
}
