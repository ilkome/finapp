import dayjs from 'dayjs'
import { db } from '~/services/firebaseConfig'

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
    commit('app/setAppStatus', 'loading', { root: true })
    dispatch('ui/setActiveTab', 'stat', { root: true })
    const uid = rootState.user.user.uid

    await db.ref('demo-data').once('value')
      .then((demo) => {
        const demoData = demo.val()
        db.ref(`users/${uid}/accounts`).set(demoData.accounts)
        db.ref(`users/${uid}/categories`).set(demoData.categories)
        db.ref(`users/${uid}/trns`).set(demoData.trns)

        db.ref(`users/${uid}/settings/baseCurrency`).set('USD')
        db.ref(`users-info/${uid}/actions/${dayjs().valueOf()}`).set('demo')

        dispatch('currencies/initCurrencies', null, { root: true })
        commit('app/setAppStatus', 'ready', { root: true })
      })
  }
}
