import axios from 'axios'
import _ from 'lodash'
import APP from '../constants'

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
