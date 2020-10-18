export default {
  setDiffPeriods (state, value) {
    const number = parseInt(value) || 1
    state.showedPeriods = number
  },

  setCategoryModalId (state, id) {
    state.categoryModal.id = id
  },

  setCategoryModalShow (state, value) {
    state.categoryModal.show = value
  }
}
