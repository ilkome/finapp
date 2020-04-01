import moment from 'moment'
import { db } from '@/firebase'
import generateId from '@/utils/id'

export default {
  initBudgets ({ dispatch, rootGetters }) {
    const uid = rootGetters.userUid
    const path = `users/${uid}/budgets`

    db.ref(path).on('value', snapshot => {
      const items = Object.freeze(snapshot.val())
      dispatch('setBudgets', items)
    }, e => console.error(e))
  },

  setBudgets ({ commit }, items) {
    commit('setBudgets', items)
  },

  async createBudget ({ rootGetters }, values) {
    const id = generateId(moment().valueOf())
    const uid = rootGetters.userUid
    const path = `users/${uid}/budgets/${id}`

    await db.ref(path)
      .set({
        amount: Number(values.amount),
        currency: values.currency,
        name: values.name,
        trnsIds: values.trnsIds,
        date: moment().valueOf()
      })
      .then(() => { return true })

    return false
  },

  async removeBudget ({ rootGetters }, id) {
    const uid = rootGetters.userUid
    const path = `users/${uid}/budgets/${id}`
    await db.ref(path)
      .remove()
      .then(() => { return true })
  },

  async addTrnToBudget ({ rootGetters }, { budgetId, trnId }) {
    const uid = rootGetters.userUid

    // add to budget
    await db.ref(`users/${uid}/budgets/${budgetId}/trnsIds/${trnId}`)
      .set(trnId)
      .then(() => { return true })

    // info in trn
    await db.ref(`users/${uid}/trns/${trnId}/budgets/${budgetId}`)
      .set(budgetId)
      .then(() => { return true })
  },

  removeTrnFromBudget ({ rootGetters }, { budgetId, trnId }) {
    const uid = rootGetters.userUid
    console.log('hey')

    // remove from budget
    db.ref(`users/${uid}/budgets/${budgetId}/trnsIds/${trnId}`)
      .remove()
      .then(() => { return true })

    // remove from trn
    db.ref(`users/${uid}/trns/${trnId}/budgets/${budgetId}`)
      .remove()
      .then(() => { return true })

    console.log('hey2')
  },

  toogleAddToBudget ({ dispatch, rootState, rootGetters }, { budgetId, trnId }) {
    const trn = rootState.trns.items[trnId]

    if (trn.budgets && trn.budgets[budgetId]) {
      dispatch('removeTrnFromBudget', { budgetId, trnId })
    }
    else {
      dispatch('addTrnToBudget', { budgetId, trnId })
    }
  }
}
