import isEqual from 'lodash/isEqual'

export default {
  setCategories (state, items) {
    if (!isEqual(state.items, items)) {
      state.items = items
    }
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
    } else {
      state.modal.id = id
    }
  },

  setCategoryEditId (state, id) {
    if (state.editId === id) {
      state.editId = null
    } else {
      state.editId = id
    }
  }
}
