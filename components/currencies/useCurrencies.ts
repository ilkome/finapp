import dayjs from 'dayjs'
import localforage from 'localforage'
import { getDataOnce, saveData } from '~/services/firebase/api'
import { getRatesOfUSD } from '~/services/rates/api'
import { useUserStore } from '~/components/user/useUser'
import { currencies as all } from '~/components/currencies/currencies'

export interface CurrenciesValues {
  base: string
  rates: Record<string, number>
  modal: {
    show: boolean
  }
}

export const currencies = all

export const useCurrenciesStore = defineStore('currencies', () => {
  const { $config } = useNuxtApp()
  const userStore = useUserStore()

  const base = ref<CurrenciesValues['base']>('USD')
  const rates = ref<CurrenciesValues['rates']>({})

  async function initCurrencies() {
    // User base currency in DB
    const userBaseCurrency = await getDataOnce(`users/${userStore.uid}/settings/baseCurrency`) || 'USD'

    // Rates for today
    const today = dayjs().startOf('day').valueOf()
    let ratesBasedOnUsd = await getDataOnce(`ratesUsd/history/${today}`)

    if (!ratesBasedOnUsd) {
      console.log('$config.public.ratesApiKey', $config.public.ratesApiKey)
      ratesBasedOnUsd = await getRatesOfUSD($config.public.ratesApiKey)
      if (!ratesBasedOnUsd)
        return

      await saveData('ratesUsd/latest', ratesBasedOnUsd)
      await saveData(`ratesUsd/history/${today}`, ratesBasedOnUsd)
    }

    base.value = userBaseCurrency
    rates.value = ratesBasedOnUsd

    await localforage.setItem('finapp.currencies', {
      base: userBaseCurrency,
      rates: ratesBasedOnUsd,
    })
  }

  function setCurrencies(b: CurrenciesValues['base'], r: CurrenciesValues['rates']) {
    base.value = b
    rates.value = r
  }

  function setBaseRate(code: CurrenciesValues['base']) {
    base.value = code
  }

  function setBaseCurrency(code: CurrenciesValues['base']) {
    saveData(`users/${userStore.uid}/settings/baseCurrency`, code)
    initCurrencies()
  }

  /**
   * Modal
   */
  const isShownModal = ref<boolean>(false)
  function showBaseCurrenciesModal() {
    isShownModal.value = true
  }

  function hideBaseCurrenciesModal() {
    isShownModal.value = false
  }

  return {
    base,
    rates,
    setBaseRate,
    setBaseCurrency,
    initCurrencies,
    setCurrencies,

    isShownModal,
    showBaseCurrenciesModal,
    hideBaseCurrenciesModal,
  }
})
