import moment from 'moment'
import { db } from '@/firebase'

const demoUid = '9yrjuIeeOKNj5TxwoPhQobxbE153' // demo@themerise.com

export default {
  async getDemoDataStatus ({ commit }) {
    await db.ref(`users/${demoUid}/isDemo`).once('value').then((isDemo) => {
      isDemo.val()
        ? commit('setDemoDataStatus', true)
        : commit('setDemoDataStatus', false)
    },
    () => { commit('setDemoDataStatus', false) })
  },

  async createDemo ({ rootState, commit, dispatch }) {
    commit('setAppStatus', 'loading')
    dispatch('setActiveTab', 'stat')
    const uid = rootState.user.user.uid

    await db.ref(`users/${demoUid}`).once('value')
      .then(demo => {
        const demoData = demo.val()
        db.ref(`users/${uid}/accounts`).set(demoData.accounts)
        db.ref(`users/${uid}/categories`).set(demoData.categories)
        db.ref(`users/${uid}/trns`).set(demoData.trns)

        db.ref(`users/${uid}/settings/baseCurrency`).set('USD')
        db.ref(`users/${uid}/settings/demo/${moment().format()}`).set(true)

        dispatch('initCurrencies')
        commit('setAppStatus', 'ready')
      })
  }
}
