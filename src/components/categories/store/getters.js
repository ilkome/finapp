// categoriesRootIds
// categoriesForBeParent
// getChildCategoriesIds
// lastUsedCategoriesIds

export default {
  hasCategories (state, getters, rootState) {
    if (rootState.categories.items) {
      if (Object.keys(rootState.categories.items).length > 0) {
        return true
      }
    }
    return false
  },

  categoriesRootIds (state, getters, rootState, rootGetters) {
    if (!rootGetters.hasCategories) return []

    const categories = rootState.categories.items
    return Object.keys(categories)
      .filter(key => categories[key].parentId === 0)
      .sort((a, b) => {
        if (categories[a].name < categories[b].name) return -1
        if (categories[a].name > categories[b].name) return 1
        return 0
      })
  },

  categoriesForBeParent (state, getters, rootState, rootGetters) {
    const categoriesRootIds = rootGetters.categoriesRootIds
    const trns = rootState.trns.items
    const categoriesForBeParent = []

    for (const categoryId of categoriesRootIds) {
      let isTrns = false
      for (const trnId in trns) {
        if (trns[trnId].categoryId === categoryId) {
          isTrns = true
          break
        }
      }
      if (!isTrns) {
        categoriesForBeParent.push(categoryId)
      }
    }

    return categoriesForBeParent
  },

  getChildCategoriesIds: (state, getters, rootState, rootGetters) => (categoryId) => {
    if (!rootGetters.hasCategories) return []

    const categories = rootState.categories.items
    const category = categories[categoryId]
    let childIds = []

    if (category && categories[categoryId].parentId === 0) {
      childIds = Object.keys(categories)
        .filter(key => categories[key].parentId === categoryId)
        .sort((a, b) => {
          if (categories[a].name < categories[b].name) return -1
          if (categories[a].name > categories[b].name) return 1
          return 0
        })
    }
    return childIds
  },

  lastUsedCategoriesIds (state, getters, rootState, rootGetters) {
    const categories = rootState.categories.items
    const trns = rootState.trns.items
    const sortedTrnsIds = rootGetters.sortedTrnsIds
    const transferCategoryId = rootGetters.transferCategoryId
    let lastCategoriesIds = []

    if (categories && rootGetters.hasTrns) {
      for (const trnId of sortedTrnsIds.slice(0, 50)) {
        if (lastCategoriesIds.length < 12) {
          const categoryId = trns[trnId].categoryId
          const category = categories[categoryId]
          if (category && (category.showInLastUsed || category.showInLastUsed === undefined)) {
            if (categoryId !== transferCategoryId) {
              if (!lastCategoriesIds.includes(categoryId)) lastCategoriesIds.push(categoryId)
            }
          }
        }
      }

      return lastCategoriesIds
        .sort((a, b) => {
          if (categories[a] && categories[b]) {
            if (categories[a].name < categories[b].name) return -1
            if (categories[a].name > categories[b].name) return 1
            return 0
          }
        })
    }
  },

  transferCategoryId (state, getters, rootState, rootGetters) {
    if (!rootGetters.hasCategories) return null

    const categories = rootState.categories.items
    return Object.keys(categories)
      .find(id => categories[id].name === 'Перевод' ||
                  categories[id].name === 'Transfer')
  }
}
