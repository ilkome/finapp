import localforage from 'localforage'
import dayjs from 'dayjs'
import { getRatesOfUSD } from '../../services/rates/api'
import { getDataOnce, saveData } from '~/services/firebase/api'

export default {
  async initCurrencies({ rootState, commit }) {
    const uid = rootState.user.user.uid

    // User base currency in DB
    const userBaseCurrency = await getDataOnce(`users/${uid}/settings/baseCurrency`) || 'USD'

    // Rates with date
    const today = dayjs().startOf('day').valueOf()
    let ratesBasedOnUsd = await getDataOnce(`ratesUsd/history/${today}`)

    // No rates for today
    if (!ratesBasedOnUsd) {
      ratesBasedOnUsd = await getRatesOfUSD()
      if (!ratesBasedOnUsd)
        return

      saveData('ratesUsd/latest', ratesBasedOnUsd)
      saveData(`ratesUsd/history/${today}`, ratesBasedOnUsd)
    }

    commit('setCurrencies', {
      base: userBaseCurrency,
      rates: ratesBasedOnUsd,
    })

    localforage.setItem('finapp.currencies', {
      base: userBaseCurrency,
      rates: ratesBasedOnUsd,
    })
  },

  async changeBaseCurrency({ commit }, baseCurrency) {
    commit('setBaseRate', baseCurrency)
  },

  setBaseCurrency({ rootState, dispatch }, baseCurrency) {
    const uid = rootState.user.user.uid
    saveData(`users/${uid}/settings/baseCurrency`, baseCurrency)
    dispatch('initCurrencies')
  },
}
