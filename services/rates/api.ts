import axios from 'axios'

type Props = Record<string, string>

export const getRatesOfUSD = async (apiKey: string): Promise<Props | false> => {
  const serviceUrl = `https://openexchangerates.org/api/latest.json?app_id=${apiKey}`
  const { data } = await axios.get(serviceUrl)

  if (!data) {
    console.log('api unavailable')
    return false
  }

  return data.rates
}
