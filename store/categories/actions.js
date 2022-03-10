import localforage from 'localforage'
import { getDataAndWatch, unsubcribeData } from '~/services/firebase/api'

export default {
  initCategories({ dispatch, rootState }) {
    const uid = rootState.user.user.uid
    getDataAndWatch(`users/${uid}/categories`, (items) => {
      // add child categories to root categories
      for (const categoryId in items) {
        const parentCategoryId = items[categoryId].parentId
        if (parentCategoryId !== 0 && items[parentCategoryId]) {
          items[parentCategoryId].childIds
            ? !items[parentCategoryId].childIds.includes(categoryId) && items[parentCategoryId].childIds.push(categoryId)
            : items[parentCategoryId].childIds = [categoryId]
        }
      }

      for (const categoryId in items) {
        const cat = items[categoryId]
        if (cat.childIds) {
          items[categoryId] = {
            ...cat,
            showInLastUsed: false,
            showInQuickSelector: false,
          }

          for (const childCatId of cat.childIds) {
            if (!items[childCatId])
              items[categoryId].childIds = items[categoryId].childIds.filter(id => id !== childCatId)
          }
        }
      }

      dispatch('setCategories', items)
    })
  },

  setCategories({ commit }, items) {
    commit('setCategories', items)
    localforage.setItem('finapp.categories', items)
  },

  unsubcribeCategories({ rootState }) {
    const uid = rootState.user.user.uid
    unsubcribeData(`users/${uid}/categories`)
  },
}
