import localforage from 'localforage'
import dayjs from 'dayjs'

import { signOut as signOutFirebase } from 'firebase/auth'
import { auth, getDataOnce, saveData } from '~/services/firebaseHelpers'
import pkg from '~/package'

export default {
  initUser ({ dispatch }, userParams) {
    const user = {
      displayName: userParams.displayName,
      email: userParams.email,
      uid: userParams.uid
    }

    dispatch('setUser', user)
    dispatch('saveUserInfo', user)
  },

  setUser ({ commit }, user) {
    commit('setUser', user)
    localforage.setItem('finapp.user', user)
  },

  async signOut ({ rootGetters, dispatch }) {
    const uid = rootGetters['user/userUid']

    saveData(`users-info/${uid}/actions/${dayjs().valueOf()}`, 'signOut')
    await dispatch('categories/unsubcribeCategories', null, { root: true })
    await dispatch('trns/unsubcribeTrns', null, { root: true })
    await dispatch('wallets/unsubcribeWallets', null, { root: true })
    await dispatch('app/clearUserData', null, { root: true })

    signOutFirebase(auth)

    if (this.$router.currentRoute.name !== 'login')
      this.app.context.redirect('/login')
  },

  async saveUserInfo ({ rootState }) {
    const user = rootState.user.user
    const todayValueOf = dayjs().valueOf()

    // add to user list
    const usersInfo = await getDataOnce(`users-info/${user.uid}/`) || {}
    const userData = {
      displayName: user.displayName,
      email: user.email,
      uid: user.uid,
      loginDate: todayValueOf
    }

    saveData(`users/${user.uid}/user`, userData)

    saveData(`users-info/${user.uid}/name`, user.displayName)
    saveData(`users-info/${user.uid}/email`, user.email)
    saveData(`users-info/${user.uid}/uid`, user.uid)
    saveData(`users-info/${user.uid}/loginDate`, todayValueOf)

    // set creation date once
    if (!usersInfo || (usersInfo && !usersInfo.creationDate))
      saveData(`users-info/${user.uid}/creationDate`, todayValueOf)

    // set date of open app
    saveData(`users-info/${user.uid}/opensApp/${pkg.version.split('.').join('')}`, dayjs().valueOf())
  },

  removeUserData ({ rootGetters, commit, dispatch }) {
    commit('app/setAppStatus', 'loading', { root: true })
    dispatch('ui/setActiveTab', null, { root: true })
    const uid = rootGetters['user/userUid']

    saveData(`users/${uid}/accounts/`, null)
    saveData(`users/${uid}/categories/`, null)
    saveData(`users/${uid}/trns/`, null)
    saveData(`users-info/${uid}/actions/${dayjs().valueOf()}`, 'removeUserData')
    commit('app/setAppStatus', 'ready', { root: true })
  }
}
