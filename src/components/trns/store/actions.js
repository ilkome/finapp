import localforage from 'localforage'
import moment from 'moment'

import { db } from '@/firebase'
import {
  removeTrnToAddLaterLocal,
  saveTrnToAddLaterLocal,
  saveTrnToDeleteLaterLocal,
  removeTrnToDeleteLaterLocal
} from './helpers'

export default {
  // create new trn and save it to offline
  addTrn ({ commit, rootState }, { id, values }) {
    const uid = rootState.user.user.uid
    const trns = rootState.trns.items
    let isTrnSavedOnline = false

    const formatedTrnValues = {
      accountId: values.walletId,
      amount: values.amount,
      categoryId: values.categoryId,
      date: moment(values.date).valueOf(),
      description: values.description || null,
      editDate: moment().valueOf(),
      type: values.amountType
    }

    localforage.setItem('next.trns', { ...trns, [id]: formatedTrnValues })
    commit('setTrns', Object.freeze({ ...trns, [id]: formatedTrnValues }))

    db.ref(`users/${uid}/trns/${id}`)
      .set(formatedTrnValues)
      .then(() => {
        isTrnSavedOnline = true
        removeTrnToAddLaterLocal(id)
      })

    setTimeout(() => {
      if (!isTrnSavedOnline) saveTrnToAddLaterLocal({ id, values })
    }, 100)

    commit('setTrnFormValues', { trnId: null })
  },

  // delete
  deleteTrn ({ commit, rootState }, id) {
    const uid = rootState.user.user.uid
    const trns = { ...rootState.trns.items }

    delete trns[id]
    commit('setTrns', Object.freeze(trns))
    localforage.setItem('next.trns', trns)
    saveTrnToDeleteLaterLocal(id)

    db.ref(`users/${uid}/trns/${id}`)
      .remove()
      .then(() => removeTrnToDeleteLaterLocal(id))
  },

  // init
  initTrns ({ rootState, dispatch, commit }) {
    const uid = rootState.user.user.uid

    db.ref(`users/${uid}/trns`).on('value', snapshot => {
      const items = Object.freeze(snapshot.val())
      dispatch('setTrns', items)
      commit('setAppStatus', 'ready')
    }, e => console.error(e))
  },

  setTrns ({ commit }, items) {
    commit('setTrns', items)
    localforage.setItem('next.trns', items)
  },

  unsubcribeTrns ({ rootState }) {
    const uid = rootState.user.user.uid
    db.ref(`users/${uid}/trns`).off()
  },

  async iniOfflineTrns ({ dispatch }) {
    db.ref('.info/connected').on('value', async snap => {
      const isConnected = snap.val()
      if (isConnected) {
        // add
        const trnsOfflineUpdate = await localforage.getItem('next.trns.offline.update') || {}
        for (const trnId in trnsOfflineUpdate) {
          if (trnsOfflineUpdate[trnId] && trnsOfflineUpdate[trnId].amount) {
            dispatch('addTrn', {
              id: trnId,
              values: trnsOfflineUpdate[trnId]
            })
          }
        }
        // delete
        const trnsOfflineDelete = await localforage.getItem('next.trns.offline.delete') || []
        for (const trnId of trnsOfflineDelete) {
          dispatch('deleteTrn', trnId)
        }
      }
    })
  }
}
