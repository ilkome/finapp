import firebase from 'firebase/app'
import localforage from 'localforage'
import dayjs from 'dayjs'

import { db } from '~/services/firebaseConfig'
import pkg from '~/package'

export default {
  initUser ({ dispatch }, userParams) {
    const user = {
      displayName: userParams.displayName,
      email: userParams.email,
      uid: userParams.uid
      // uid: 'kXVGIN19Mhd7WZUeTtZRqUSo2aJ3'
    }

    dispatch('setUser', user)
    dispatch('saveUserInfo', user)
  },

  setUser ({ commit }, user) {
    commit('setUser', user)
    localforage.setItem('finapp.user', user)
  },

  async signOut ({ rootState, dispatch }) {
    const uid = rootState.user.user ? rootState.user.user.uid : null

    if (uid) {
      db.ref(`users-info/${uid}/actions/${dayjs().valueOf()}`).set('signOut')
      await dispatch('categories/unsubcribeCategories', null, { root: true })
      await dispatch('trns/unsubcribeTrns', null, { root: true })
      await dispatch('wallets/unsubcribeWallets', null, { root: true })
      await dispatch('app/clearUserData', null, { root: true })
      db.ref(`users/${uid}/budgets`).off()
      db.ref(`users/${uid}/groups`).off()
    }

    if (this.$router.currentRoute.name !== 'login') {
      this.app.context.redirect('/login')
    }
    firebase.auth().signOut()
  },

  async saveUserInfo ({ rootState }) {
    const user = rootState.user.user
    const todayValueOf = dayjs().valueOf()

    // add to user list
    const usersInfo = await db.ref(`users-info/${user.uid}/`).once('value')
    const usersInfoVal = usersInfo.val()
    const userData = {
      displayName: user.displayName,
      email: user.email,
      uid: user.uid,
      loginDate: todayValueOf
    }

    db.ref(`users/${user.uid}/user`).set(userData)

    db.ref(`users-info/${user.uid}/name`).set(user.displayName)
    db.ref(`users-info/${user.uid}/email`).set(user.email)
    db.ref(`users-info/${user.uid}/uid`).set(user.uid)
    db.ref(`users-info/${user.uid}/loginDate`).set(todayValueOf)

    // set creation date once
    if (!usersInfoVal || (usersInfoVal && !usersInfoVal.creationDate)) {
      db.ref(`users-info/${user.uid}/creationDate`).set(todayValueOf)
    }
    // set date of open app
    db.ref(`users-info/${user.uid}/opensApp/${pkg.version.split('.').join('')}`).set(dayjs().valueOf())
  },

  removeUserData ({ rootState, commit, dispatch }) {
    commit('app/setAppStatus', 'loading', { root: true })
    dispatch('ui/setActiveTab', 'stat', { root: true })
    const uid = rootState.user.user.uid

    db.ref(`users/${uid}/accounts/`).set(null)
    db.ref(`users/${uid}/categories/`).set(null)
    db.ref(`users/${uid}/trns/`).set(null)
    db.ref(`users-info/${uid}/actions/${dayjs().valueOf()}`).set('removeUserData')
    commit('app/setAppStatus', 'ready', { root: true })
  }
}
