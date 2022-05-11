import axios from 'axios'

const serviceUrl = `https://openexchangerates.org/api/latest.json?app_id=${process.env.ratesApiKey}`

type Props = Record<string, string>

export const getRatesOfUSD = async (): Promise<Props | false> => {
  const { data } = await axios.get(serviceUrl)

  if (!data) {
    console.log('api unavaliable')
    return false
  }

  return data.rates
}
