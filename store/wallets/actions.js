import localforage from 'localforage'
import { getDataAndWatch, unsubscribeData, updateData } from '~/services/firebase/api'

export default {
  initWallets({ dispatch, rootState }) {
    const uid = rootState.user.user.uid
    getDataAndWatch(`users/${uid}/accounts`, (items) => {
      dispatch('setWallets', Object.freeze(items || {}))
    })
  },

  setWallets({ commit }, items) {
    commit('setWallets', items)
    localforage.setItem('finapp.wallets', items)
  },

  /**
    * Get object of wallets with order value
    * Create object with path to order field in DB
    * Update only order field for each wallet
    *
  */
  async saveWalletsOrder({ rootGetters }, wallets) {
    const updates = {}
    const result = {}

    for (const walletId in wallets)
      updates[`${walletId}/order`] = wallets[walletId]

    await updateData(`users/${rootGetters['user/userUid']}/accounts`, updates)
      .then(() => { result.success = 'Updated' })
      .catch((error) => { result.error = error })

    return result
  },

  unsubscribeWallets({ rootGetters }) {
    const uid = rootGetters['user/userUid']
    unsubscribeData(`users/${uid}/accounts`)
  },
}
