export default {
  closeTrnFormModal(state, modalName) {
    state.modal[modalName] = false
  },

  showTrnFormModal(state, modalName) {
    state.modal[modalName] = true
  },
}
