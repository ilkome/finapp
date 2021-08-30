import localforage from 'localforage'
import { getDataAndWatch, unsubcribeData } from '~/services/firebaseHelpers'

export default {
  initCategories ({ dispatch, rootState }) {
    const uid = rootState.user.user.uid
    getDataAndWatch(`users/${uid}/categories`, (items) => {
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
    })
  },

  setCategories ({ commit }, items) {
    commit('setCategories', items)
    localforage.setItem('finapp.categories', items)
  },

  unsubcribeCategories ({ rootState }) {
    const uid = rootState.user.user.uid
    unsubcribeData(`users/${uid}/categories`)
  },

  showCategoryModal ({ commit }, id) {
    commit('showCategoryModal')
    commit('setCategoryModalId', id)
  }
}
