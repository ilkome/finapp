import localforage from 'localforage'
import dayjs from 'dayjs'
import { getRatesOf } from './api'
import { getDataOnce, saveData } from '~/services/firebaseHelpers'

export default {
  async initCurrencies ({ rootState, commit }) {
    const uid = rootState.user.user.uid

    // user base currency in DB
    const userBaseCurrency = await getDataOnce(`users/${uid}/settings/baseCurrency`) || 'RUB'

    // rates of base currency
    const currencyRate = await getDataOnce(`currencies/${userBaseCurrency}`) || {}

    let rates = currencyRate.rates
    const today = dayjs().valueOf()
    const isCurrencyUpdatedToday = dayjs(today).isSame(currencyRate.date, 'day')

    // get new rates
    if (!currencyRate.rates || !isCurrencyUpdatedToday) {
      rates = await getRatesOf(userBaseCurrency)
      saveData(`currencies/${userBaseCurrency}`, {
        rates,
        date: today
      })
    }

    const currencies = { base: userBaseCurrency, rates }
    commit('setCurrencies', currencies)
    localforage.setItem('finapp.currencies', currencies)
  },

  setBaseCurrency ({ rootState, dispatch }, baseCurrency) {
    const uid = rootState.user.user.uid
    saveData(`users/${uid}/settings/baseCurrency`, baseCurrency)
    dispatch('initCurrencies')
  }
}
