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

  categoriesRootIds(state, getters) {
    if (!getters.hasCategories)
      return []

    return Object.keys(state.items)
      .filter(id => state.items[id].parentId === 0)
      .sort((a, b) => {
        if (state.items[a].order < state.items[b].order)
          return -1
        if (state.items[a].order > state.items[b].order)
          return 1
        return 0
      })
  },

  categoriesForBeParent(state, getters, rootState) {
    const categoriesItems = state.items
    const trnsItems = rootState.trns.items
    const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)

    return getters.categoriesRootIds.filter((categoryId) => {
      const hasTrnsIn = Object.values(trnsItems).some(trn => trn.categoryId === categoryId)
      const isTransferCategory = transferCategoriesIds.includes(categoryId)

      if (hasTrnsIn || isTransferCategory)
        return false

      return categoryId
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
      .filter(trnId => trnsItems[trnId].type !== 2)
      .sort((a, b) => trnsItems[b].date - trnsItems[a].date)

    const lastCategoriesIds = []

    for (const trnId of trnsIds.slice(0, 500)) {
      if (lastCategoriesIds.length > 16)
        break

      const categoryId = trnsItems[trnId].categoryId
      const category = state.items[categoryId]

      if (!category || !category.showInLastUsed)
        continue

      const isCategoryAlreadyAdded = lastCategoriesIds.includes(categoryId)
      const isTransferCategory = transferCategoriesIds.includes(categoryId)
      const isCategoryInQuickSelector = getters.quickSelectorCategoriesIds.includes(categoryId)

      if (!isCategoryAlreadyAdded && !isTransferCategory && !isCategoryInQuickSelector)
        lastCategoriesIds.push(categoryId)
    }

    lastCategoriesIds.sort((a, b) => {
      if (state.items[a].name > state.items[b].name)
        return 1
      if (state.items[a].name < state.items[b].name)
        return -1
      return 0
    })

    return lastCategoriesIds
  },

  quickSelectorCategoriesIds(state, getters) {
    if (!getters.hasCategories)
      return []

    return Object.keys(state.items)
      .filter(key => state.items[key].showInQuickSelector)
      .sort((a, b) => {
        if (state.items[a].name < state.items[b].name)
          return -1
        if (state.items[a].name > state.items[b].name)
          return 1
        return 0
      })
  },
}
