import moment from 'moment'
import { db } from '@/firebase'
import { generateDateId } from '@/utils/id'

export default {
  initGroups ({ dispatch, rootGetters }) {
    const uid = rootGetters.userUid
    const path = `users/${uid}/groups`

    db.ref(path).on('value', snapshot => {
      const items = Object.freeze(snapshot.val())
      dispatch('setGroups', items)
    }, e => console.error(e))
  },

  setGroups ({ commit }, items) {
    commit('setGroups', items)
  },

  async createGroup ({ rootGetters }, values) {
    const id = generateDateId()
    const uid = rootGetters.userUid
    const path = `users/${uid}/groups/${id}`

    await db.ref(path)
      .set({
        currency: 'RUB',
        name: values.name,
        date: moment().valueOf()
      })
      .then(() => { return true })

    return false
  },

  async removeGroup ({ rootGetters }, id) {
    const uid = rootGetters.userUid
    const path = `users/${uid}/groups/${id}`
    await db.ref(path)
      .remove()
      .then(() => { return true })
  },

  async addTrnToGroup ({ rootGetters }, { groupId, trnId }) {
    const uid = rootGetters.userUid

    // add to group
    await db.ref(`users/${uid}/groups/${groupId}/trnsIds/${trnId}`)
      .set(trnId)
      .then(() => { return true })

    // info in trn
    await db.ref(`users/${uid}/trns/${trnId}/groups/${groupId}`)
      .set(groupId)
      .then(() => { return true })
  },

  async removeTrnFromGroup ({ dispatch, rootGetters }, { groupId, trnId }) {
    const uid = rootGetters.userUid

    // remove from group
    await db.ref(`users/${uid}/groups/${groupId}/trnsIds/${trnId}`)
      .remove()
      .then(() => { return true })

    // remove from trn
    await db.ref(`users/${uid}/trns/${trnId}/groups/${groupId}`)
      .remove()
      .then(() => { return true })
  },

  toogleAddToGroup ({ dispatch, rootState, rootGetters }, { groupId, trnId }) {
    const trn = rootState.trns.items[trnId]

    if (trn.groups && trn.groups[groupId]) {
      dispatch('removeTrnFromGroup', { groupId, trnId })
    } else {
      dispatch('addTrnToGroup', { groupId, trnId })
    }
  }
}
