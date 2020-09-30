export default {
  setCategories (state, items) {
    const freezedItems = {}
    if (items) {
      for (const itemId of Object.keys(items)) {
        freezedItems[itemId] = Object.freeze(items[itemId])
      }
    }
    state.items = freezedItems
  },

  showCategoryModal (state) {
    state.modal.show = true
  },

  hideCategoryModal (state) {
    state.modal.show = false
  },

  setCategoryModalId (state, id) {
    if (state.modal.id === id) {
      state.modal.id = null
    }
    else {
      state.modal.id = id
    }
  },

  setCategoryEditId (state, id) {
    if (state.editId === id) {
      state.editId = null
    }
    else {
      state.editId = id
    }
  }
}
