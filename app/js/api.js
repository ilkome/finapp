import axios from 'axios'
import _ from 'lodash'
import APP from './constants'

// getAccounts
// ==============================================
async function getAccounts() {
  const request = await axios.get(APP.ACCOUNTS_URL, {
    params: {
      transform: 1
    }
  })
  return request.data.accounts
}

// getCategories
// ==============================================
async function getCategories() {
  const request = await axios.get(APP.CATEGORIES_URL, {
    params: {
      transform: 1
    }
  })
  return request.data.categories
}

// getRates
// ==============================================
async function getRates() {
  const request = await axios.get('http://api.fixer.io/latest?base=RUB')
  return request.data.rates
}

// getTransactions
// ==============================================
async function getTransactions() {
  try {
    const request = await axios.get(APP.TRANSACTIONS_URL, {
      params: {
        transform: 1
      }
    })
    return request.data.transactions
  } catch (e) {
    console.log(e)
  }
}

// getAppData
// ==============================================
async function getAppData() {
  let accounts = await getAccounts()
  const categories = await getCategories()
  const rates = await getRates()

  let trns = await getTransactions()
  trns = _.orderBy(trns, 'date', 'desc')

  // Transactions
  const allTrns = trns
    .map(t => ({
      ...t,
      accountName: accounts.find(a => a.id === t.accountId).name,
      amount: Math.abs(t.amount),
      amountRub: t.currency !== 'RUB' ? Math.abs(t.amount) / rates[t.currency] : Math.abs(t.amount),
      categoryName: categories.find(c => c.id === t.categoryId).name,
      symbol: accounts.find(a => a.id === t.accountId).symbol
    }))
  const expensesTrns = allTrns.filter(t => t.type === 0)
  const incomesTrns = allTrns.filter(t => t.type === 1)

  const sum = (accountId, transactions, amountType) => (
    transactions
      .filter(t => t.accountId === accountId)
      .reduce((total, current) => total + current[amountType], 0)
  )

  // accounts
  accounts = accounts.map((a) => {
    // Подумать с филтром в сумме
    const total = sum(a.id, incomesTrns, 'amount') - sum(a.id, expensesTrns, 'amount')
    const totalRub = sum(a.id, incomesTrns, 'amountRub') - sum(a.id, expensesTrns, 'amountRub')

    return {
      ...a,
      total,
      totalRub
    }
  })

  return {
    accounts,
    categories,
    rates,
    allTrns,
    expensesTrns,
    incomesTrns
  }
}

// Export
// ==============================================
export {
  getAppData,
  getAccounts,
  getCategories,
  getRates,
  getTransactions
}
