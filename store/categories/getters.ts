import _sortby from 'lodash.sortby'
import type { TrnID, TrnItem } from '~/components/trns/types'
import type { CategoryID, CategoryItem } from '~/components/categories/types'
import { getTransferCategoriesIds } from '~/components/categories/getCategories'

export default {
  hasCategories(state) {
    if (!state.items)
      return false

    // More than 1 because categories has 1 static category "Transfer"
    // TODO: use get transfers categories and exclude them from the list
    if (Object.keys(state.items).length > 1)
      return true
  },

  categoriesIds(state, getters) {
    if (!getters.hasCategories)
      return []
    return Object.keys(state.items)
  },

  /**
   * Categories root IDs
   */
  categoriesRootIds(state, getters): CategoryID[] {
    if (!getters.hasCategories)
      return []

    return Object.keys(state.items)
      .filter(id => state.items[id].parentId === 0)
      .sort((a, b) => state.items[a].name.localeCompare(state.items[b].name))
  },

  categoriesForBeParent(state, getters, rootState) {
    const categoriesItems: Record<CategoryID, CategoryItem> = state.items
    const trnsItems: Record<TrnID, TrnItem> = rootState.trns.items
    const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)

    return getters.categoriesRootIds.filter((id: CategoryID) => {
      const hasTrnsInCategory = Object.values(trnsItems).some(trn => trn.categoryId === id)
      const isTransferCategory = transferCategoriesIds.includes(id)

      if (hasTrnsInCategory || isTransferCategory)
        return false

      return id
    })
  },

  isCategoryHasChildren: (state, getters) => (categoryId) => {
    if (!getters.hasCategories)
      return []

    return state.items[categoryId].childIds?.length > 0
  },

  getChildCategoriesIds: (state, getters) => (categoryId) => {
    if (!getters.hasCategories)
      return []

    return state.items[categoryId]?.childIds || []
  },

  lastUsedCategoriesIdsByDate(state, getters, rootState, rootGetters) {
    if (!getters.hasCategories || !rootGetters['trns/hasTrns'])
      return []

    const trnsItems = rootState.trns.items
    const categoriesItems = rootState.categories.items
    const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)

    const trnsIds = Object.keys(trnsItems)
      .filter(id => trnsItems[id].type !== 2)
      .sort((a, b) => trnsItems[b].date - trnsItems[a].date)

    const lastCategories = []

    // TODO: map, filter
    for (const trnId of trnsIds) {
      if (lastCategories.length > 16)
        break

      const categoryId = trnsItems[trnId].categoryId
      const category = state.items[categoryId]

      if (!category || ('showInLastUsed' in category && !category.showInLastUsed))
        continue

      const isCategoryAlreadyAdded = lastCategories.some(c => c.id === categoryId)
      const isTransferCategory = transferCategoriesIds.includes(categoryId)
      const isCategoryInQuickSelector = getters.favoriteCategoriesIds.includes(categoryId)

      if (!isCategoryAlreadyAdded && !isTransferCategory && !isCategoryInQuickSelector) {
        lastCategories.push({
          id: categoryId,
          ...category,
        })
      }
    }

    return _sortby(lastCategories, category =>
      [state.items[category.parentId]?.name || false, category.name])
      .map(c => c.id)
  },

  favoriteCategoriesIds(state, getters) {
    if (!getters.hasCategories)
      return []

    const filteredCategories = Object.keys(state.items)
      .filter(id => state.items[id].showInQuickSelector)
      .map(id => ({ id, ...state.items[id] }))

    return _sortby(filteredCategories, category =>
      [state.items[category.parentId]?.name || false, category.name])
      .map(c => c.id)
  },
}
