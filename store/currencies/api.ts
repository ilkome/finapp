import axios from 'axios'

const key = '5976f9fadc5c46e285d7654eae24d384b'
const serviceUrl = `https://openexchangerates.org/api/latest.json?app_id=${key}`

type Props = Record<string, string>

export const getRatesOfUSD = async(): Promise<Props | false> => {
  const { data } = await axios.get(serviceUrl)

  if (!data) {
    console.log('api unavaliable')
    return false
  }

  return data.rates
}
