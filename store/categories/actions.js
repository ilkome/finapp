import localforage from 'localforage'
import { db } from '~/services/firebaseConfig'

export default {
  initCategories ({ dispatch, rootState }) {
    const uid = rootState.user.user.uid

    db.ref(`users/${uid}/categories`).on('value', (snapshot) => {
      const items = snapshot.val()

      // add child categories to root categories
      for (const categoryId in items) {
        const parentCategoryId = items[categoryId].parentId
        if (parentCategoryId !== 0) {
          items[parentCategoryId].childIds
            ? !items[parentCategoryId].childIds.includes(categoryId) && items[parentCategoryId].childIds.push(categoryId)
            : items[parentCategoryId].childIds = [categoryId]
        }
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
