import dayjs from 'dayjs'

export default {
  closeTrnForm ({ commit }) {
    commit('closeTrnForm')
    commit('setTrnFormValues', {
      trnId: null
    })
  },

  openTrnForm ({ rootState, rootGetters, commit }, { action, trnId }) {
    commit('openTrnForm')
    switch (action) {
      case 'create':
        if (rootGetters['trns/hasTrns'] && rootState.trns.items[rootGetters['trns/lastCreatedTrnId']]) {
          const lastTrn = rootState.trns.items[rootGetters['trns/lastCreatedTrnId']]
          commit('setTrnFormValues', {
            amount: '0',
            amountType: 0,
            categoryId: lastTrn.categoryId,
            date: dayjs().valueOf(),
            description: null,
            trnId: null,
            walletId: lastTrn.walletId
          })
        }
        else {
          const categoriesIds = Object.keys(rootState.categories.items)
          const categoryId = categoriesIds[0]
          const walletsIds = Object.keys(rootState.wallets.items)
          const walletId = walletsIds[0]
          commit('setTrnFormValues', {
            amount: '0',
            amountType: 0,
            categoryId,
            date: dayjs().valueOf(),
            description: null,
            trnId: null,
            walletId
          })
        }
        break

      case 'edit':
        if (trnId && rootGetters['trns/hasTrns']) {
          const trn = rootState.trns.items[trnId]

          // Transfer
          if (trn.type === 2) {
            commit('setTrnFormValues', {
              ...trn,
              amount: trn.amount,
              amountFrom: trn.amount,
              amountTo: trn.amount,
              amountType: trn.type,
              categoryId: trn.categoryId,
              date: trn.date,
              description: trn.description || null,
              trnId,
              walletId: trn.walletId,
              walletFromId: trn.walletFromId,
              walletToId: trn.walletToId
            })
          }
          // Simple
          else {
            commit('setTrnFormValues', {
              ...trn,
              amount: trn.amount,
              amountType: trn.type,
              categoryId: trn.categoryId,
              date: trn.date,
              description: trn.description || null,
              trnId,
              walletId: trn.walletId
            })
          }
        }
        break

      case 'duplicate':
        if (trnId && rootGetters['trns/hasTrns']) {
          const trn = rootState.trns.items[trnId]
          commit('setTrnFormValues', {
            ...trn,
            amountType: trn.type,
            categoryId: trn.categoryId,
            date: dayjs().valueOf(),
            description: trn.description || null,
            trnId: null,
            walletId: trn.walletId
          })
        }
        break
    }
  }
}
