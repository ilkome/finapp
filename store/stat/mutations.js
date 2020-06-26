export default {
  setDiffPeriods (state, value) {
    const number = parseInt(value) || 1
    state.showedPeriods = number
  }
}
