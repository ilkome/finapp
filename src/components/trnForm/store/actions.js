import moment from 'moment'

export default {
  closeTrnForm ({ commit }) {
    commit('closeTrnForm')
  },

  openTrnForm ({ rootState, rootGetters, commit }, { action, trnId }) {
    commit('openTrnForm')
    switch (action) {
      case 'create':
        if (rootGetters.hasTrns) {
          const lastTrn = rootState.trns.items[rootGetters.lastCreatedTrnId]
          commit('setTrnFormValues', {
            amount: 0,
            amountArray: [0],
            amountType: 0,
            categoryId: lastTrn.categoryId,
            date: moment().valueOf(),
            description: null,
            trnId: null,
            walletId: lastTrn.accountId
          })
        } else {
          const categoriesIds = Object.keys(rootState.categories.items)
          const categoryId = categoriesIds[0]
          const walletsIds = Object.keys(rootState.wallets.items)
          const walletId = walletsIds[0]
          commit('setTrnFormValues', {
            amount: 0,
            amountArray: [0],
            amountType: 0,
            categoryId,
            date: moment().valueOf(),
            description: null,
            trnId: null,
            walletId
          })
        }
        break

      case 'edit':
        if (trnId && rootGetters.hasTrns) {
          const trn = rootState.trns.items[trnId]
          commit('setTrnFormValues', {
            amount: trn.amount,
            amountArray: [trn.amount],
            amountType: trn.type,
            categoryId: trn.categoryId,
            date: trn.date,
            description: trn.description || null,
            trnId,
            walletId: trn.accountId
          })
        }
        break

      case 'duplicate':
        if (trnId && rootGetters.hasTrns) {
          const trn = rootState.trns.items[trnId]
          commit('setTrnFormValues', {
            amount: 0,
            amountArray: [0],
            amountType: trn.type,
            categoryId: trn.categoryId,
            date: moment().valueOf(),
            description: null,
            trnId: null,
            walletId: trn.accountId
          })
        }
        break
    }
  }
}
