import localforage from 'localforage'
import { app } from '@/firebase'

export default {
  async initApp ({ rootState, commit, dispatch }) {
    await dispatch('initAppFromCache')
    dispatch('iniOfflineTrns')

    app.auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          if (rootState.user.user.uid && rootState.user.user.uid !== user.uid) {
            dispatch('clearUserData')
          }
          await dispatch('initUser', user)
          await dispatch('initCurrencies')
          await dispatch('initCategories')
          await dispatch('initWallets')
          await dispatch('initTrns')
        } catch (e) {
          console.error(e)
        }
      } else {
        commit('setAppStatus', 'login')
      }
    })
  },

  async initAppFromCache ({ commit, dispatch }) {
    dispatch('initStat')
    dispatch('initUi')
    dispatch('initChart')

    const theme = await localforage.getItem('next.theme')
    if (theme) dispatch('changeTheme', theme)

    const ativeTab = await localforage.getItem('next.activeTab')
    if (ativeTab) dispatch('setActiveTab', ativeTab)

    const user = await localforage.getItem('next.user')
    if (user) dispatch('setUser', user)

    const currencies = await localforage.getItem('next.currencies')
    if (currencies) commit('setCurrencies', currencies)

    const categories = await localforage.getItem('next.categories')
    if (categories) commit('setCategories', categories)

    const wallets = await localforage.getItem('next.wallets')
    if (wallets) commit('setWallets', wallets)

    const trns = await localforage.getItem('next.trns')
    if (trns) commit('setTrns', trns)

    const filterPeriod = await localforage.getItem('next.filter.period')
    if (filterPeriod) dispatch('setPeriod', filterPeriod)

    // ready
    if (categories && user && trns && wallets) {
      commit('setAppStatus', 'ready')
    }
  },

  async clearUserData ({ commit, dispatch }) {
    commit('setAppStatus', 'loading')
    dispatch('setActiveTab', 'stat')
    dispatch('setUser', null)
    dispatch('setCategories', null)
    dispatch('setWallets', null)
    dispatch('setTrns', null)
  }
}
