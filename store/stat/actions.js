export default {
  setDiffPeriods ({ commit, dispatch }, value) {
    commit('setDiffPeriods', value)
    dispatch('ui/saveUiView', null, { root: true })
  }
}
