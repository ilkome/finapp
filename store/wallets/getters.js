// getWalletAmount
// walletsTotal
// walletsSortedIds

export default {
  hasWallets (state, getters, rootState) {
    if (rootState.wallets.items) {
      if (Object.keys(rootState.wallets.items).length > 0) {
        return true
      }
    }
    return false
  },

  // getWalletAmount
  getWalletAmount: (state, getters, rootState, rootGetters) => (walletId) => {
    const trnsIds = rootGetters['trns/getTrnsIdsInWallet'](walletId)
    const { total } = rootGetters['trns/getTotalOfTrnsIds'](trnsIds, true, false, walletId)
    return total || 0
  },

  walletsTotal (state, getters, rootState, rootGetters) {
    if (!getters.hasWallets) { return {} }
    const walletsTotal = {}
    const wallets = rootState.wallets.items

    const getWalletAmount = (walletId) => {
      const trnsIds = rootGetters['trns/getTrnsIdsInWallet'](walletId)
      const { total } = rootGetters['trns/getTotalOfTrnsIds'](trnsIds, true, false, walletId)
      return total || 0
    }

    Object.keys(wallets).forEach((id) => {
      walletsTotal[id] = {
        base: getWalletAmount(id),
        currency: wallets[id].currency
      }
    })

    return walletsTotal
  },

  walletsSortedIds (state, getters) {
    if (!getters.hasWallets) { return [] }
    return Object.keys(state.items).sort((a, b) => {
      if (parseInt(state.items[a].order) < parseInt(state.items[b].order)) { return -1 }
      if (parseInt(state.items[a].order) > parseInt(state.items[b].order)) { return 1 }
      return 0
    })
  },

  getWalletWithId: (state, getters, rootState, rootGetters) => (walletId) => {
    return {
      id: walletId,
      ...rootState.wallets.items[walletId]
    }
  }
}
