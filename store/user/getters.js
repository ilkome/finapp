export default {
  userUid (state, getters, rootState) {
    if (rootState.user && rootState.user.user && rootState.user.user) {
      return rootState.user.user.uid
    }
  },

  isTester (state) {
    // eslint-disable-next-line no-undef
    const testerEmail = $nuxt.$config.testerEmail
    if (state.user && state.user.email === testerEmail) { return true }
    else { return false }
  }
}
