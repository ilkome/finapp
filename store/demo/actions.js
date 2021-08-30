import dayjs from 'dayjs'
import { saveData, getDataOnce } from '~/services/firebaseHelpers'

export default {
  async getDemoDataStatus ({ commit }) {
    const isHasDemo = await getDataOnce('demo-data/isDemo')
    isHasDemo && commit('setDemoDataStatus', true)
  },

  async createDemo ({ rootState, commit, dispatch }) {
    commit('app/setAppStatus', 'loading', { root: true })
    dispatch('ui/setActiveTab', 'stat', { root: true })
    const uid = rootState.user.user.uid
    const demo = await getDataOnce('demo-data')

    saveData(`users/${uid}/accounts`, demo.accounts)
    saveData(`users/${uid}/categories`, demo.categories)
    saveData(`users/${uid}/trns`, demo.trns)

    saveData(`users/${uid}/settings/baseCurrency`, 'USD')
    saveData(`users-info/${uid}/actions/${dayjs().valueOf()}`, 'demo')

    dispatch('currencies/initCurrencies', null, { root: true })
    commit('app/setAppStatus', 'ready', { root: true })
  }
}
