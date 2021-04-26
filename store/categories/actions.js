import localforage from 'localforage'
import { db } from '~/services/firebaseConfig'

export default {
  initCategories ({ dispatch, rootState }) {
    const uid = rootState.user.user.uid

    db.ref(`users/${uid}/categories`).on('value', (snapshot) => {
      const items = snapshot.val()
      for (const id in items) {
        items[id] = Object.freeze(items[id])
      }
      dispatch('setCategories', items)
    }, e => console.error(e))
  },

  setCategories ({ commit }, items) {
    commit('setCategories', items)
    localforage.setItem('finapp.categories', items)
  },

  unsubcribeCategories ({ rootState }) {
    const uid = rootState.user.user.uid
    db.ref(`users/${uid}/categories`).off()
  },

  showCategoryModal ({ commit }, id) {
    commit('showCategoryModal')
    commit('setCategoryModalId', id)
  }
}
