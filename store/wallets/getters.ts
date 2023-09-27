import { getTrnsIds } from '~/components/trns/getTrns'
import { getTotal } from '~/components/amount/getTotal'
import type { WalletId } from '~~/components/wallets/types'

export default {
  hasWallets(_state, _getters, rootState) {
    if (Object.keys(rootState.wallets.items).length > 0)
      return true
  },

  /**
   * Get total in every wallet
   */
  walletsTotal(_state, getters, rootState) {
    if (!getters.hasWallets)
      return {}

    const walletsItems = rootState.wallets.items
    const trnsItems = rootState.trns.items

    const getWalletTotal = (walletId: WalletId) => {
      const trnsIds = getTrnsIds({ trnsItems, walletsIds: [walletId] })
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
      .forEach((walletId: WalletId) =>
        walletsTotal[walletId] = getWalletTotal(walletId))

    return walletsTotal
  },

  walletsSortedIds(state, getters) {
    if (!getters.hasWallets)
      return []

    return Object.keys(state.items).sort((a, b) => state.items[a].order - state.items[b].order)
  },
}
