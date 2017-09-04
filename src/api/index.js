import axios from 'axios'

/**
 * Get rates.
 * @return {object} Rates.
 */
async function getRates() {
  try {
    const response = await axios.get('http://api.fixer.io/latest?base=RUB')
    if (response.status === 200 && response.data) {
      if (response.data.rates) {
        return response.data.rates
      } else {
        throw new Error('No rates!')
      }
    } else {
      throw new Error('api/api/@getRates: Bad response', response)
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

export {
  getRates
}
