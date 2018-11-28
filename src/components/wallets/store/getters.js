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
  getWalletAmount: (state, getters, rootState) => (walletId) => {
    const trns = rootState.trns.items
    let amount = 0
    const trnsIds = getters.getTrnsIdsInWallet(walletId)
    for (const trnId of trnsIds) {
      if (trns[trnId]) {
        if (trns[trnId].type === 0) {
          amount = amount - trns[trnId].amount
        } else {
          amount = amount + trns[trnId].amount
        }
      }
    }
    return amount
  },

  walletsTotal (state, getters, rootState, rootGetters) {
    const walletsTotal = {}
    const wallets = rootState.wallets.items

    const getWalletAmount = (walletId) => {
      const trns = rootState.trns.items
      let amount = 0
      const trnsIds = rootGetters.getTrnsIdsInWallet(walletId)
      for (const trnId of trnsIds) {
        if (trns[trnId].type === 0) {
          amount = amount - trns[trnId].amount
        } else {
          amount = amount + trns[trnId].amount
        }
      }
      return amount || 0
    }

    Object.keys(wallets).forEach(id => {
      walletsTotal[id] = {
        base: getWalletAmount(id),
        currency: wallets[id].currency
      }
    })

    return walletsTotal
  },

  walletsSortedIds (state, getters, rootState, rootGetters) {
    if (!rootGetters.hasWallets) return []
    return Object.keys(state.items).sort((a, b) => {
      if (parseInt(state.items[a].order) < parseInt(state.items[b].order)) return -1
      if (parseInt(state.items[a].order) > parseInt(state.items[b].order)) return 1
      return 0
    })
  }
}
