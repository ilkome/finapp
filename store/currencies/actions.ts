import localforage from 'localforage'
import dayjs from 'dayjs'
import { getRatesOfUSD } from './api'
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
      if (!ratesBasedOnUsd) return
      saveData('ratesUsd/latest', ratesBasedOnUsd)
      saveData(`ratesUsd/history/${today}`, ratesBasedOnUsd)
    }

    // Convert rates based on USD to user base currency
    const ratesConvertedToBase = {}
    for (const id in ratesBasedOnUsd)
      ratesConvertedToBase[id] = ratesBasedOnUsd[id] / ratesBasedOnUsd[userBaseCurrency]

    commit('setCurrencies', {
      base: userBaseCurrency,
      rates: ratesConvertedToBase,
    })

    localforage.setItem('finapp.currencies', {
      base: userBaseCurrency,
      rates: ratesConvertedToBase,
    })
  },

  async changeBaseCurrency({ commit }, baseCurrency) {
    // Rates with date
    const today = dayjs().startOf('day').valueOf()
    const ratesBasedOnUsd = await getDataOnce(`ratesUsd/history/${today}`)

    // Convert rates based on USD to user base currency
    const ratesConvertedToBase = {}
    for (const id in ratesBasedOnUsd)
      ratesConvertedToBase[id] = ratesBasedOnUsd[id] / ratesBasedOnUsd[baseCurrency]

    commit('setCurrencies', {
      base: baseCurrency,
      rates: ratesConvertedToBase,
    })
  },

  setBaseCurrency({ rootState, dispatch }, baseCurrency) {
    const uid = rootState.user.user.uid
    saveData(`users/${uid}/settings/baseCurrency`, baseCurrency)
    dispatch('initCurrencies')
  },
}
