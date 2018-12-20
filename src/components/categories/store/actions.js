import localforage from 'localforage'
import { db } from '@/firebase'

export default {
  initCategories({ dispatch, rootState }) {
    db.ref(`categories`).on('value', snapshot => {
      const items = Object.freeze(snapshot.val())
      dispatch('setCategories', items)
    }, e => console.error(e))
  },

  setCategories({ commit }, items) {
    commit('setCategories', items)
    localforage.setItem('next.categories', items)
  },

  unsubcribeCategories({ rootState }) {
    db.ref(`categories`).off()
  }
}
