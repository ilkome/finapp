export default {
  userUid (_state, _getters, rootState) {
    if (rootState.user && rootState.user.user && rootState.user.user)
      return rootState.user.user.uid
  },

  isTester (state) {
    const testerEmail = $nuxt.$config.testerEmail
    if (state.user && state.user.email === testerEmail) return true
    else return false
  }
}
