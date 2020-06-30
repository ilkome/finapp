import localforage from 'localforage'
import { app } from '~/services/firebaseConfig'

export default {
  async initApp ({ rootState, commit, dispatch }) {
    await dispatch('demo/getDemoDataStatus', null, { root: true })
    await dispatch('initAppFromCache')
    dispatch('trns/initOfflineTrns', null, { root: true })

    app.auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          if (rootState.user.user && rootState.user.user.uid && rootState.user.user.uid !== user.uid) {
            commit('setAppStatus', 'loading')
            dispatch('clearUserData')
          }
          await dispatch('user/initUser', user, { root: true })
          await dispatch('currencies/initCurrencies', null, { root: true })
          await dispatch('categories/initCategories', null, { root: true })
          await dispatch('wallets/initWallets', null, { root: true })
          await dispatch('trns/initTrns', null, { root: true })
          await dispatch('groups/initGroups', null, { root: true })
          await dispatch('budgets/initBudgets', null, { root: true })
          await dispatch('lang/initDbLang', null, { root: true })
        }
        catch (e) {
          console.error(e)
        }
      }
      else {
        dispatch('clearUserData')
      }
    })
  },

  async initAppFromCache ({ commit, dispatch }) {
    dispatch('lang/initLocalLang', null, { root: true })
    dispatch('ui/initUi', null, { root: true })
    dispatch('chart/initChart', null, { root: true })

    const ativeTab = await localforage.getItem('next.activeTab')
    if (ativeTab) { dispatch('ui/setActiveTab', ativeTab, { root: true }) }

    const user = await localforage.getItem('next.user')
    if (user) { dispatch('user/setUser', user, { root: true }) }

    const currencies = await localforage.getItem('next.currencies')
    if (currencies) { commit('currencies/setCurrencies', currencies, { root: true }) }

    const categories = await localforage.getItem('next.categories')
    if (categories) { commit('categories/setCategories', categories, { root: true }) }

    const wallets = await localforage.getItem('next.wallets')
    if (wallets) { commit('wallets/setWallets', wallets, { root: true }) }

    const trns = await localforage.getItem('next.trns')
    if (trns) { commit('trns/setTrns', trns, { root: true }) }

    const filterPeriod = await localforage.getItem('next.filter.period')
    if (filterPeriod) { dispatch('filter/setPeriod', filterPeriod, { root: true }) }

    // ready
    if (categories && user && trns && wallets) {
      commit('setAppStatus', 'ready')
    }
  },

  clearUserData ({ commit, dispatch }) {
    commit('setAppStatus', 'loading')
    dispatch('ui/setActiveTab', 'stat', { root: true })
    dispatch('user/setUser', null, { root: true })
    dispatch('categories/setCategories', null, { root: true })
    dispatch('wallets/setWallets', null, { root: true })
    dispatch('trns/setTrns', null, { root: true })
    commit('setAppStatus', 'ready')
  }
}
