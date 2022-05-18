import localforage from 'localforage'

import { signOut as signOutFirebase } from 'firebase/auth'
import { auth, saveData } from '~/services/firebase/api'

export default {
  initUser({ dispatch }, userParams) {
    const user = {
      displayName: userParams.displayName,
      email: userParams.email,
      uid: userParams.uid,
    }

    dispatch('setUser', user)
  },

  setUser({ commit }, user) {
    commit('setUser', user)
    localforage.setItem('finapp.user', user)
  },

  async signOut({ dispatch }) {
    await dispatch('categories/unsubscribeCategories', null, { root: true })
    await dispatch('trns/unsubscribeTrns', null, { root: true })
    await dispatch('wallets/unsubscribeWallets', null, { root: true })
    await dispatch('app/clearUserData', null, { root: true })

    await signOutFirebase(auth)

    if (this.$router.currentRoute.name !== 'login')
      this.app.context.redirect('/login')
  },

  removeUserData({ rootGetters, commit, dispatch }) {
    commit('app/setAppStatus', 'loading', { root: true })
    dispatch('ui/setActiveTab', null, { root: true })
    const uid = rootGetters['user/userUid']

    saveData(`users/${uid}/accounts/`, null)
    saveData(`users/${uid}/categories/`, null)
    saveData(`users/${uid}/trns/`, null)
    commit('app/setAppStatus', 'ready', { root: true })
  },
}
