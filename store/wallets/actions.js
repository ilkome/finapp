import localforage from 'localforage'
import { db } from '~/services/firebaseConfig'

export default {
  addWallet ({ dispatch, rootState, getters }, { id, values }) {
    const uid = rootState.user.user.uid

    const formatedValues = {
      color: values.color,
      countTotal: values.countTotal,
      currency: values.currency,
      name: values.name,
      order: parseInt(values.order) || 1
    }

    // set default currency based on first created wallet
    if (!getters.hasWallets) {
      dispatch('currencies/setBaseCurrency', values.currency, { root: true })
    }

    db.ref(`users/${uid}/accounts/${id}`).set(formatedValues)
  },

  initWallets ({ dispatch, rootState }) {
    const uid = rootState.user.user.uid

    db.ref(`users/${uid}/accounts`).on('value', (snapshot) => {
      const items = Object.freeze(snapshot.val())
      dispatch('setWallets', items)
    }, e => console.error(e))
  },

  setWallets ({ commit }, items) {
    commit('setWallets', items)
    localforage.setItem('finapp.wallets', items)
  },

  unsubcribeWallets ({ rootGetters }) {
    const uid = rootGetters['user/userUid']
    db.ref(`users/${uid}/accounts`).off()
  },

  /**
    * Get object of wallets with order value
    * Create object with path to order field in DB
    * Update only order field for each wallet
    *
  */
  async saveWalletsOrder ({ rootGetters }, wallets) {
    const updates = {}
    const result = {}

    for (const walletId in wallets) {
      updates[`${walletId}/order`] = wallets[walletId]
    }

    await db.ref(`users/${rootGetters['user/userUid']}/accounts`)
      .update(updates, (error) => {
        error
          ? result.error = error
          : result.succsess = 'Updated'
      })

    return result
  }
}
