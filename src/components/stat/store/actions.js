export default {
  async initStat ({ rootState, dispatch, commit }) {
    //
  },

  setDiffPeriods ({ commit, dispatch }, value) {
    commit('setDiffPeriods', value)
    dispatch('saveUiView')
  }
}
