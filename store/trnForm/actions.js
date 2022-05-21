import dayjs from 'dayjs'

export default {
  closeTrnForm({ commit }) {
    commit('closeTrnForm')
    commit('setTrnFormValues', {
      trnId: null,
    })
  },

  openTrnForm({ rootState, rootGetters, commit }, { action, trnId }) {
    commit('openTrnForm')
    const lastTrn = rootState.trns.items[rootGetters['trns/lastCreatedTrnId']]
    console.log(rootGetters['trns/lastCreatedTrnId'], lastTrn)

    switch (action) {
      case 'create':
        // get data from last trn
        if (lastTrn) {
          commit('setTrnFormValues', {
            amount: '0',
            amountType: 0,
            categoryId: lastTrn.categoryId,
            date: dayjs().valueOf(),
            description: null,
            groups: null,
            trnId: null,
            expenseAmount: 0,
            incomeAmount: 0,
            walletId: lastTrn.walletId,
          })
        }
        else {
          const categoriesIds = rootGetters['categories/categoriesIds']
          const childs = categoriesIds.filter(cId => cId !== 'transfer' && (!rootState.categories.items[cId].childIds || rootState.categories.items[cId].childIds.length === 0))
          const categoryId = childs[0]
          const walletsIds = Object.keys(rootState.wallets.items)
          const walletId = walletsIds[0]
          commit('setTrnFormValues', {
            amount: '0',
            amountType: 0,
            categoryId,
            date: dayjs().valueOf(),
            description: null,
            groups: null,
            trnId: null,
            expenseAmount: 0,
            incomeAmount: 0,
            walletId,
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
              amount: 888,
              amountType: 2,
              categoryId: trn.categoryId,
              date: trn.date,
              description: trn.description || null,
              groups: null,
              trnId,
              expenseWalletAmount: trn.expenseWalletAmount || trn.amount,
              expenseWalletId: trn.expenseWalletId || trn.walletToId,
              incomeWalletAmount: trn.incomeWalletAmount || trn.amount,
              incomeWalletId: trn.incomeWalletId || trn.walletFromId,
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
              groups: trn.groups || null,
              trnId,
              walletId: trn.walletId,
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
            groups: null,
            trnId: null,
            walletId: trn.walletId,
          })
        }
        break
    }
  },
}
