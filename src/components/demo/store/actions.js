import moment from 'moment'
import { db } from '@/firebase'

export default {
  async getDemoDataStatus ({ commit }) {
    try {
      const damoReq = await db.ref('demo-data/isDemo').once('value')
      if (damoReq.val()) {
        commit('setDemoDataStatus', true)
      }
    }
    catch (error) {}
  },

  async createDemo ({ rootState, commit, dispatch }) {
    commit('setAppStatus', 'loading')
    dispatch('setActiveTab', 'stat')
    const uid = rootState.user.user.uid

    await db.ref('demo-data').once('value')
      .then(demo => {
        const demoData = demo.val()
        db.ref(`users/${uid}/accounts`).set(demoData.accounts)
        db.ref(`users/${uid}/categories`).set(demoData.categories)
        db.ref(`users/${uid}/trns`).set(demoData.trns)

        db.ref(`users/${uid}/settings/baseCurrency`).set('USD')
        db.ref(`users-info/${uid}/actions/${moment().valueOf()}`).set('demo')

        dispatch('initCurrencies')
        commit('setAppStatus', 'ready')
      })
  }
}
