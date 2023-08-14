import axios from 'axios'

export const getRatesOfUSD = async (apiKey: string): Promise<Record<string, string> | false> => {
  const serviceUrl = `https://openexchangerates.org/api/latest.json?app_id=${apiKey}`
  const { data } = await axios.get(serviceUrl)

  if (!data) {
    console.log('api unavailable')
    return false
  }

  return data.rates
}
