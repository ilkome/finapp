import axios from 'axios'
import { ACCOUNTS_URL, CATEGORIES_URL, TRANSACTIONS_URL } from '../constants'

// getAccounts
// ==============================================
async function getAccounts() {
  const request = await axios.get(ACCOUNTS_URL, {
    params: {
      transform: 1
    }
  })
  return request.data.accounts
}

// getCategories
// ==============================================
async function getCategories() {
  const request = await axios.get(CATEGORIES_URL, {
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
    const request = await axios.get(TRANSACTIONS_URL, {
      params: {
        transform: 1,
        order: 'date, desc'
      }
    })
    return request.data.transactions
  } catch (e) {
    console.log('getTransactions', e.message)
  }
}


// Export
// ==============================================
export {
  getAccounts,
  getCategories,
  getRates,
  getTransactions
}
