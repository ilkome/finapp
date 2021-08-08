export default {
  userUid (_state, _getters, rootState) {
    if (rootState.user && rootState.user.user && rootState.user.user)
      return rootState.user.user.uid
  }
}
