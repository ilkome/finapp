import localforage from 'localforage'
import { db } from '@/firebase'

export default {
  addWallet({ dispatch, rootState, getters }, { id, values }) {
    const uid = rootState.user.user.uid
    const formatedValues = {
      color: values.color,
      countTotal: values.countTotal,
      currency: values.currency,
      name: values.name,
      order: values.order || '1',
      users: values.users || [uid],
      atm: values.atm,
      blocked: values.blocked || 0
    }
    // set default currency based on first created wallet
    if (!getters.hasWallets) {
      dispatch('setBaseCurrency', values.currency)
    }
    db.ref(`accounts/${id}`).set(formatedValues)
  },

  initWallets({ dispatch, rootState }) {
    db.ref(`accounts`).on('value', snapshot => {
      const accounts = Object.freeze(snapshot.val())
      dispatch('setWallets', accounts)
    }, e => console.error(e))
  },

  setWallets({ commit }, items) {
    commit('setWallets', items)
    localforage.setItem('next.wallets', items)
  },

  unsubcribeWallets({ rootState }) {
    db.ref(`/accounts`).off()
  }
}
