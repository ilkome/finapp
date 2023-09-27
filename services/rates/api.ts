import axios from 'axios'
import type { Rates } from '~/components/currencies/types'

export async function getRatesOfUSD(apiKey: string): Promise<Rates | false> {
  const serviceUrl = `https://openexchangerates.org/api/latest.json?app_id=${apiKey}`
  const { data } = await axios.get(serviceUrl)

  if (!data) {
    console.error('openexchangerates.org api unavailable')
    return false
  }

  return data.rates
}
