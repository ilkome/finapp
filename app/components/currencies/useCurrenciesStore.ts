import { startOfDay } from 'date-fns'
import localforage from 'localforage'
import { getDataOnce, saveData } from '~~/services/firebase/api'

import type { CurrencyCode, Rates } from '~/components/currencies/types'

import { currencies as allCurrencies } from '~/components/currencies/currencies'
import { useDemo } from '~/components/demo/useDemo'
import { useUserStore } from '~/components/user/useUserStore'

const serviceUrlBase = `https://openexchangerates.org/api/latest.json?app_id=`
export const currencies = allCurrencies

export const useCurrenciesStore = defineStore('currencies', () => {
  const { $config } = useNuxtApp()
  const userStore = useUserStore()
  const { isDemo } = useDemo()

  const base = ref<CurrencyCode>('USD')
  const rates = ref<Rates>({})

  async function getRatesOfUSD(apiKey: string) {
    try {
      const { data } = await useAsyncData<{ rates: Rates }>(
        'rates',
        () => $fetch(`${serviceUrlBase}${apiKey}`),
      )
      return data.value?.rates
    }
    catch (e) {
      console.error('Currencies api are unavailable', e)
      return undefined
    }
  }

  async function initCurrencies() {
    // User base currency in DB
    const userBaseCurrency: CurrencyCode = await getDataOnce(`users/${userStore.uid}/settings/baseCurrency`) || 'USD'

    // Rates for today
    const today = startOfDay(new Date()).getTime()

    let ratesBasedOnUsd: Rates | undefined = await getDataOnce(`ratesUsd/history/${today}`)

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

  function updateBase(value: CurrencyCode) {
    setBase(value)
    if (!isDemo)
      saveData(`users/${userStore.uid}/settings/baseCurrency`, value)
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
