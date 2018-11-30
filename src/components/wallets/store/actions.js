import localforage from 'localforage'
import { db } from '@/firebase'

export default {
  initWallets ({ dispatch, rootState }) {
    const uid = rootState.user.user.uid

    db.ref(`users/${uid}/accounts`).on('value', snapshot => {
      const items = Object.freeze(snapshot.val())
      dispatch('setWallets', items)
    }, e => console.error(e))
  },

  setWallets ({ commit }, items) {
    commit('setWallets', items)
    localforage.setItem('next.wallets', items)
  },

  unsubcribeWallets ({ rootState }) {
    const uid = rootState.user.user.uid
    db.ref(`users/${uid}/accounts`).off()
  }
}
