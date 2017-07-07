import axios from 'axios'
import { updateTrnasaction, getTrnasaction, addTrnasactions, getAllTransactions, deleteTrnasaction } from './transactions'
import { getRates } from './rates'
import { ACCOUNTS_URL, CATEGORIES_URL } from '../constants'

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
        return false
      }
    } else {
      console.error('api.js: Add account data empty')
      return false
    }
  } catch (e) {
    console.error('api.js: add account', e.message)
    return false
  }
}

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
    return false
  }
}

// Create category
// ==============================================
async function addCategory(category) {
  try {
    const newCategory = await axios.post(`${CATEGORIES_URL}`, category)
    if (newCategory.data > 0) {
      const category = await axios.get(`${CATEGORIES_URL}/${newCategory.data}`, {
        params: { transform: 1 }
      })
      if (category.data) {
        return category.data
      } else {
        console.error('api.js: category')
        return false
      }
    } else {
      console.error('api.js: Add category data empty')
      return false
    }
  } catch (e) {
    console.error('api.js: add category', e.message)
    return false
  }
}

// Get categories
// ==============================================
async function getCategories() {
  try {
    const request = await axios.get(CATEGORIES_URL, {
      params: {
        transform: 1,
        order: 'name, asc'
      }
    })
    return request.data.categories
  } catch (e) {
    console.error('getCategories', e.message)
    return false
  }
}

// Export
// ==============================================
export {
  getRates,

  getAccounts,
  addAccount,
  deleteAccount,

  getCategories,
  addCategory,

  getAllTransactions,
  getTrnasaction,
  addTrnasactions,
  updateTrnasaction,
  deleteTrnasaction
}
