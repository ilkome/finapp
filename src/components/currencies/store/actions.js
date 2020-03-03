import localforage from 'localforage'
import moment from 'moment'
import { db } from '@/firebase'
import { getRatesOf } from './api'

export default {
  async initCurrencies ({ rootState, commit }) {
    const uid = rootState.user.user.uid
    const today = moment().valueOf()

    // user base currency in DB
    const userCurrencyReq = await db.ref(`users/${uid}/settings/baseCurrency`).once('value')
    const userCurrency = userCurrencyReq.val() || 'RUB'

    // rates of base currency
    const currencyRateReq = await db.ref(`currencies/${userCurrency}`).once('value')
    const currencyRate = currencyRateReq.val() || {}

    let rates = currencyRate.rates
    const isCurrencyUpdatedToday = moment(today).isSame(currencyRate.date, 'day')

    // get new rates
    if (!currencyRate.rates || !isCurrencyUpdatedToday) {
      rates = await getRatesOf(userCurrency)
      db.ref(`currencies/${userCurrency}`).set({
        rates,
        date: today
      })
    }

    const currencies = { base: userCurrency, rates }
    commit('setCurrencies', currencies)
    localforage.setItem('next.currencies', currencies)
  },

  setBaseCurrency ({ rootState, dispatch }, baseCurrency) {
    const uid = rootState.user.user.uid
    db.ref(`users/${uid}/settings/baseCurrency`).set(baseCurrency)
    dispatch('initCurrencies')
  }
}
