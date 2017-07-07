import axios from 'axios'
import { TRANSACTIONS_URL } from '../constants'

/**
 * Get all trns.
 * @return {Array} Trns array.
 */
async function getAllTransactions() {
  try {
    const groupName = 'api/transactions/@getAllTransactions'
    console.groupCollapsed(groupName)
    const response = await axios.get(TRANSACTIONS_URL, {
      params: {
        transform: 1,
        order: 'date, desc'
      }
    })
    console.log('Responce:', response)
    if (response.status === 200 && response.data) {
      if (response.data.transactions.length > 0) {
        console.log('Responce data:', response.data)
        return response.data.transactions
      } else {
        throw new Error(`${groupName}: 1`)
      }
    } else {
      throw new Error(`${groupName}: Bad response`)
    }
  } catch (error) {
    throw new Error(error.message)
  } finally {
    console.groupEnd()
  }
}

/**
 * Get one trn.
 * @param {number} trnId - Id of trn.
 * @return {object} Trn.
 */
async function getTrnasaction(trnId) {
  try {
    console.groupCollapsed('api/transactions/@getTrnasaction')
    const response = await axios.get(`${TRANSACTIONS_URL}/${trnId}`)
    if (response.status === 200 && response.data) {
      // Every object must have a id
      if (response.data.id) {
        console.log('Responce data:', response.data)
        return response.data
      } else {
        throw new Error('Bad response data ID', response.data)
      }
    } else {
      throw new Error('Bad response', response)
    }
  } catch (error) {
    return error.message
  } finally {
    console.groupEnd()
  }
}

/**
 * Get selected trns.
 * @param {Array} trnIds - Ids list of requested trns.
 * @return {Array} Trns array.
 */
async function getTransactions(trnIds) {
  try {
    console.groupCollapsed('api/transactions/@getTransactions')
    console.log('trnIds', trnIds)
    const response = await axios.get(`${TRANSACTIONS_URL}/${trnIds}`, {
      params: {
        transform: 1,
        order: 'date, desc'
      }
    })

    if (response.status === 200 && response.data) {
      if (response.data) {
        console.log('Responce data:', response.data)
        return response.data
      } else {
        throw new Error('No trns!')
      }
    } else {
      throw new Error('Bad response', response)
    }
  } catch (error) {
    return error.message
  } finally {
    console.groupEnd()
  }
}

/**
 * Add trns.
 * @param {object} trns - Formated trns with values.
 * @return {boolean} True if added, false if false.
 */
async function addTrnasactions(trns) {
  try {
    console.groupCollapsed('api/transactions/@addTrnasactions')
    const response = await axios.post(TRANSACTIONS_URL, trns)
    console.log('Response:', response)

    if (response.status === 200) {
      if (response.data.length > 0) {
        console.log('Ok!', response.data)
        return response.data
      } else {
        throw new Error('No trns was added!')
      }
    } else {
      throw new Error('Bad response', response)
    }
  } catch (error) {
    console.error(error.message)
    return false
  } finally {
    console.groupEnd()
  }
}

/**
 * Update one trn.
 * @param {object} trn - Formated values of trn.
 * @return {boolean} True if updated, false if false.
 */
async function updateTrnasaction(trn) {
  try {
    console.groupCollapsed('api/transactions/@updateTrnasaction')
    console.log('trn:', trn)
    const response = await axios.put(`${TRANSACTIONS_URL}/${trn.id}`, trn)
    console.log('Response:', response)

    if (response.status === 200) {
      if (response.data === 1) {
        console.log('Ok!')
        return response.data
      } else {
        throw new Error('Responce with 0')
      }
    } else {
      throw new Error('Bad response', response)
    }
  } catch (error) {
    console.error(error.message)
    return false
  } finally {
    console.groupEnd()
  }
}

/**
 * Delete one trn.
 * @param {number} trnId - Trn id.
 * @return {boolean} True if deleted, false if false.
 */
async function deleteTrnasaction(trnId) {
  try {
    console.groupCollapsed('api/transactions/@deleteTrnasaction')
    const response = await axios.delete(`${TRANSACTIONS_URL}/${trnId}`)
    console.log('result: ', response)
    if (response.status === 200) {
      if (response.data === 1) {
        console.log('Ok!')
        return true
      } else {
        throw new Error('Responce with 0')
      }
    } else {
      throw new Error('Bad response', response)
    }
  } catch (error) {
    console.error('Error', error.message)
    return false
  } finally {
    console.groupEnd()
  }
}

export {
  getAllTransactions,
  getTrnasaction,
  getTransactions,
  addTrnasactions,
  updateTrnasaction,
  deleteTrnasaction
}
