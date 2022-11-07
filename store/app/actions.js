import localforage from 'localforage'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '~/services/firebase/api'

export default {
  initApp({ rootGetters, commit, dispatch }) {
    if (this.$router.currentRoute.name === 'login')
      commit('setAppStatus', 'loading')

    onAuthStateChanged(auth, async (user) => {
      if (this.$router.currentRoute.name === 'login')
        commit('setAppStatus', 'loading')

      if (!user) {
        dispatch('clearUserData')
        return
      }

      try {
        if (rootGetters['user/userUid'] !== user.uid)
          dispatch('clearUserData')

        dispatch('user/initUser', user, { root: true })
        dispatch('currencies/initCurrencies', null, { root: true })
        dispatch('categories/initCategories', null, { root: true })
        dispatch('wallets/initWallets', null, { root: true })
        dispatch('trns/initTrns', null, { root: true })
        dispatch('lang/initDbLang', null, { root: true })
        dispatch('trns/uploadOfflineTrns', null, { root: true })

        if (this.$router.currentRoute.name === 'login') {
          this.app.context.redirect('/')
          setTimeout(() => commit('setAppStatus', 'ready'), 100)
        }
      }
      catch (e) {
        console.error(e)
      }
    })
  },

  async initAppFromCache({ commit, dispatch }, resolve) {
    dispatch('lang/initLocalLang', null, { root: true })
    dispatch('ui/initUi', null, { root: true })
    dispatch('chart/initChart', null, { root: true })

    const [activeTab, user, currencies, categories, wallets, trns, filterPeriod] = await Promise.all([
      localforage.getItem('finapp.activeTab'),
      localforage.getItem('finapp.user'),
      localforage.getItem('finapp.currencies'),
      localforage.getItem('finapp.categories'),
      localforage.getItem('finapp.wallets'),
      localforage.getItem('finapp.trns'),
      localforage.getItem('finapp.filter.period'),
    ])

    if (activeTab)
      dispatch('ui/setActiveTab', activeTab, { root: true })
    if (user)
      commit('user/setUser', user, { root: true })
    if (currencies)
      commit('currencies/setCurrencies', currencies, { root: true })
    if (categories)
      commit('categories/setCategories', categories, { root: true })
    if (wallets)
      commit('wallets/setWallets', wallets, { root: true })
    if (trns)
      commit('trns/setTrns', trns, { root: true })
    if (filterPeriod)
      dispatch('filter/setPeriod', filterPeriod, { root: true })

    // ready
    if (categories && user && trns && wallets) {
      if (this.$router.currentRoute.name === 'login')
        this.app.context.redirect('/')
      resolve()
    }
    else {
      resolve()
    }
    commit('setAppStatus', 'ready')
  },

  async clearUserData({ commit, dispatch }) {
    commit('setAppStatus', 'loading')
    dispatch('ui/setActiveTab', 'stat', { root: true })
    await dispatch('user/setUser', null, { root: true })
    await dispatch('categories/setCategories', null, { root: true })
    await dispatch('wallets/setWallets', null, { root: true })
    await dispatch('trns/setTrns', null, { root: true })
    setTimeout(() => commit('setAppStatus', 'ready'), 100)
  },
}
