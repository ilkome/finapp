import dayjs from 'dayjs'
import { db } from '~/services/firebaseConfig'
import generateId from '~/utils/id'

export default {
  initGroups ({ dispatch, rootGetters }) {
    const uid = rootGetters['user/userUid']
    const path = `users/${uid}/groups`

    if (uid) {
      db.ref(path).on('value', (snapshot) => {
        const items = Object.freeze(snapshot.val())
        dispatch('setGroups', items)
      }, e => console.error(e))
    }
  },

  setGroups ({ commit }, items) {
    commit('setGroups', items)
  },

  async createGroup ({ rootGetters }, values) {
    const id = generateId(dayjs().valueOf())
    const uid = rootGetters['user/userUid']
    const path = `users/${uid}/groups/${id}`

    await db.ref(path)
      .set({
        currency: 'RUB',
        name: values.name,
        date: dayjs().valueOf()
      })
      .then(() => { return true })

    return false
  },

  async removeGroup ({ rootGetters }, id) {
    const uid = rootGetters['user/userUid']
    const path = `users/${uid}/groups/${id}`
    await db.ref(path)
      .remove()
      .then(() => { return true })
  },

  async addTrnToGroup ({ rootGetters }, { groupId, trnId }) {
    const uid = rootGetters['user/userUid']

    // add to group
    await db.ref(`users/${uid}/groups/${groupId}/trnsIds/${trnId}`)
      .set(trnId)
      .then(() => { return true })

    // info in trn
    await db.ref(`users/${uid}/trns/${trnId}/groups/${groupId}`)
      .set(groupId)
      .then(() => { return true })
  },

  removeTrnFromGroup ({ dispatch, rootGetters }, { groupId, trnId }) {
    const uid = rootGetters['user/userUid']

    // remove from group
    db.ref(`users/${uid}/groups/${groupId}/trnsIds/${trnId}`).set(null)
      .then(() => { return true })

    // remove from trn
    db.ref(`users/${uid}/trns/${trnId}/groups/${groupId}`)
      .remove()
      .then(() => { return true })
  },

  toogleAddToGroup ({ dispatch, rootState, rootGetters }, { groupId, trnId }) {
    const trn = rootState.trns.items[trnId]

    if (trn.groups && trn.groups[groupId]) {
      dispatch('removeTrnFromGroup', { groupId, trnId })
    }
    else {
      dispatch('addTrnToGroup', { groupId, trnId })
    }
  }
}
