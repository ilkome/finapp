import localforage from 'localforage'
import { db } from '@/store/firebase'
import { formatTrnForDb, formatTrnForStore } from '@/store/modules/trns/utils'

export default {
  // Put all trns to store
  // ---------------------------------------------------------------------------
  async setTrns({ commit, state, rootState }, data) {
    if (data && data.trns) {
      try {
        const trns = data.trns
        const rates = rootState.rates.all
        const accounts = rootState.accounts.all
        const categories = rootState.categories.all
        const formatedTrns = []
        for (const key in trns) {
          const formatedTrn = formatTrnForStore(trns[key], { accounts, categories, rates })
          formatedTrns.push(formatedTrn)
        }
        commit('setTrns', formatedTrns)
      } catch (error) {
        throw new Error(error.message)
      }
    } else {
      commit('setTrns', [])
    }
  },

  // Add trn
  // ---------------------------------------------------------------------------
  async addTrn({ commit, state, rootState }, values) {
    const result = {
      status: null,
      error: null
    }
    try {
      const formatedTrn = formatTrnForDb(values)
      const accounts = rootState.accounts.all
      const categories = rootState.categories.all
      const rates = rootState.rates.all

      // Online
      if (rootState.isConnected) {
        await db
          .ref(`users/${rootState.user.user.uid}/trns/${formatedTrn.id}`)
          .set(formatedTrn)
        const addedOfflineTrns = await localforage.getItem('addedOfflineTrns')
        if (addedOfflineTrns) {
          delete addedOfflineTrns[formatedTrn.id]
          await localforage.setItem('addedOfflineTrns', { ...addedOfflineTrns })
        }

        result.status = 'online'
        result.error = null
      }

      // Offline
      if (!rootState.isConnected) {
        const formatedTrnForStore = formatTrnForStore(formatedTrn, {
          accounts, categories, rates
        })

        let addedOfflineTrns = await localforage.getItem('addedOfflineTrns')
        await localforage.setItem('addedOfflineTrns', {
          [formatedTrn.id]: formatedTrn, ...addedOfflineTrns
        })

        const localTrns = await localforage.getItem('trns')
        await localforage.setItem('trns', [formatedTrnForStore, ...localTrns])

        commit('addTrn', formatedTrnForStore)
        result.status = 'offline'
        result.error = null
      }
    } catch (error) {
      console.error(error)
      result.status = 'error'
      result.error = error.message
      return result
    }
    return result
  },

  // Update trn
  // ---------------------------------------------------------------------------
  async updateTrn({ commit, state, rootState }, values) {
    const result = {
      status: null,
      error: null
    }
    try {
      const formatedTrn = formatTrnForDb(values)
      const accounts = rootState.accounts.all
      const categories = rootState.categories.all
      const rates = rootState.rates.all

      // Online
      if (rootState.isConnected) {
        await db
          .ref(`users/${rootState.user.user.uid}/trns/${formatedTrn.id}`)
          .update(formatedTrn)

        const updatedOfflineTrns = await localforage.getItem('updatedOfflineTrns')
        if (updatedOfflineTrns) {
          delete updatedOfflineTrns[formatedTrn.id]
          await localforage.setItem('updatedOfflineTrns', updatedOfflineTrns)
        }

        result.status = 'online'
        result.error = null
      }

      // Offline
      if (!rootState.isConnected) {
        const formatedTrnForStore = formatTrnForStore(formatedTrn, {
          accounts, categories, rates
        })

        let updatedOfflineTrns = await localforage.getItem('updatedOfflineTrns')
        updatedOfflineTrns = { [formatedTrn.id]: formatedTrn, ...updatedOfflineTrns }
        await localforage.setItem('updatedOfflineTrns', updatedOfflineTrns)

        const localTrns = await localforage.getItem('trns')
        await localforage.setItem('trns', [formatedTrnForStore, ...localTrns])

        commit('updateTrn', formatedTrnForStore)
        result.status = 'offline'
        result.error = null
      }
    } catch (error) {
      console.error(error)
      result.status = 'error'
      result.error = error.message
      return result
    }
    return result
  },

  // Delete trn
  // ---------------------------------------------------------------------------
  async deleteTrn({ commit, rootState }, id) {
    const result = {
      status: null,
      error: null
    }
    try {
      // Online
      if (rootState.isConnected) {
        const trnRef = db.ref(`users/${rootState.user.user.uid}/trns/${id}`)
        await trnRef.remove()

        const deletedOfflineTrns = await localforage.getItem('deletedOfflineTrns')
        if (deletedOfflineTrns && deletedOfflineTrns.length) {
          await localforage.setItem('deletedOfflineTrns',
            deletedOfflineTrns.filter(trnId => trnId !== id)
          )
        }

        result.status = 'online'
        result.error = null
      }

      // Offline
      if (!rootState.isConnected) {
        const deletedOfflineTrns = await localforage.getItem('deletedOfflineTrns')
        await localforage.setItem('deletedOfflineTrns', [id, ...deletedOfflineTrns])

        const localTrns = await localforage.getItem('trns')
        if (localTrns && localTrns.length) {
          await localforage.setItem('trns',
            localTrns.filter(trn => trn.id !== id)
          )
        }

        commit('deleteTrn', id)
        result.status = 'offline'
        result.error = null
      }
    } catch (error) {
      console.error(error)
      result.status = 'error'
      result.error = error.message
      return result
    }
    return result
  }
}
