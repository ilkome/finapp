import localforage from 'localforage'
import { defineStore } from 'pinia'

import type { Rates } from '~/components/currencies/types'

import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { useUserStore } from '~/components/user/useUserStore'
import { isPersistBlocked } from '~/composables/useStoreSync'
import { createLogger } from '~/utils/logger'

const logger = createLogger('currencies')

export const useCurrenciesStore = defineStore('currencies', () => {
  const userStore = useUserStore()

  const base = computed(() => userStore.baseCurrency)
  const rates = ref<Rates>({})

  async function initCurrencies() {
    try {
      const { api, client } = useConvexClientWithApi()

      // Get latest rates from Convex
      const latestRates = await client.query(api.rates.getLatest, {})

      if (latestRates?.rates)
        setRates(latestRates.rates as Rates)
    }
    catch (e) {
      logger.error('init failed', e)
    }
  }

  function setRates(values: Rates) {
    rates.value = values

    if (isPersistBlocked())
      return

    localforage.setItem(STORAGE_KEYS.currencies, {
      rates: values,
    })
  }

  return {
    base,
    initCurrencies,
    rates,
    setRates,
  }
})
