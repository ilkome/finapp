export default {
  setDiffPeriods(state, value) {
    state.showedPeriods = parseInt(value) || 1
  },

  setCategoryModal(state, { id, type }) {
    state.categoryModal.id = id
    state.categoryModal.type = type
  },
}
