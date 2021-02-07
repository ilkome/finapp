import localforage from 'localforage'
import dayjs from 'dayjs'
import {
  removeTrnToAddLaterLocal,
  saveTrnToAddLaterLocal,
  saveTrnIDforDeleteWhenClientOnline,
  removeTrnToDeleteLaterLocal
} from './helpers'
import useCalculator from '~/components/trnForm/calculator/useCalculator'
import { db } from '~/services/firebaseConfig'

export default {
  /**
    * Create new trn
    * and save it to local storage when Client offline
    *
    * @param {object}
    * @param {string} {}.id
    * @param {object} {}.values
    * @param {string} {}.values.amount
    * @param {string} {}.values.category
  */
  addTrn ({ commit, rootState }, { id, values }) {
    const uid = rootState.user.user.uid
    const trns = rootState.trns.items
    const valuesWithEditDate = {
      ...values,
      edited: dayjs().valueOf()
    }
    let isTrnSavedOnline = false

    localforage.setItem('finapp.trns', { ...trns, [id]: valuesWithEditDate })
    commit('setTrns', Object.freeze({ ...trns, [id]: valuesWithEditDate }))

    db.ref(`users/${uid}/trns/${id}`)
      .set(valuesWithEditDate)
      .then(() => {
        isTrnSavedOnline = true
        removeTrnToAddLaterLocal(id)
      })

    setTimeout(() => {
      if (!isTrnSavedOnline) { saveTrnToAddLaterLocal({ id, values }) }
    }, 1000)

    const { clearExpression } = useCalculator()
    clearExpression()

    commit('trnForm/setTrnFormValues', {
      trnId: null,
      amount: '0',
      description: null
    }, { root: true })

    return true
  },

  // delete
  deleteTrn ({ commit, rootState }, id) {
    const uid = rootState.user.user.uid
    const trns = { ...rootState.trns.items }

    delete trns[id]
    commit('setTrns', Object.freeze(trns))
    localforage.setItem('finapp.trns', trns)
    saveTrnIDforDeleteWhenClientOnline(id)

    db.ref(`users/${uid}/trns/${id}`)
      .remove()
      .then(() => removeTrnToDeleteLaterLocal(id))
  },

  async deleteTrnsByIds ({ rootState }, trnsIds) {
    const uid = rootState.user.user.uid
    const trnsForDelete = {}
    for (const trnId of trnsIds) {
      trnsForDelete[trnId] = null
    }

    await db.ref(`users/${uid}/trns`)
      .update(trnsForDelete)
      .then(() => console.log('trns deleted'))
  },

  // init
  async initTrns ({ rootState, dispatch, commit }) {
    const uid = rootState.user.user.uid

    await db.ref(`users/${uid}/trns`).on('value', (snapshot) => {
      const items = Object.freeze(snapshot.val())
      if (items) {
        for (const trnId of Object.keys(items)) {
          if (!items[trnId].walletId || items[trnId].accountId) {
            commit('app/setAppStatus', 'loading', { root: true })
            const trn = items[trnId]
            db.ref(`users/${uid}/trns/${trnId}`)
              .set({
                amount: trn.amount,
                categoryId: trn.categoryId,
                date: Number(trn.date),
                description: trn.description || null,
                edited: dayjs().valueOf(),
                groups: trn.groups || null,
                budgets: trn.budgets || null,
                type: Number(trn.type),
                walletId: trn.accountId || trn.walletId
              })
          }
        }
      }
      dispatch('setTrns', items)
    }, e => console.error(e))
  },

  setTrns ({ commit }, items) {
    commit('setTrns', items)
    localforage.setItem('finapp.trns', items)
  },

  unsubcribeTrns ({ rootState }) {
    const uid = rootState.user.user.uid
    db.ref(`users/${uid}/trns`).off()
  },

  /**
    * Add and delete trns with had been created in offline mode
    *
    * When user online
    * get trns from local storage
    * and add them to database
  */
  uploadOfflineTrns ({ dispatch, rootState }) {
    db.ref('.info/connected').on('value', async (snap) => {
      const isConnected = snap.val()
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
              values: trnsItemsForUpdate[trnId]
            })
          }
        }
      }
    })
  }
}
