import localforage from 'localforage'
import dayjs from 'dayjs'
import { removeTrnToAddLaterLocal, removeTrnToDeleteLaterLocal, saveTrnIDforDeleteWhenClientOnline, saveTrnToAddLaterLocal } from './helpers'
import { getDataAndWatch, removeData, saveData, unsubscribeData, updateData } from '~/services/firebase/api'
import type { Transaction, Transfer, TrnId } from '~/components/trns/types'

export default {
  // init
  initTrns({ rootGetters, dispatch }) {
    const path = `users/${rootGetters['user/userUid']}/trns`
    getDataAndWatch(path, items => dispatch('setTrns', items || {}))
  },

  setTrns({ commit }, items) {
    commit('setTrns', items)
    localforage.setItem('finapp.trns', items)
  },

  /**
   * Create new trn
   * and save it to local storage when Client offline
   */
  addTrn({ commit, rootState }, { id, values }: {
    id: TrnId
    values: Transaction | Transfer
  }) {
    const uid = rootState.user.user.uid
    const trns = rootState.trns.items
    const valuesWithEditDate = {
      ...values,
      edited: dayjs().valueOf(),
    }
    let isTrnSavedOnline = false

    localforage.setItem('finapp.trns', { ...trns, [id]: valuesWithEditDate })
    commit('setTrns', Object.freeze({ ...trns, [id]: valuesWithEditDate }))

    console.log('id', id)
    console.log('hey', `users/${uid}/trns/${id}`, valuesWithEditDate)
    saveData(`users/${uid}/trns/${id}`, valuesWithEditDate)
      .then(() => {
        isTrnSavedOnline = true
        removeTrnToAddLaterLocal(id)
      })

    setTimeout(() => {
      if (!isTrnSavedOnline)
        saveTrnToAddLaterLocal({ id, values })
    }, 1000)

    // TODO: clean form
    // TODO: move offline logic to pinia store
    return true
  },

  // delete
  deleteTrn({ commit, rootState }, id) {
    const uid = rootState.user.user.uid
    const trns = { ...rootState.trns.items }

    delete trns[id]
    commit('setTrns', Object.freeze(trns))
    localforage.setItem('finapp.trns', trns)
    saveTrnIDforDeleteWhenClientOnline(id)

    removeData(`users/${uid}/trns/${id}`)
      .then(() => removeTrnToDeleteLaterLocal(id))
  },

  deleteTrnsByIds({ rootState }, trnsIds) {
    const uid = rootState.user.user.uid
    const trnsForDelete = {}
    for (const trnId of trnsIds)
      trnsForDelete[trnId] = null

    updateData(`users/${uid}/trns`, trnsForDelete)
  },

  unsubscribeTrns({ rootState }) {
    const uid = rootState.user.user.uid
    unsubscribeData(`users/${uid}/trns`)
  },

  /**
   * Add and delete trns which has been created in offline mode
   *
   * When user online
   * get trns from local storage
   * and add trns to database
   */
  uploadOfflineTrns({ dispatch, rootState }) {
    getDataAndWatch('.info/connected', async (isConnected) => {
      if (isConnected) {
        const trnsArrayForDelete = await localforage.getItem('finapp.trns.offline.delete') || []
        const trnsItemsForUpdate = await localforage.getItem('finapp.trns.offline.update') || {}

        // delete trns
        for (const trnId of trnsArrayForDelete) {
          dispatch('deleteTrn', trnId)
          delete trnsItemsForUpdate[trnId]
        }

        await localforage.setItem('finapp.trns.offline.update', trnsItemsForUpdate)

        // add trns
        for (const trnId in trnsItemsForUpdate) {
          const wallet = rootState.wallets.items[trnsItemsForUpdate[trnId].walletId]
          const category = rootState.categories.items[trnsItemsForUpdate[trnId].categoryId]

          // delete trn from local storage if no wallet or category
          if (!wallet || !category) {
            delete trnsItemsForUpdate[trnId]
            await localforage.setItem('finapp.trns.offline.update', trnsItemsForUpdate)
          }

          // add
          else if (trnsItemsForUpdate[trnId] && trnsItemsForUpdate[trnId].amount) {
            console.log('update', trnId, trnsItemsForUpdate[trnId])
            dispatch('addTrn', {
              id: trnId,
              values: trnsItemsForUpdate[trnId],
            })
          }
        }
      }
    })
  },
}
