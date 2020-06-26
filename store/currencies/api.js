import axios from 'axios'

const serviceUrl = 'https://api.openrates.io'

export const getRatesOf = async (baseCurrency) => {
  if (!baseCurrency) {
    console.error('No base currency')
    return
  }

  const currencies = await axios.get(`${serviceUrl}/latest?base=${baseCurrency}`)
  if (currencies && currencies.data) {
    return currencies.data.rates
  }
  else {
    console.log('api unavaliable')
  }
}
