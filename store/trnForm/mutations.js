export default {
  setTrnFormValues(state, values) {
    state.values = {
      ...state.values,
      ...values,
    }
  },

  setTrnFormHeight(state, height) {
    state.height = height
  },

  setTrnFormModalCategoryId(state, id) {
    state.showModalCategoryId === id
      ? state.showModalCategoryId = null
      : state.showModalCategoryId = id
  },

  setTrnFormModalTrnId(state, id) {
    state.showModalTrnId === id
      ? state.showModalTrnId = null
      : state.showModalTrnId = id
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

  openTrnForm(state) { state.show = true },

  toggleTrnForm(state) {
    state.show = !state.show
  },
}
