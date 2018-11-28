import axios from 'axios'

export const getCurrencies = async (baseCurrency) => {
  console.log('api: getCurrencies', baseCurrency)
  if (!baseCurrency) {
    console.error('No base currency')
    return
  }
  const currencies = await axios.get(`https://api.openrates.io/latest?base=${baseCurrency}`)
  return currencies
}
