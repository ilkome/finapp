export default {
  userUid(_state, _getters, rootState) {
    if (rootState?.user?.user)
      return rootState.user.user.uid
  },

  isDevUser(state) {
    if ($nuxt.$config.devEmails.includes(state.user?.email))
      return true
  },
}
