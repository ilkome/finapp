import { auth } from 'firebase/app'
import localforage from 'localforage'
import moment from 'moment'

import { db } from '@/firebase'

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
    localforage.setItem('next.user', user)
  },

  async signOut ({ rootState, commit, dispatch }) {
    const uid = rootState.user.user.uid
    db.ref(`users-info/${uid}/actions/${moment().valueOf()}`).set('signOut')

    commit('setAppStatus', 'login')
    dispatch('unsubcribeCategories')
    dispatch('unsubcribeTrns')
    dispatch('unsubcribeWallets')
    dispatch('clearUserData')
    auth().signOut()
  },

  async saveUserInfo ({ rootState }) {
    const user = rootState.user.user
    const todayValueOf = moment().valueOf()

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
  },

  async removeUserData ({ rootState, commit, dispatch }) {
    commit('setAppStatus', 'loading')
    dispatch('setActiveTab', 'stat')
    const uid = rootState.user.user.uid

    db.ref(`users/${uid}/accounts/`).set(null)
    db.ref(`users/${uid}/categories/`).set(null)
    db.ref(`users/${uid}/trns/`).set(null)
    db.ref(`users-info/${uid}/actions/${moment().valueOf()}`).set('removeUserData')
    commit('setAppStatus', 'ready')
  }
}
