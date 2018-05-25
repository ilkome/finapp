import localforage from 'localforage'
import { db } from '@/store/firebase'
import { formatTrnForDb, formatTrnForStore } from '@/store/modules/trns/utils'

const saveTrnToOfflineList = async (trn) => {
  let addedOfflineTrns = await localforage.getItem('old:addedOfflineTrns')
  await localforage.setItem('old:addedOfflineTrns',
    addedOfflineTrns
      ? { [trn.id]: trn, ...addedOfflineTrns }
      : { [trn.id]: trn }
  )
}

const saveTrnToLocalCache = async (trn) => {
  const localTrns = await localforage.getItem('old:trns')
  await localforage.setItem('old:trns',
    localTrns && localTrns.length
      ? [trn, ...localTrns]
      : [trn]
  )
}

const removeTrnFromOfflineList = async (trn) => {
  const addedOfflineTrns = await localforage.getItem('old:addedOfflineTrns')
  if (addedOfflineTrns) {
    delete addedOfflineTrns[trn.id]
    await localforage.setItem('old:addedOfflineTrns',
      addedOfflineTrns ? { ...addedOfflineTrns } : {}
    )
  }
}

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
          const trn = {
            id: key,
            ...trns[key]
          }
          const formatedTrn = formatTrnForStore(trn, { accounts, categories, rates })
          formatedTrns.push({
            ...formatedTrn,
            id: key
          })
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

      // Save to local storage
      const formatedTrnForStore = formatTrnForStore(formatedTrn, {
        accounts, categories, rates
      })
      saveTrnToOfflineList(formatedTrn)
      saveTrnToLocalCache(formatedTrn)
      commit('addTrn', formatedTrnForStore)

      // Online
      if (rootState.isConnected) {
        result.status = 'online'
        result.error = null
        db
          .ref(`users/${rootState.user.user.uid}/trns/${formatedTrn.id}`)
          .set(formatedTrn)
          .then(removeTrnFromOfflineList(formatedTrn))
      }

      // Offline
      if (!rootState.isConnected) {
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

        const updatedOfflineTrns = await localforage.getItem('old:updatedOfflineTrns')
        if (updatedOfflineTrns) {
          delete updatedOfflineTrns[formatedTrn.id]
          await localforage.setItem('old:updatedOfflineTrns',
            updatedOfflineTrns ? { ...updatedOfflineTrns } : {}
          )
        }

        result.status = 'online'
        result.error = null
      }

      // Offline
      if (!rootState.isConnected) {
        const formatedTrnForStore = formatTrnForStore(formatedTrn, {
          accounts, categories, rates
        })

        let updatedOfflineTrns = await localforage.getItem('old:updatedOfflineTrns')
        await localforage.setItem('old:updatedOfflineTrns',
          updatedOfflineTrns
            ? { [formatedTrn.id]: formatedTrn, ...updatedOfflineTrns }
            : { [formatedTrn.id]: formatedTrn }
        )

        const localTrns = await localforage.getItem('old:trns')
        await localforage.setItem('old:trns',
          localTrns && localTrns.length
            ? [formatedTrnForStore, ...localTrns.filter(trnId => trnId !== formatedTrnForStore.id)]
            : [formatedTrnForStore]
        )

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

        const deletedOfflineTrns = await localforage.getItem('old:deletedOfflineTrns')
        if (deletedOfflineTrns && deletedOfflineTrns.length) {
          await localforage.setItem('old:deletedOfflineTrns',
            deletedOfflineTrns.filter(trnId => trnId !== id)
          )
        }

        result.status = 'online'
        result.error = null
      }

      // Offline
      if (!rootState.isConnected) {
        console.log('offline')
        const deletedOfflineTrns = await localforage.getItem('old:deletedOfflineTrns')
        await localforage.setItem('old:deletedOfflineTrns',
          (deletedOfflineTrns && deletedOfflineTrns.length)
            ? [id, ...deletedOfflineTrns]
            : [id]
        )

        const localTrns = await localforage.getItem('old:trns')
        if (localTrns && localTrns.length) {
          await localforage.setItem('old:trns',
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
