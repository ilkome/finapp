import axios from 'axios'

const key = '5976f9fadc5c46e285d764eae24d384b'
const serviceUrl = `https://openexchangerates.org/api/latest.json?app_id=${key}`

export const getRatesOf = async (baseCurrency) => {
  if (!baseCurrency) {
    console.error('No base currency')
    return
  }

  const currencies = await axios.get(serviceUrl)
  const rates = {}
  if (currencies && currencies.data) {
    const ratesBasedOnUsd = currencies.data.rates
    const baseRate = ratesBasedOnUsd[baseCurrency]

    // Conver rates to base currency
    for (const id in ratesBasedOnUsd) {
      rates[id] = ratesBasedOnUsd[id] / baseRate
    }
    return rates
  }
  else {
    console.log('api unavaliable')
  }
}
