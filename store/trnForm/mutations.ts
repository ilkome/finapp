export default {
  setTrnFormHeight(state, height) {
    state.height = height
  },

  setTrnFormModalCategoryId(state, id) {
    state.showModalCategoryId === id
      ? state.showModalCategoryId = null
      : state.showModalCategoryId = id
  },

  closeTrnFormModal(state, modalName) {
    state.modal[modalName] = false
  },

  showTrnFormModal(state, modalName) {
    state.modal[modalName] = true
  },

  closeTrnForm(state) {
    state.show = false
  },

  openTrnForm(state) {
    state.show = true
  },
}
