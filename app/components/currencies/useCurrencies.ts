import dayjs from 'dayjs'
import localforage from 'localforage'
import { getDataOnce, saveData } from '~~/services/firebase/api'
import type { CurrencyCode, Rates } from '~/components/currencies/types'
import { currencies as all } from '~/components/currencies/currencies'
import { useUserStore } from '~/components/user/useUser'

const serviceUrlBase = `https://openexchangerates.org/api/latest.json?app_id=`
export const currencies = all

export const useCurrenciesStore = defineStore('currencies', () => {
  const { $config } = useNuxtApp()
  const userStore = useUserStore()

  const base = ref<CurrencyCode>('USD')
  const rates = ref<Rates>({})

  async function getRatesOfUSD(apiKey: string) {
    try {
      const { rates } = await $fetch<Rates>(`${serviceUrlBase}${apiKey}`)
      return rates
    }
    catch (e) {
      console.error('Currencies api are unavailable', e)
      return false
    }
  }

  async function initCurrencies() {
    // User base currency in DB
    const userBaseCurrency = await getDataOnce(`users/${userStore.uid}/settings/baseCurrency`) || 'USD'

    // Rates for today
    const today = dayjs().startOf('day').valueOf()
    let ratesBasedOnUsd = await getDataOnce(`ratesUsd/history/${today}`)

    if (!ratesBasedOnUsd) {
      ratesBasedOnUsd = await getRatesOfUSD($config.public.ratesApiKey)
      if (!ratesBasedOnUsd)
        return

      await saveData('ratesUsd/latest', ratesBasedOnUsd)
      await saveData(`ratesUsd/history/${today}`, ratesBasedOnUsd)
    }

    setBase(userBaseCurrency)
    setRates(ratesBasedOnUsd)

    await localforage.setItem('finapp.currencies', {
      base: userBaseCurrency,
      rates: ratesBasedOnUsd,
    })
  }

  function setRates(values: Rates) {
    rates.value = values
  }

  function setBase(value: CurrencyCode) {
    base.value = value
  }

  function updateBase(code: CurrencyCode) {
    saveData(`users/${userStore.uid}/settings/baseCurrency`, code)
    initCurrencies()
  }

  return {
    base,
    initCurrencies,
    rates,
    setBase,
    setRates,
    updateBase,
  }
})
