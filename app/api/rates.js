import axios from 'axios'

/**
 * Get rates.
 * @return {object} Rates.
 */
async function getRates() {
  try {
    console.groupCollapsed('api/rates/@getRates')
    const response = await axios.get('http://api.fixer.io/latest?base=RUB')
    console.log('Responce:', response)
    if (response.status === 200 && response.data) {
      if (response.data.rates) {
        console.log('Responce data:', response.data)
        return response.data.rates
      } else {
        throw new Error('No rates!')
      }
    } else {
      throw new Error('api/rates/@getRates: Bad response', response)
    }
  } catch (error) {
    throw new Error(error.message)
  } finally {
    console.groupEnd()
  }
}

export {
  getRates
}
