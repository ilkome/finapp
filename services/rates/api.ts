import type { Rates } from '~/components/currencies/types'

export async function getRatesOfUSD(apiKey: string): Promise<Rates | false> {
  const serviceUrl = `https://openexchangerates.org/api/latest.json?app_id=${apiKey}`
  const headers = new Headers()
  headers.append('Content-Type', 'application/json')

  const { data } = await fetch(serviceUrl, {
    method: 'GET',
    headers,
  })

  console.log('data', data)

  if (!data) {
    console.error('openexchangerates.org api unavailable')
    return false
  }

  return data.rates
}
