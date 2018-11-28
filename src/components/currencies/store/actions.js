import localforage from 'localforage'
import moment from 'moment'
import { db } from '@/firebase'
import { getCurrencies } from './api'

export default {
  async initCurrencies ({ commit, rootState }) {
    const uid = rootState.user.user.uid

    // base currency
    const userBaseCurrency = await db.ref(`users/${uid}/settings/baseCurrency`).once('value')
    const baseCurrency = userBaseCurrency.val() || 'RUB'
    const currenciesRef = `currencies/${baseCurrency}`

    // currencies
    const currenciesSnapshot = await db.ref(currenciesRef).once('value')
    let currenciesValue = currenciesSnapshot.val()
    let isTodayCurrencies = true

    // check date of currencies
    if (currenciesValue) isTodayCurrencies = moment().isSame(currenciesValue.date, 'day')

    // get currencies from rest api
    if (!currenciesValue || !isTodayCurrencies) {
      const currenciesResponse = await getCurrencies(baseCurrency)
      if (currenciesResponse.data) {
        currenciesValue = {
          ...currenciesValue,
          date: moment().valueOf(),
          items: currenciesResponse.data.rates
        }
        db.ref(currenciesRef).set(currenciesValue)
      }
    }

    currenciesValue = {
      base: baseCurrency,
      date: currenciesValue.date,
      items: currenciesValue.items
    }

    commit('setCurrencies', currenciesValue)
    localforage.setItem('next.currencies', currenciesValue)
  }
}
