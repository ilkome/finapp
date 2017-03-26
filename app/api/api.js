import axios from 'axios'
import { ACCOUNTS_URL, CATEGORIES_URL, TRANSACTIONS_URL } from '../constants'

// Get accounts
// ==============================================
async function getAccounts() {
  const request = await axios.get(ACCOUNTS_URL, {
    params: {
      transform: 1
    }
  })
  return request.data.accounts
}

// Get accounts
// ==============================================
// async function getAccount(accountId) {
//   const request = await axios.get(ACCOUNTS_URL, {
//     params: {
//       transform: 1
//     }
//   })
//   return request.data.accounts
// }

// Create account
// ==============================================
async function addAccount(account) {
  try {
    const newAccount = await axios.post(`${ACCOUNTS_URL}`, account)
    if (newAccount.data > 0) {
      const account = await axios.get(`${ACCOUNTS_URL}/${newAccount.data}`, {
        params: { transform: 1 }
      })
      if (account.data) {
        return account.data
      } else {
        console.error('api.js: Не возможно получить новый кошелек')
      }
    } else {
      console.error('api.js: Add account data empty')
      return false
    }
  } catch (e) {
    console.error('api.js: add account', e.message)
  }
}

// Update account
// ==============================================
// async function updateAccount(accountId) {
//   try {
//     console.log(accountId)
//     const result = await axios.delete(`${ACCOUNTS_URL}/${accountId}`)
//     console.log(result)
//   } catch (e) {
//     console.log('deleteAccount', e.message)
//   }
// }

// Delete account
// ==============================================
async function deleteAccount(accountId) {
  try {
    const deletedAccount = await axios.delete(`${ACCOUNTS_URL}/${accountId}`)
    if (deletedAccount.data > 0) {
      return true
    } else {
      console.error('api.js: Add account data empty')
      return false
    }
  } catch (e) {
    console.error('deleteAccount', e.message)
  }
}

// Get categories
// ==============================================
async function getCategories() {
  const request = await axios.get(CATEGORIES_URL, {
    params: {
      transform: 1,
      order: 'name, asc'
    }
  })
  return request.data.categories
}

// Get rates
// ==============================================
async function getRates() {
  const request = await axios.get('http://api.fixer.io/latest?base=RUB')
  return request.data.rates
}

// Get transactions
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
  addAccount,
  deleteAccount,
  getCategories,
  getRates,
  getTransactions
}
