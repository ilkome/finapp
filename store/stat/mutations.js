export default {
  setDiffPeriods (state, value) {
    const number = parseInt(value) || 1
    state.showedPeriods = number
  },

  setCategoryModal (state, { id, type }) {
    state.categoryModal.id = id
    state.categoryModal.type = type
  }
}
