import localforage from 'localforage'
import { app } from '~/services/firebaseConfig'

export default {
  async initApp ({ rootState, commit, dispatch }) {
    if (this.$router.currentRoute.name === 'login') {
      commit('setAppStatus', 'loading')
    }

    await dispatch('demo/getDemoDataStatus', null, { root: true })

    app.auth().onAuthStateChanged(async (user) => {
      if (this.$router.currentRoute.name === 'login') {
        commit('setAppStatus', 'loading')
      }

      if (user) {
        try {
          if (rootState.user.user && rootState.user.user.uid && rootState.user.user.uid !== user.uid) {
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
          dispatch('trns/uploadOfflineTrns', null, { root: true })

          if (this.$router.currentRoute.name === 'login') {
            this.app.context.redirect('/')
            setTimeout(() => {
              commit('setAppStatus', 'ready')
            }, 100)
          }
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

  async initAppFromCache ({ commit, dispatch }, resolve) {
    dispatch('lang/initLocalLang', null, { root: true })
    dispatch('ui/initUi', null, { root: true })
    dispatch('chart/initChart', null, { root: true })

    const [ativeTab, user, currencies, categories, wallets, trns, filterPeriod] = await Promise.all([
      localforage.getItem('finapp.activeTab'),
      localforage.getItem('finapp.user'),
      localforage.getItem('finapp.currencies'),
      localforage.getItem('finapp.categories'),
      localforage.getItem('finapp.wallets'),
      localforage.getItem('finapp.trns'),
      localforage.getItem('finapp.filter.period')
    ])

    if (ativeTab) { dispatch('ui/setActiveTab', ativeTab, { root: true }) }
    if (user) { commit('user/setUser', user, { root: true }) }
    if (currencies) { commit('currencies/setCurrencies', currencies, { root: true }) }
    if (categories) { commit('categories/setCategories', categories, { root: true }) }
    if (wallets) { commit('wallets/setWallets', wallets, { root: true }) }
    if (trns) { commit('trns/setTrns', trns, { root: true }) }
    if (filterPeriod) { dispatch('filter/setPeriod', filterPeriod, { root: true }) }

    // ready
    if (categories && user && trns && wallets) {
      if (this.$router.currentRoute.name === 'login') {
        this.app.context.redirect('/')
      }
      resolve()
    }
    else {
      resolve()
    }
    commit('setAppStatus', 'ready')
  },

  async clearUserData ({ commit, dispatch }) {
    commit('setAppStatus', 'loading')
    dispatch('ui/setActiveTab', 'stat', { root: true })
    await dispatch('user/setUser', null, { root: true })
    await dispatch('categories/setCategories', null, { root: true })
    await dispatch('wallets/setWallets', null, { root: true })
    await dispatch('trns/setTrns', null, { root: true })
    setTimeout(() => {
      commit('setAppStatus', 'ready')
    }, 100)
  }
}
