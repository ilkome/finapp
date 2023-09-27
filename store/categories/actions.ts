import localforage from 'localforage'
import { getDataAndWatch, unsubscribeData } from '~/services/firebase/api'
import type { Categories } from '~/components/categories/types'

export default {
  initCategories({ dispatch, rootState }) {
    const uid = rootState.user.user.uid
    getDataAndWatch(`users/${uid}/categories`, (items: Categories) => {
      // add child categories to root categories
      for (const categoryId in items) {
        const parentCategoryId = items[categoryId].parentId
        if (parentCategoryId !== 0 && items[parentCategoryId]) {
          items[parentCategoryId].childIds
            ? !items[parentCategoryId].childIds?.includes(categoryId) && items[parentCategoryId].childIds?.push(categoryId)
            : items[parentCategoryId].childIds = [categoryId]
        }
      }

      // Add missing props
      for (const categoryId in items) {
        const cat = items[categoryId]

        if (cat.showInLastUsed === undefined) {
          items[categoryId] = {
            ...cat,
            showInLastUsed: false,
          }
        }

        if (cat.showInQuickSelector === undefined) {
          items[categoryId] = {
            ...cat,
            showInQuickSelector: false,
          }
        }

        if (cat.childIds) {
          items[categoryId] = {
            ...cat,
            showInLastUsed: false,
            showInQuickSelector: false,
          }

          for (const childCatId of cat.childIds) {
            if (!items[childCatId])
              items[categoryId].childIds = items[categoryId].childIds?.filter(id => id !== childCatId)
          }
        }
      }

      dispatch('setCategories', items)
    })
  },

  setCategories({ commit }, items: Categories) {
    commit('setCategories', items)
    localforage.setItem('finapp.categories', items)
  },

  unsubscribeCategories({ rootState }) {
    const uid = rootState.user.user.uid
    unsubscribeData(`users/${uid}/categories`)
  },
}
