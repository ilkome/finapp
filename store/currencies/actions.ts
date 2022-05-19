import localforage from 'localforage'
import dayjs from 'dayjs'
import { getRatesOfUSD } from '~/services/rates/api'
import { getDataOnce, saveData } from '~/services/firebase/api'

export default {
  async initCurrencies({ rootState, commit }) {
    const uid = rootState.user.user.uid

    // User base currency in DB
    const userBaseCurrency = await getDataOnce(`users/${uid}/settings/baseCurrency`) || 'USD'

    // Rates for today
    const today = dayjs().startOf('day').valueOf()
    let ratesBasedOnUsd = await getDataOnce(`ratesUsd/history/${today}`)

    if (!ratesBasedOnUsd) {
      ratesBasedOnUsd = await getRatesOfUSD(this.$config.ratesApiKey)
      if (!ratesBasedOnUsd)
        return

      await saveData('ratesUsd/latest', ratesBasedOnUsd)
      await saveData(`ratesUsd/history/${today}`, ratesBasedOnUsd)
    }

    commit('setCurrencies', {
      base: userBaseCurrency,
      rates: ratesBasedOnUsd,
    })

    await localforage.setItem('finapp.currencies', {
      base: userBaseCurrency,
      rates: ratesBasedOnUsd,
    })
  },

  async changeBaseCurrency({ commit }, baseCurrencyCode) {
    commit('setBaseRate', baseCurrencyCode)
  },

  setBaseCurrency({ rootState, dispatch }, baseCurrencyCode) {
    const uid = rootState.user.user.uid
    saveData(`users/${uid}/settings/baseCurrency`, baseCurrencyCode)
    dispatch('initCurrencies')
  },
}
