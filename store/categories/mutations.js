export default {
  setCategories(state, items) {
    const freezedItems = {}
    if (items) {
      for (const itemId of Object.keys(items))
        freezedItems[itemId] = Object.freeze(items[itemId])
    }
    state.items = {
      ...freezedItems,
      transfer: {
        color: 'var(--c-blue-1)',
        icon: 'mdi mdi-repeat',
        name: 'Transfer',
        order: 0,
        parentId: 0,
        childIds: [],
        showInLastUsed: false,
        showInQuickSelector: false,
        showStat: false,
      },
    }
  },

  showCategoryModal(state) {
    state.modal.show = true
  },

  hideCategoryModal(state) {
    state.modal.show = false
  },

  setCategoryModalId(state, id) {
    state.modal.id === id
      ? state.modal.id = null
      : state.modal.id = id
  },

  setCategoryEditId(state, id) {
    state.editId === id
      ? state.editId = null
      : state.editId = id
  },
}
