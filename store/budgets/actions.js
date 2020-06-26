import dayjs from 'dayjs'
import { db } from '~/services/firebaseConfig'
import generateId from '~/utils/id'

export default {
  initBudgets ({ dispatch, rootGetters }) {
    const uid = rootGetters['user/userUid']
    const path = `users/${uid}/budgets`

    if (uid) {
      db.ref(path).on('value', (snapshot) => {
        const items = Object.freeze(snapshot.val())
        dispatch('setBudgets', items)
      }, e => console.error(e))
    }
  },

  setBudgets ({ commit }, items) {
    commit('setBudgets', items)
  },

  async createBudget ({ rootGetters }, values) {
    const id = generateId(dayjs().valueOf())
    const uid = rootGetters['user/userUid']
    const path = `users/${uid}/budgets/${id}`

    await db.ref(path)
      .set({
        amount: Number(values.amount),
        currency: values.currency,
        name: values.name,
        trnsIds: values.trnsIds,
        date: dayjs().valueOf()
      })
      .then(() => { return true })

    return false
  },

  async removeBudget ({ rootGetters }, id) {
    const uid = rootGetters['user/userUid']
    const path = `users/${uid}/budgets/${id}`
    await db.ref(path)
      .remove()
      .then(() => { return true })
  },

  async addTrnToBudget ({ rootGetters }, { budgetId, trnId }) {
    const uid = rootGetters['user/userUid']

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
    const uid = rootGetters['user/userUid']

    // remove from budget
    db.ref(`users/${uid}/budgets/${budgetId}/trnsIds/${trnId}`)
      .remove()
      .then(() => { return true })

    // remove from trn
    db.ref(`users/${uid}/trns/${trnId}/budgets/${budgetId}`)
      .remove()
      .then(() => { return true })
  },

  toogleAddToBudget ({ dispatch, rootState }, { budgetId, trnId }) {
    const trn = rootState.trns.items[trnId]

    if (trn.budgets && trn.budgets[budgetId]) {
      dispatch('removeTrnFromBudget', { budgetId, trnId })
    }
    else {
      dispatch('addTrnToBudget', { budgetId, trnId })
    }
  }
}
