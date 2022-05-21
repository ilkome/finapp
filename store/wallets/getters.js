import { getTrnsIds } from '~/components/trns/getTrns'
import { getTotal } from '~/components/amount/getTotal'

export default {
  hasWallets(state, getters, rootState) {
    if (rootState.wallets.items) {
      if (Object.keys(rootState.wallets.items).length > 0)
        return true
    }
    return false
  },

  /**
   * Get total in every wallet
   */
  walletsTotal(_state, getters, rootState) {
    if (!getters.hasWallets)
      return {}

    const walletsItems = rootState.wallets.items
    const trnsItems = rootState.trns.items

    const getWalletTotal = (walletId) => {
      const trnsIds = getTrnsIds({ trnsItems, walletsIds: walletId })
      const { sumTransactions, sumTransfers } = getTotal({
        trnsIds,
        trnsItems,
        walletsIds: [walletId],
        walletsItems,
      })

      return sumTransactions + sumTransfers
    }

    const walletsTotal = {}
    Object.keys(walletsItems)
      .forEach(walletId =>
        walletsTotal[walletId] = getWalletTotal(walletId))

    return walletsTotal
  },

  walletsSortedIds(state, getters) {
    if (!getters.hasWallets)
      return []
    return Object.keys(state.items).sort((a, b) => {
      if (parseInt(state.items[a].order) < parseInt(state.items[b].order))
        return -1
      if (parseInt(state.items[a].order) > parseInt(state.items[b].order))
        return 1
      return 0
    })
  },
}
