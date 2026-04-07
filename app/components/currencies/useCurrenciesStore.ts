import localforage from 'localforage'
import { defineStore } from 'pinia'

import type { Rates } from '~/components/currencies/types'

import { ratesSchema } from '~/components/currencies/types'
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

      const latestRates = await client.query(api.rates.getLatest, {})

      if (latestRates?.rates) {
        const parsed = ratesSchema.safeParse(latestRates.rates)
        if (parsed.success) {
          setRates(parsed.data)
        }
        else {
          logger.error('invalid rates from Convex', parsed.error)
        }
      }
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
